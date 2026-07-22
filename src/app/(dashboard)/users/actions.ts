"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcrypt";


export async function fetchUsersAction() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        accessGroup: true
      }
    });
    // Remove passwords before sending to client
    const safeUsers = users.map(u => ({
      ...u,
      password: ""
    }));
    return { success: true, data: safeUsers };
  } catch (error: any) {
    console.error("fetchUsersAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function createUserAction(formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const cpf = formData.get("cpf") as string;
    const birthDateStr = formData.get("birthDate") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const accessGroupId = formData.get("accessGroupId") as string;
    
    if (!name || !email || !password) {
      return { success: false, error: "Nome, Email e Senha são obrigatórios." };
    }

    const birthDate = birthDateStr ? new Date(birthDateStr) : null;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "E-mail já está em uso no painel." };
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. Create User in Panel Database
    const newUser = await prisma.user.create({
      data: {
        name,
        cpf,
        birthDate,
        email,
        password: hashedPassword,
        accessGroupId: accessGroupId || null
      },
      include: {
        accessGroup: true
      }
    });

    // 2. Integration with Chatwoot via Platform API
    const platformTokenSetting = await prisma.setting.findUnique({ where: { key: "chatwoot_platform_token" } });
    const chatwootUrlSetting = await prisma.setting.findUnique({ where: { key: "chatwoot_url" } });
    const chatwootUrl = chatwootUrlSetting?.value || "https://chatwoot2.cristhiansancore.com.br";

    if (platformTokenSetting && platformTokenSetting.value) {
      const platformToken = platformTokenSetting.value;
      console.log("[Chatwoot Sync] Iniciando criação de usuário na Platform API...");
      
      const role = newUser.accessGroup?.name.toLowerCase() === "administrador" ? "administrator" : "agent";

      const chatwootRes = await fetch(`${chatwootUrl}/platform/api/v1/users`, {
        method: "POST",
        headers: {
          "api_access_token": platformToken,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          password: password, // Sending plain password so Chatwoot can hash it internally
        })
      });

      if (chatwootRes.ok) {
        const cwUser: any = await chatwootRes.json();
        console.log("[Chatwoot Sync] Usuário criado no Chatwoot com ID:", cwUser.id);
        
        // Link user to account 1 (assumed default account)
        const linkRes = await fetch(`${chatwootUrl}/platform/api/v1/accounts/1/account_users`, {
          method: "POST",
          headers: {
            "api_access_token": platformToken,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            user_id: cwUser.id,
            role: role
          })
        });
        
        if (!linkRes.ok) {
           console.error("[Chatwoot Sync] Falha ao vincular usuário à conta:", await linkRes.text());
        } else {
           console.log("[Chatwoot Sync] Usuário vinculado com sucesso à conta 1 como", role);
           
           // If user has an accessGroup, try to add them to the corresponding Chatwoot Team
           if (newUser.accessGroup && newUser.accessGroup.name) {
             try {
               const { ChatwootClient } = require("@/lib/chatwoot");
               const cwClient = await ChatwootClient.init();
               
               const teamsRes = await cwClient.getTeams();
               const teams = Array.isArray(teamsRes) ? teamsRes : (teamsRes.payload || []);
               
               const targetTeam = teams.find((t: any) => t.name.toLowerCase() === newUser.accessGroup!.name.toLowerCase());
               
               if (targetTeam) {
                 await cwClient.addTeamMember(targetTeam.id, [cwUser.id]);
                 console.log(`[Chatwoot Sync] Usuário adicionado com sucesso à equipe ${targetTeam.name}`);
               } else {
                 console.log(`[Chatwoot Sync] Nenhuma equipe encontrada no Chatwoot com o nome ${newUser.accessGroup.name}`);
               }
             } catch (teamErr) {
               console.error("[Chatwoot Sync] Erro ao adicionar usuário à equipe:", teamErr);
             }
           }
        }
      } else {
        const errText = await chatwootRes.text();
        console.error("[Chatwoot Sync] Erro na API do Chatwoot:", errText);
        // We don't block the panel user creation if Chatwoot fails, but we log it.
        // In a real scenario, we might want to return a warning message to the user.
      }
    } else {
      console.warn("[Chatwoot Sync] Token da Platform API não encontrado. O usuário não foi sincronizado com o Chatwoot.");
    }

    revalidatePath("/users");
    return { success: true, message: "Usuário criado com sucesso!" };
  } catch (error: any) {
    console.error("createUserAction error:", error);
    if (error.code === 'P2002') return { success: false, error: "CPF ou E-mail já cadastrado." };
    return { success: false, error: error.message };
  }
}

