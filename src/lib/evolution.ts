export class EvolutionClient {
  private url: string;
  private apiKey: string;

  constructor() {
    this.url = process.env.EVOLUTION_API_URL || "";
    this.apiKey = process.env.EVOLUTION_API_KEY || "";
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
    const chatwootUrl = process.env.CHATWOOT_API_URL || "";
    const chatwootToken = process.env.CHATWOOT_ACCESS_TOKEN || "";

    if (!chatwootUrl || !chatwootToken) {
      throw new Error("Credenciais do Chatwoot ausentes no .env");
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
