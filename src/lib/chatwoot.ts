export class ChatwootClient {
  private url: string;
  private accessToken: string;
  private accountId: number | null = null;

  constructor() {
    this.url = process.env.CHATWOOT_API_URL || "";
    this.accessToken = process.env.CHATWOOT_ACCESS_TOKEN || "";
  }

  private get headers() {
    return {
      "Content-Type": "application/json",
      api_access_token: this.accessToken,
    };
  }

  // 1. Get Accounts to find the Account ID
  public async getAccounts() {
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
}