export async function deleteUserAction(id: string) {
  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    console.error("deleteUserAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateUserAction(id: string, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const cpf = formData.get("cpf") as string;
    const birthDateStr = formData.get("birthDate") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const accessGroupId = formData.get("accessGroupId") as string;
    
    if (!name || !email) {
      return { success: false, error: "Nome e Email são obrigatórios." };
    }

    const birthDate = birthDateStr ? new Date(birthDateStr) : null;

    // Check if another user has this email
    const existingUser = await prisma.user.findFirst({
      where: { 
        email,
        id: { not: id }
      }
    });

    if (existingUser) {
      return { success: false, error: "E-mail já está em uso por outro usuário." };
    }

    const dataToUpdate: any = {
      name,
      cpf,
      birthDate,
      email,
      accessGroupId: accessGroupId || null
    };

    // If a new password is provided, hash it
    if (password && password.trim() !== "") {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    // 1. Update User in Panel Database
    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate,
      include: {
        accessGroup: true
      }
    });

    // We skip Chatwoot sync for now on update unless requested, 
    // as updating emails/passwords in Chatwoot via Platform API has specific quirks.
    // However, if the user was assigned to an accessGroup, we can try to add them to the Chatwoot Team
    if (updatedUser.accessGroup && updatedUser.accessGroup.name) {
      try {
        const { ChatwootClient } = require("@/lib/chatwoot");
        const cwClient = await ChatwootClient.init();
        
        // Find user by email in Chatwoot to get their ID
        const platformTokenSetting = await prisma.setting.findUnique({ where: { key: "chatwoot_platform_token" } });
        const chatwootUrlSetting = await prisma.setting.findUnique({ where: { key: "chatwoot_url" } });
        const chatwootUrl = chatwootUrlSetting?.value || "https://chatwoot2.cristhiansancore.com.br";
        
        if (platformTokenSetting && platformTokenSetting.value) {
          const platformToken = platformTokenSetting.value;
          const searchRes = await fetch(`${chatwootUrl}/platform/api/v1/users`, {
            headers: { "api_access_token": platformToken }
          });
          
          if (searchRes.ok) {
            const usersList = await searchRes.json();
            const cwUser = usersList.find((u: any) => u.email === updatedUser.email);
            
            if (cwUser) {
              const teamsRes = await cwClient.getTeams();
              const teams = Array.isArray(teamsRes) ? teamsRes : (teamsRes.payload || []);
              const targetTeam = teams.find((t: any) => t.name.toLowerCase() === updatedUser.accessGroup!.name.toLowerCase());
              
              if (targetTeam) {
                await cwClient.addTeamMember(targetTeam.id, [cwUser.id]);
                console.log(`[Chatwoot Sync] Usuário atualizado adicionado com sucesso à equipe ${targetTeam.name}`);
              }
            }
          }
        }
      } catch (teamErr) {
        console.error("[Chatwoot Sync] Erro ao atualizar equipe do usuário:", teamErr);
      }
    }

    revalidatePath("/users");
    return { success: true, message: "Usuário atualizado com sucesso!" };
  } catch (error: any) {
    console.error("updateUserAction error:", error);
    if (error.code === 'P2002') return { success: false, error: "CPF ou E-mail já cadastrado." };
    return { success: false, error: error.message };
  }
}
