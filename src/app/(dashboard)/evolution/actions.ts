"use server";

import { EvolutionClient } from "@/lib/evolution";
import { ChatwootClient } from "@/lib/chatwoot";

export async function createWhatsAppInstance(formData: FormData) {
  const instanceName = formData.get("instanceName") as string;
  if (!instanceName) {
    return { error: "Nome da instância é obrigatório" };
  }

  try {
    const evo = new EvolutionClient();
    const chatwoot = new ChatwootClient();

    // 1. Get Chatwoot Account ID
    const accountId = await chatwoot.setAccountId();

    // 2. Create Instance in Evolution API
    const instanceData = await evo.createInstance(instanceName);
    const generatedName = instanceData.instance?.instanceName || instanceName.replace(/\s+/g, '-').toLowerCase();
    const qrCodeBase64 = instanceData.qrcode?.base64 || "";

    // 3. Connect the Instance to Chatwoot
    await evo.connectToChatwoot(generatedName, accountId);

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
