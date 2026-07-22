"use server";

export async function fetchConversationsAction(apiUrl: string, publicUrl: string, token: string) {
  try {
    const res = await fetch(`${apiUrl}/api/v1/accounts/1/conversations?status=all&assignee_type=all`, {
      headers: { "api_access_token": token },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error("Failed to fetch conversations");
    const data = await res.json();
    
    // Replace internal IP with public URL globally in the JSON string
    let jsonString = JSON.stringify(data.data?.payload || []);
    jsonString = jsonString.split(apiUrl).join(publicUrl);
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchMessagesAction(apiUrl: string, publicUrl: string, token: string, conversationId: number) {
  try {
    const res = await fetch(`${apiUrl}/api/v1/accounts/1/conversations/${conversationId}/messages`, {
      headers: { "api_access_token": token },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error("Failed to fetch messages");
    const data = await res.json();
    
    // Replace internal IP with public URL globally in the JSON string
    let jsonString = JSON.stringify(data.payload || []);
    jsonString = jsonString.split(apiUrl).join(publicUrl);
    
    let msgs = JSON.parse(jsonString);
    return msgs.sort((a: any, b: any) => a.created_at - b.created_at);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function sendMessageAction(url: string, token: string, conversationId: number, content: string, replyToId?: number) {
  try {
    const payload: any = { content, message_type: 'outgoing', private: false };
    if (replyToId) {
      payload.content_attributes = { in_reply_to: replyToId };
    }

    const res = await fetch(`${url}/api/v1/accounts/1/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { 
        "api_access_token": token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload),
      cache: 'no-store'
    });
    if (!res.ok) throw new Error("Failed to send message");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function deleteMessageAction(url: string, token: string, conversationId: number, messageId: number) {
  try {
    const res = await fetch(`${url}/api/v1/accounts/1/conversations/${conversationId}/messages/${messageId}`, {
      method: "DELETE",
      headers: { "api_access_token": token },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error("Failed to delete message");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
