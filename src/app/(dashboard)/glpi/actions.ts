"use server";

import { GlpiClient } from "@/lib/glpi";

export async function fetchTicketsAction() {
  try {
    const glpi = await GlpiClient.init();
    const tickets = await glpi.getTickets();
    await glpi.killSession();
    return { success: true, data: tickets };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function createTicketAction(title: string, description: string, userPhoneOrEmail: string) {
  try {
    const glpi = await GlpiClient.init();
    
    // Tenta encontrar o usuário pelo telefone ou email
    let requesterId = undefined;
    if (userPhoneOrEmail) {
      const user = await glpi.findUser(userPhoneOrEmail);
      if (user && user.id) {
        requesterId = user.id;
      }
      // TODO: Se não encontrar, idealmente chamaria a API do GLPI para criar o usuário
      // Para manter simples agora, vamos criar o chamado sem requesitante (ou com requesitante padrão) se não achar
    }

    const ticket = await glpi.createTicket(title, description, requesterId);
    await glpi.killSession();
    
    return { success: true, data: ticket };
  } catch (err: any) {
    return { error: err.message };
  }
}
