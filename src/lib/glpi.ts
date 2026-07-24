import { prisma } from "./prisma";

export class GlpiClient {
  private url: string = "";
  private appToken: string = "";
  private userToken: string = "";
  private sessionToken: string | null = null;

  private constructor() {}

  public static async init() {
    const client = new GlpiClient();
    
    // Buscar do BD
    const urlSetting = await prisma.setting.findUnique({ where: { key: "glpi_url" } });
    const appTokenSetting = await prisma.setting.findUnique({ where: { key: "glpi_app_token" } });
    const userTokenSetting = await prisma.setting.findUnique({ where: { key: "glpi_user_token" } });
    
    client.url = urlSetting?.value || process.env.GLPI_API_URL || "";
    client.appToken = appTokenSetting?.value || process.env.GLPI_APP_TOKEN || "";
    client.userToken = userTokenSetting?.value || process.env.GLPI_USER_TOKEN || "";
    
    if (!client.url || !client.appToken || !client.userToken) {
      throw new Error("As configurações da API do GLPI não foram definidas no painel. Vá em Configurações Globais.");
    }

    if (client.url.endsWith('/')) {
      client.url = client.url.slice(0, -1);
    }
    
    return client;
  }

  private get headers() {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
      "App-Token": this.appToken,
    };
    if (this.sessionToken) {
      h["Session-Token"] = this.sessionToken;
    }
    return h;
  }

  public async initSession() {
    const res = await fetch(`${this.url}/initSession`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "App-Token": this.appToken,
        "Authorization": `user_token ${this.userToken}`
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to init GLPI session: ${res.statusText} - ${errorText}`);
    }

    const data = await res.json();
    this.sessionToken = data.session_token;
    return this.sessionToken;
  }

  public async killSession() {
    if (!this.sessionToken) return;
    
    await fetch(`${this.url}/killSession`, {
      method: "GET",
      headers: this.headers,
    });
    this.sessionToken = null;
  }

  // Find User by email or phone
  public async findUser(searchTerm: string) {
    if (!this.sessionToken) await this.initSession();

    // In GLPI, we can search using standard criteria
    const searchUrl = new URL(`${this.url}/search/User`);
    searchUrl.searchParams.append("criteria[0][field]", "5"); // 5 is usually email in GLPI search
    searchUrl.searchParams.append("criteria[0][searchtype]", "contains");
    searchUrl.searchParams.append("criteria[0][value]", searchTerm);

    const res = await fetch(searchUrl.toString(), {
      method: "GET",
      headers: this.headers,
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.data && data.data.length > 0 ? data.data[0] : null;
  }

  // Get active tickets
  public async getTickets() {
    if (!this.sessionToken) await this.initSession();

    const res = await fetch(`${this.url}/Ticket?expand_dropdowns=true&range=0-50`, {
      method: "GET",
      headers: this.headers,
    });

    if (!res.ok) {
      throw new Error("Failed to fetch GLPI tickets");
    }

    return await res.json();
  }

  // Create Ticket
  public async createTicket(title: string, content: string, requesterId?: number) {
    if (!this.sessionToken) await this.initSession();

    const payload: any = {
      input: {
        name: title,
        content: content,
        status: 1, // New
        urgency: 3 // Medium
      }
    };

    if (requesterId) {
      payload.input._users_id_requester = requesterId;
    }

    const res = await fetch(`${this.url}/Ticket`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to create GLPI ticket: ${errorText}`);
    }

    const data = await res.json();
    return data; // Returns { id: <ticket_id>, message: ... }
  }
}
