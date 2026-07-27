import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log("[GLPI Webhook] Received payload:", JSON.stringify(payload));

    // The GLPI webhook payload structure
    // For Followups (Acompanhamento):
    // { "item": { "id": 19, "itemtype": "Ticket", "items_id": 15, "content": "...", "is_private": false }, "event": "new" }
    // For Ticket Updates:
    // { "item": { "id": 15, "status": { "id": 5, "name": "Solucionado" } }, "event": "update" }

    let ticketId: number | null = null;
    let content: string = "";
    let isPrivate = false;

    if (payload.event === "new" && payload.item?.items_id && payload.item?.itemtype === "Ticket") {
      // For Followups
      ticketId = parseInt(payload.item.items_id, 10);
      content = payload.item.content || "";
      isPrivate = payload.item.is_private === true || payload.item.is_private == 1;
    } else if (payload.event === "update" && payload.item?.status && payload.item?.id && !payload.item?.items_id) {
      // For Ticket status updates (e.g. solved)
      ticketId = parseInt(payload.item.id, 10);
      const statusId = parseInt(payload.item.status.id, 10);
      const statusMap: Record<number, string> = {
        5: "Resolvido",
        6: "Fechado"
      };
      const statusName = statusMap[statusId];
      if (statusName) {
        content = `O chamado #${ticketId} foi marcado como ${statusName} no GLPI.`;
      }
    }

    if (!ticketId || !content || isPrivate) {
      console.log("[GLPI Webhook] Ignored. TicketId:", ticketId, "Content length:", content.length, "isPrivate:", isPrivate);
      return NextResponse.json({ success: true, ignored: true });
    }

    // Remove HTML tags from content (GLPI sends rich text by default)
    const cleanContent = content.replace(/<[^>]*>?/gm, '');

    // Find the associated Chatwoot Conversation
    const mapping = await prisma.ticketConversation.findUnique({
      where: { glpiTicketId: ticketId }
    });

    if (!mapping) {
      console.log(`[GLPI Webhook] No Chatwoot conversation found for GLPI Ticket #${ticketId}`);
      return NextResponse.json({ success: true, ignored: true, reason: "No mapping" });
    }

    // Get Chatwoot settings
    const urlSetting = await prisma.setting.findUnique({ where: { key: "chatwoot_url" } });
    const tokenSetting = await prisma.setting.findUnique({ where: { key: "chatwoot_token" } });
    const glpiTokenSetting = await prisma.setting.findUnique({ where: { key: "chatwoot_glpi_token" } });
    const prefixSetting = await prisma.setting.findUnique({ where: { key: "glpi_followup_prefix" } });
    
    let chatwootUrl = urlSetting?.value || process.env.CHATWOOT_API_URL || "";
    // Se existir token específico do bot do GLPI, usamos ele. Se não, usamos o token geral
    const chatwootToken = glpiTokenSetting?.value || tokenSetting?.value || process.env.CHATWOOT_ACCESS_TOKEN || "";
    const followupPrefix = prefixSetting?.value !== undefined ? prefixSetting.value : "[GLPI]: ";

    if (!chatwootUrl || !chatwootToken) {
      return NextResponse.json({ error: "Chatwoot settings not configured" }, { status: 500 });
    }

    if (!chatwootUrl.startsWith("http")) chatwootUrl = "https://" + chatwootUrl;
    if (chatwootUrl.endsWith('/')) chatwootUrl = chatwootUrl.slice(0, -1);

    // Send message to Chatwoot
    const formData = new FormData();
    const finalContent = payload.event === "update" ? cleanContent : `${followupPrefix}${cleanContent}`;
    formData.append("content", finalContent);
    formData.append("message_type", "outgoing");
    formData.append("private", "false");

    const endpoint = `${chatwootUrl}/api/v1/accounts/${mapping.chatwootAccountId}/conversations/${mapping.chatwootConversationId}/messages`;
    
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "api_access_token": chatwootToken },
      body: formData
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("[GLPI Webhook] Error sending to Chatwoot:", res.status, errorText);
      return NextResponse.json({ error: "Failed to send to Chatwoot" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[GLPI Webhook] Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
