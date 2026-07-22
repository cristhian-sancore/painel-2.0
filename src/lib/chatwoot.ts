import { prisma } from "./prisma";

export class ChatwootClient {
  private url: string = "";
  private accessToken: string = "";
  private accountId: number | null = null;

  private constructor() {}

  public static async init() {
    const client = new ChatwootClient();
    
    const urlSetting = await prisma.setting.findUnique({ where: { key: "chatwoot_url" } });
    const tokenSetting = await prisma.setting.findUnique({ where: { key: "chatwoot_token" } });
    
    client.url = urlSetting?.value || process.env.CHATWOOT_API_URL || "";
    client.accessToken = tokenSetting?.value || process.env.CHATWOOT_ACCESS_TOKEN || "";
    
    if (!client.url || !client.accessToken) {
      throw new Error("As configurações do Chatwoot não foram definidas no painel. Vá em Configurações Globais.");
    }

    if (!client.url.startsWith("http")) {
      client.url = "https://" + client.url;
    }

    if (client.url.endsWith('/')) {
      client.url = client.url.slice(0, -1);
    }

    return client;
  }

  private get headers() {
    return {
      "Content-Type": "application/json",
      api_access_token: this.accessToken,
    };
  }

  // 1. Get Accounts to find the Account ID
  public async getAccounts() {
    console.log(`[CHATWOOT DEBUG] URL: ${this.url} | Token Length: ${this.accessToken.length} | Token Starts With: ${this.accessToken.substring(0, 4)}`);
    const res = await fetch(`${this.url}/api/v1/profile`, {
      headers: this.headers,
    });
    
    if (!res.ok) {
      throw new Error(`Failed to fetch profile: ${res.statusText}`);
    }

    const data = await res.json();
    return data;
  }

  public async setAccountId() {
    if (this.accountId) return this.accountId;
    
    const profile = await this.getAccounts();
    if (profile && profile.account_id) {
      this.accountId = profile.account_id;
    } else {
      // Fallback if profile doesn't have it directly, try /api/v1/accounts
      const res = await fetch(`${this.url}/api/v1/accounts`, {
        headers: this.headers,
      });
      const data = await res.json();
      if (data && data.length > 0) {
        this.accountId = data[0].id;
      }
    }
    
    if (!this.accountId) {
      throw new Error("Não foi possível encontrar um Account ID no Chatwoot.");
    }
    
    return this.accountId;
  }

  // 2. Get Inboxes (Caixas de entrada)
  public async getInboxes() {
    await this.setAccountId();
    
    const res = await fetch(`${this.url}/api/v1/accounts/${this.accountId}/inboxes`, {
      headers: this.headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch inboxes: ${res.statusText}`);
    }

    return await res.json();
  }

  // 3. Get Conversations
  public async getConversations() {
    await this.setAccountId();
    
    const res = await fetch(`${this.url}/api/v1/accounts/${this.accountId}/conversations`, {
      headers: this.headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch conversations: ${res.statusText}`);
    }

    return await res.json();
  }

  // 4. Get Teams
  public async getTeams() {
    await this.setAccountId();
    
    const res = await fetch(`${this.url}/api/v1/accounts/${this.accountId}/teams`, {
      headers: this.headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch teams: ${res.statusText}`);
    }

    return await res.json();
  }

  // 5. Get Agents
  public async getAgents() {
    await this.setAccountId();
    
    const res = await fetch(`${this.url}/api/v1/accounts/${this.accountId}/agents`, {
      headers: this.headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch agents: ${res.statusText}`);
    }

    return await res.json();
  }

  // 6. Get Team Members
  public async getTeamMembers(teamId: number) {
    await this.setAccountId();
    
    const res = await fetch(`${this.url}/api/v1/accounts/${this.accountId}/teams/${teamId}/team_members`, {
      headers: this.headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch team members: ${res.statusText}`);
    }

    return await res.json();
  }

  // 7. Assign Members to Inbox
  public async assignMembersToInbox(inboxId: number, userIds: number[]) {
    await this.setAccountId();
    
    const res = await fetch(`${this.url}/api/v1/accounts/${this.accountId}/inbox_members`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        inbox_id: inboxId,
        user_ids: userIds,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to assign members to inbox: ${res.statusText}`);
    }

    return await res.json();
  }

  // 8. Delete Inbox
  public async deleteInbox(inboxId: number) {
    await this.setAccountId();
    
    const res = await fetch(`${this.url}/api/v1/accounts/${this.accountId}/inboxes/${inboxId}`, {
      method: "DELETE",
      headers: this.headers,
    });

    if (!res.ok) {
      throw new Error(`Failed to delete inbox: ${res.statusText}`);
    }

    return true;
  }
}
