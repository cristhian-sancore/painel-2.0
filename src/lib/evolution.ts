import { prisma } from "./prisma";

export class EvolutionClient {
  private url: string = "";
  private apiKey: string = "";

  private constructor() {}

  public static async init() {
    const client = new EvolutionClient();
    
    // Buscar do BD
    const urlSetting = await prisma.setting.findUnique({ where: { key: "evolution_url" } });
    const keySetting = await prisma.setting.findUnique({ where: { key: "evolution_key" } });
    
    client.url = urlSetting?.value || process.env.EVOLUTION_API_URL || "";
    client.apiKey = keySetting?.value || process.env.EVOLUTION_API_KEY || "";
    
    if (!client.url || !client.apiKey) {
      throw new Error("As configurações da API Evolution não foram definidas no painel. Vá em Configurações Globais.");
    }

    // Remover a / do final se existir
    if (client.url.endsWith('/')) {
      client.url = client.url.slice(0, -1);
    }
    
    return client;
  }

  private get headers() {
    return {
      "Content-Type": "application/json",
      apikey: this.apiKey,
    };
  }

  // 1. List Instances
  public async getInstances() {
    const res = await fetch(`${this.url}/instance/fetchInstances`, {
      method: "GET",
      headers: this.headers,
    });
    
    if (!res.ok) {
      console.error(`Evolution API Error: ${res.status} - ${res.statusText}`);
      return [];
    }

    return await res.json();
  }

  // 2. Create Instance & Get QR Code
  public async createInstance(instanceName: string) {
    const res = await fetch(`${this.url}/instance/create`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        instanceName: instanceName.replace(/\s+/g, '-').toLowerCase(),
        qrcode: true,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create instance: ${errorText}`);
    }

    return await res.json();
  }

  // 3. Connect to Chatwoot
  public async connectToChatwoot(instanceName: string, accountId: number) {
    const chatwootUrlSetting = await prisma.setting.findUnique({ where: { key: "chatwoot_url" } });
    const chatwootTokenSetting = await prisma.setting.findUnique({ where: { key: "chatwoot_token" } });

    const chatwootUrl = chatwootUrlSetting?.value || process.env.CHATWOOT_API_URL || "";
    const chatwootToken = chatwootTokenSetting?.value || process.env.CHATWOOT_ACCESS_TOKEN || "";

    if (!chatwootUrl || !chatwootToken) {
      throw new Error("Credenciais do Chatwoot ausentes. Vá em Configurações Globais para configurar.");
    }

    const res = await fetch(`${this.url}/chatwoot/set/${instanceName}`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        enabled: true,
        accountId: accountId,
        token: chatwootToken,
        url: chatwootUrl,
        signMsg: true,
        reopenConversation: true,
        conversationPending: false,
        nameInbox: `WhatsApp - ${instanceName}`,
        mergeBrazilContacts: true,
        importContacts: true,
        importMessages: true,
        daysLimitImportMessages: 3
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to connect to Chatwoot: ${errorText}`);
    }

    return await res.json();
  }
}
