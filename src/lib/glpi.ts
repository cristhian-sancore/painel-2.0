export class GLPIClient {
  private url: string;
  private appToken: string;
  private userToken: string;
  private sessionToken: string | null = null;

  constructor() {
    this.url = process.env.GLPI_API_URL || "";
    this.appToken = process.env.GLPI_APP_TOKEN || "";
    this.userToken = process.env.GLPI_USER_TOKEN || "";
  }

  private async getHeaders(includeSession = true) {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "App-Token": this.appToken,
    };

    if (includeSession) {
      if (!this.sessionToken) {
        await this.initSession();
      }
      if (this.sessionToken) {
        headers["Session-Token"] = this.sessionToken;
      }
    }

    return headers;
  }

  public async initSession() {
    try {
      const response = await fetch(`${this.url}/initSession`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "App-Token": this.appToken,
          "Authorization": `user_token ${this.userToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`GLPI initSession failed: ${response.statusText}`);
      }

      const data = await response.json();
      this.sessionToken = data.session_token;
      return this.sessionToken;
    } catch (error) {
      console.error("Erro ao inicializar sessão no GLPI:", error);
      return null;
    }
  }

  public async killSession() {
    if (!this.sessionToken) return;
    
    await fetch(`${this.url}/killSession`, {
      method: "GET",
      headers: await this.getHeaders(true),
    });
    this.sessionToken = null;
  }

  public async getTickets() {
    try {
      const headers = await this.getHeaders();
      const response = await fetch(`${this.url}/Ticket`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tickets");
      }

      return await response.json();
    } catch (error) {
      console.error("Erro ao buscar tickets no GLPI:", error);
      return [];
    }
  }
}

export const glpiClient = new GLPIClient();
