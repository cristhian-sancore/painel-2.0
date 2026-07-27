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
    if (data.data && data.data.length > 0) {
      const u = data.data[0];
      return { id: u["2"] || u.id, email: u["5"] || u.email || searchTerm };
    }
    return null;
  }

  public async createUser(name: string, email: string) {
    if (!this.sessionToken) await this.initSession();

    // In GLPI, name is often the login username. We'll use email as username if name isn't suitable, or just use name.
    const res = await fetch(`${this.url}/User`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        input: {
          name: email, // use email as login
          realname: name,
          _useremails: [email],
          is_active: 1
        }
      })
    });
    
    if (!res.ok) return null;
    const data = await res.json();
    return data.id || null;
  }

  public async deleteUser(id: number) {
    if (!this.sessionToken) await this.initSession();

    const res = await fetch(`${this.url}/User/${id}?force_purge=true`, {
      method: "DELETE",
      headers: this.headers
    });
    
    if (!res.ok) {
       const errorText = await res.text();
       throw new Error(`Failed to delete GLPI user: ${errorText}`);
    }
    return true;
  }

  public async findGroup(name: string) {
    if (!this.sessionToken) await this.initSession();

    const searchUrl = new URL(`${this.url}/search/Group`);
    searchUrl.searchParams.append("criteria[0][field]", "14"); // 14 is Name in Group search
    searchUrl.searchParams.append("criteria[0][searchtype]", "equals");
    searchUrl.searchParams.append("criteria[0][value]", name);

    const res = await fetch(searchUrl.toString(), {
      method: "GET",
      headers: this.headers,
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      const g = data.data[0];
      return { id: g["2"] || g.id, name: g["14"] || g.name };
    }
    return null;
  }

  public async createGroup(name: string) {
    if (!this.sessionToken) await this.initSession();

    const res = await fetch(`${this.url}/Group`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify({
        input: {
          name: name,
          is_assign: 1,
          is_requester: 1,
          is_watcher: 1
        }
      })
    });
    
    if (!res.ok) {
       const errorText = await res.text();
       throw new Error(`Failed to create GLPI group: ${errorText}`);
    }
    const data = await res.json();
    return data.id;
  }

  public async deleteGroup(id: number) {
    if (!this.sessionToken) await this.initSession();

    const res = await fetch(`${this.url}/Group/${id}?force_purge=true`, {
      method: "DELETE",
      headers: this.headers
    });
    
    if (!res.ok) {
       const errorText = await res.text();
       throw new Error(`Failed to delete GLPI group: ${errorText}`);
    }
    return true;
  }

  // Add User to Group
  public async addUserToGroup(userId: number, groupId: number) {
    if (!this.sessionToken) await this.initSession();

    const payload = {
      input: {
        users_id: userId,
        groups_id: groupId,
        is_manager: 0,
        is_delegatee: 0
      }
    };

    const res = await fetch(`${this.url}/Group_User`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.warn(`[GLPI] Failed to add user to group (might already exist): ${errorText}`);
      return false;
    }

    return true;
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
  public async createTicket(title: string, content: string, requesterId?: number, assigneeId?: number) {
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

    if (assigneeId) {
      payload.input._users_id_assign = assigneeId;
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
  // Get Ticket Followups
  public async getTicketFollowups(ticketId: number) {
    if (!this.sessionToken) await this.initSession();

    // The API for ITILFollowup allows searching by items_id
    const res = await fetch(`${this.url}/ITILFollowup?searchText[items_id]=${ticketId}&searchText[itemtype]=Ticket&expand_dropdowns=true`, {
      method: "GET",
      headers: this.headers,
    });

    if (!res.ok) return [];
    
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  }

  // Add Ticket Followup
  public async addTicketFollowup(ticketId: number, content: string) {
    if (!this.sessionToken) await this.initSession();

    const payload = {
      input: {
        itemtype: "Ticket",
        items_id: ticketId,
        content: content
      }
    };

    const res = await fetch(`${this.url}/ITILFollowup`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to add ticket followup: ${errorText}`);
    }

    return await res.json();
  }

  // Update Ticket Status (e.g. solve/close)
  public async updateTicketStatus(ticketId: number, status: number) {
    if (!this.sessionToken) await this.initSession();

    const payload = {
      input: {
        items_id: ticketId, // some versions use items_id, others use id. GLPI REST API usually uses id for PUT
        id: ticketId,
        status: status
      }
    };

    const res = await fetch(`${this.url}/Ticket/${ticketId}`, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update ticket status: ${errorText}`);
    }

    return await res.json();
  }

  // Update Ticket Full (Edit fields)
  public async updateTicket(ticketId: number, data: any) {
    if (!this.sessionToken) await this.initSession();

    // Map the payload dynamically based on data passed
    const payload = {
      input: {
        id: ticketId,
        items_id: ticketId,
        ...data
      }
    };

    const res = await fetch(`${this.url}/Ticket/${ticketId}`, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to update ticket: ${errorText}`);
    }

    return await res.json();
  }

  // Delete Ticket
  public async deleteTicket(ticketId: number, forcePurge: boolean = true) {
    if (!this.sessionToken) await this.initSession();

    const res = await fetch(`${this.url}/Ticket/${ticketId}${forcePurge ? "?force_purge=true" : ""}`, {
      method: "DELETE",
      headers: this.headers,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to delete ticket: ${errorText}`);
    }

    // Usually DELETE returns empty or [true]
    return { success: true };
  }
}
