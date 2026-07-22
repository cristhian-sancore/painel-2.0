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

    revalidatePath("/groups");
    return { success: true, data: group };
  } catch (error: any) {
    console.error("updateGroupAction error:", error);
    if (error.code === 'P2002') return { success: false, error: "Já existe um grupo com este nome." };
    return { success: false, error: error.message };
  }
}
