"use server";

export async function fetchConversationsAction(url: string, token: string) {
  try {
    const res = await fetch(`${url}/api/v1/accounts/1/conversations?status=all&assignee_type=all`, {
      headers: { "api_access_token": token },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error("Failed to fetch conversations");
    const data = await res.json();
    return data.data?.payload || [];
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function fetchMessagesAction(url: string, token: string, conversationId: number) {
  try {
    const res = await fetch(`${url}/api/v1/accounts/1/conversations/${conversationId}/messages`, {
      headers: { "api_access_token": token },
      cache: 'no-store'
    });
    if (!res.ok) throw new Error("Failed to fetch messages");
    const data = await res.json();
    return (data.payload || []).sort((a: any, b: any) => a.created_at - b.created_at);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function sendMessageAction(url: string, token: string, conversationId: number, content: string) {
  try {
    const res = await fetch(`${url}/api/v1/accounts/1/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { 
        "api_access_token": token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ content, message_type: 'outgoing', private: false }),
      cache: 'no-store'
    });
    if (!res.ok) throw new Error("Failed to send message");
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}
