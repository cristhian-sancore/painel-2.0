"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { ChatwootClient } from "@/lib/chatwoot";

export async function fetchGroupsAction() {
  try {
    const groups = await prisma.accessGroup.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: groups };
  } catch (error: any) {
    console.error("fetchGroupsAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchChatwootInboxesAction() {
  try {
    const cw = await ChatwootClient.init();
    const inboxes = await cw.getInboxes();
    return { success: true, data: inboxes.map((i: any) => ({ id: i.id, name: i.name })) };
  } catch (error: any) {
    console.error("fetchChatwootInboxesAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function fetchGroupInboxesAction(groupId: string) {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: `group_inboxes_${groupId}` } });
    if (!setting) return { success: true, data: [] };
    return { success: true, data: JSON.parse(setting.value) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function createGroupAction(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const permissionsStr = formData.get("permissions") as string; // Will come as JSON string or we can parse it
    const createTeamInChatwoot = formData.get("createTeamInChatwoot") === "true";
    
    if (!name) return { success: false, error: "Nome é obrigatório." };

    const group = await prisma.accessGroup.create({
      data: {
        name,
        permissions: permissionsStr || "[]",
      },
    });

    const inboxesStr = formData.get("chatwootInboxes") as string;
    if (inboxesStr) {
      await prisma.setting.upsert({
        where: { key: `group_inboxes_${group.id}` },
        update: { value: inboxesStr },
        create: { key: `group_inboxes_${group.id}`, value: inboxesStr }
      });
    }

    let chatwootMessage = "";
    if (createTeamInChatwoot) {
      try {
        const cw = await ChatwootClient.init();
        await cw.createTeam(name, "Criado automaticamente pelo painel.");
        chatwootMessage = " Equipe criada no Chatwoot.";
      } catch (cwError: any) {
        console.error("Erro ao criar equipe no Chatwoot:", cwError);
        chatwootMessage = " (Erro ao criar equipe no Chatwoot: " + cwError.message + ")";
      }
    }

    // GLPI Sync for Group
    try {
      const { GlpiClient } = require("@/lib/glpi");
      const glpi = await GlpiClient.init();
      console.log("[GLPI Sync] Sincronizando grupo:", group.name);
      let glpiGroupId = null;
      let glpiGroup = await glpi.findGroup(group.name);
      if (!glpiGroup) {
        console.log("[GLPI Sync] Criando novo grupo GLPI...");
        glpiGroupId = await glpi.createGroup(group.name);
      } else {
        glpiGroupId = glpiGroup.id;
      }
      if (glpiGroupId) {
        await prisma.accessGroup.update({
          where: { id: group.id },
          data: { glpiGroupId }
        });
        console.log(`[GLPI Sync] Grupo sincronizado com sucesso. GLPI ID: ${glpiGroupId}`);
      }
    } catch (glpiErr: any) {
      console.error("[GLPI Sync] Falha ao sincronizar grupo com o GLPI:", glpiErr.message);
    }

    revalidatePath("/groups");
    return { success: true, data: group, message: "Grupo criado com sucesso!" + chatwootMessage };
  } catch (error: any) {
    console.error("createGroupAction error:", error);
    if (error.code === 'P2002') return { success: false, error: "Já existe um grupo com este nome." };
    return { success: false, error: error.message };
  }
}

export async function deleteGroupAction(id: string) {
  try {
    // Check if there are users in this group
    const usersCount = await prisma.user.count({ where: { accessGroupId: id } });
    if (usersCount > 0) {
      return { success: false, error: `Existem ${usersCount} usuários vinculados a este grupo. Remova-os primeiro.` };
    }

    await prisma.accessGroup.delete({
      where: { id },
    });

    revalidatePath("/groups");
    return { success: true };
  } catch (error: any) {
    console.error("deleteGroupAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateGroupAction(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const permissionsStr = formData.get("permissions") as string;
    
    if (!name) return { success: false, error: "Nome é obrigatório." };

    const group = await prisma.accessGroup.update({
      where: { id },
      data: {
        name,
        permissions: permissionsStr || "[]",
      },
    });

    const inboxesStr = formData.get("chatwootInboxes") as string;
    if (inboxesStr) {
      await prisma.setting.upsert({
        where: { key: `group_inboxes_${group.id}` },
        update: { value: inboxesStr },
        create: { key: `group_inboxes_${group.id}`, value: inboxesStr }
      });
    }

    // GLPI Sync for Group on Update
    try {
      const { GlpiClient } = require("@/lib/glpi");
      const glpi = await GlpiClient.init();
      console.log("[GLPI Sync] Sincronizando grupo na edição:", group.name);
      let glpiGroupId = group.glpiGroupId;
      if (!glpiGroupId) {
        let glpiGroup = await glpi.findGroup(group.name);
        if (!glpiGroup) {
          console.log("[GLPI Sync] Criando novo grupo GLPI a partir da edição...");
          glpiGroupId = await glpi.createGroup(group.name);
        } else {
          glpiGroupId = glpiGroup.id;
        }
        if (glpiGroupId) {
          await prisma.accessGroup.update({
            where: { id: group.id },
            data: { glpiGroupId }
          });
          console.log(`[GLPI Sync] Grupo sincronizado com sucesso na edição. GLPI ID: ${glpiGroupId}`);
        }
      }
    } catch (glpiErr: any) {
      console.error("[GLPI Sync] Falha ao sincronizar grupo com o GLPI na edição:", glpiErr.message);
    }

    revalidatePath("/groups");
    return { success: true, data: group };
  } catch (error: any) {
    console.error("updateGroupAction error:", error);
    if (error.code === 'P2002') return { success: false, error: "Já existe um grupo com este nome." };
    return { success: false, error: error.message };
  }
}
