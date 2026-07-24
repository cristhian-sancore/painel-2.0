"use server";

import { EvolutionClient } from "@/lib/evolution";
import { ChatwootClient } from "@/lib/chatwoot";
import { prisma } from "@/lib/prisma";

export async function createWhatsAppInstance(formData: FormData) {
  const instanceName = formData.get("instanceName") as string;
  const teamId = formData.get("teamId") as string;
  
  if (!instanceName) {
    return { error: "Nome da instância é obrigatório" };
  }

  try {
    const evo = await EvolutionClient.init();
    const chatwoot = await ChatwootClient.init();

    // 1. Get Chatwoot Account ID
    const accountId = await chatwoot.setAccountId();

    // 2. Create Instance in Evolution API
    const instanceData = await evo.createInstance(instanceName);
    const generatedName = instanceData.instance?.instanceName || instanceName.replace(/\s+/g, '-').toLowerCase();
    const qrCodeBase64 = instanceData.qrcode?.base64 || "";

    // 3. Connect the Instance to Chatwoot
    await evo.connectToChatwoot(generatedName, accountId);

    // 4. Atribuir à Inbox recém-criada (ou criar fallback se não existir)
    try {
      // Pausa breve para dar tempo do webhook/Evolution criar a inbox
      await new Promise(r => setTimeout(r, 1500));
      
      const inboxesResponse = await chatwoot.getInboxes();
      const inboxes = inboxesResponse.payload || inboxesResponse;
      
      // Procura a inbox criada (Evolution usa 'WhatsApp - ' + nome)
      let targetInbox = inboxes.find((i: any) => i.name === `WhatsApp - ${generatedName}`);
      
      // Fallback: Se a Evolution não criou a inbox, criamos manualmente
      if (!targetInbox) {
        const evolutionUrlSetting = await prisma.setting.findUnique({ where: { key: "evolution_url" } });
        let evolutionUrl = evolutionUrlSetting?.value || process.env.EVOLUTION_API_URL || "http://localhost:8081";
        if (evolutionUrl.endsWith('/')) evolutionUrl = evolutionUrl.slice(0, -1);
        
        const webhookUrl = `${evolutionUrl}/chatwoot/webhook/${generatedName}`;
        const newInbox = await chatwoot.createApiInbox(`WhatsApp - ${generatedName}`, webhookUrl);
        targetInbox = newInbox;
      }

      if (targetInbox) {
        // Atualiza as configurações da Inbox recém-criada para forçar "Reabrir a mesma conversa"
        try {
          await chatwoot.updateInboxSettings(targetInbox.id, { lock_to_single_conversation: true });
        } catch (updateErr) {
          console.error("Erro ao configurar lock_to_single_conversation:", updateErr);
        }

        let userIds: number[] = [];

        if (teamId && teamId !== "") {
          const membersResponse = await chatwoot.getTeamMembers(Number(teamId));
          const members = membersResponse.payload || membersResponse;
          userIds = members.map((m: any) => m.id || m.user_id);
        }

        // Busca agentes e adiciona pelo menos 1 administrador para a caixa não ficar invisível
        const agentsRes = await chatwoot.getAgents();
        const agents = agentsRes.payload || agentsRes;
        const admin = agents.find((a: any) => a.role === "administrator");
        if (admin && !userIds.includes(admin.id)) {
          userIds.push(admin.id);
        }

        if (userIds.length > 0) {
          await chatwoot.assignMembersToInbox(targetInbox.id, userIds);
        }
      }
    } catch (e) {
      console.error("Erro ao atribuir time à inbox ou criar inbox fallback:", e);
      // Não falha a criação da instância se falhar apenas a atribuição/criação da inbox
    }

    return { 
      success: true, 
      qrCode: qrCodeBase64,
      instanceName: generatedName,
      message: "Instância criada e conectada ao Chatwoot com sucesso!" 
    };

  } catch (err: any) {
    console.error("Erro na criação da instância:", err);
    return { error: err.message };
  }
}

export async function fetchInstancesAction() {
  try {
    const evo = await EvolutionClient.init();
    const data = await evo.getInstances();
    return { success: true, data };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteInstanceAction(instanceName: string) {
  try {
    const evo = await EvolutionClient.init();
    const chatwoot = await ChatwootClient.init();
    
    // 1. Apaga do Evolution
    await evo.deleteInstance(instanceName);

    // 2. Apaga a Caixa no Chatwoot (Opcional, tentamos por melhor esforço)
    try {
      const inboxesResponse = await chatwoot.getInboxes();
      const inboxes = inboxesResponse.payload || inboxesResponse;
      const targetInbox = inboxes.find((i: any) => i.name === `WhatsApp - ${instanceName}`);
      if (targetInbox) {
        await chatwoot.deleteInbox(targetInbox.id);
      }
    } catch (e) {
      console.error("Erro ao deletar inbox do chatwoot:", e);
    }

    return { success: true, message: "Instância removida com sucesso" };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function getQrCodeAction(instanceName: string) {
  try {
    const evo = await EvolutionClient.init();
    const data = await evo.getQrCode(instanceName);
    return { success: true, base64: data.base64 || data.qrcode?.base64 };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function fetchTeamsAction() {
  try {
    const chatwoot = await ChatwootClient.init();
    const res = await chatwoot.getTeams();
    const teams = res.payload || res;
    return { success: true, data: teams };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function reconnectInstanceAction(instanceName: string) {
  try {
    const evo = await EvolutionClient.init();
    
    // 1. Logout existing session
    try {
      await evo.logoutInstance(instanceName);
    } catch (e: any) {
      console.log(`Logout failed for ${instanceName}, might already be disconnected. Proceeding to get QR.`);
    }

    // 2. Fetch new QR code
    const data = await evo.getQrCode(instanceName);
    return { success: true, base64: data.base64 || data.qrcode?.base64, message: "Sessão desconectada. Leia o novo QR Code." };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function resyncChatwootAction(instanceName: string) {
  try {
    const evo = await EvolutionClient.init();
    const chatwoot = await ChatwootClient.init();
    const accountId = await chatwoot.setAccountId();
    
    await evo.connectToChatwoot(instanceName, accountId);
    return { success: true, message: "Integração com Chatwoot sincronizada com sucesso!" };
  } catch (err: any) {
    return { error: err.message };
  }
}
