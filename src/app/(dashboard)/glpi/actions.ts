"use server";

import { GlpiClient } from "@/lib/glpi";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function fetchTicketsAction() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) throw new Error("Não autorizado");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { accessGroup: true }
    });
    
    if (!user) throw new Error("Usuário não encontrado");

    const glpi = await GlpiClient.init();
    
    const isAdmin = user.accessGroup?.name.toLowerCase() === "administrador" || user.role === "ADMIN";

    let tickets;
    if (isAdmin) {
      tickets = await glpi.getTickets();
    } else {
      if (!user.glpiUserId && !user.accessGroup?.glpiGroupId) {
         // Se não for admin e não tiver vínculo, não vê nenhum chamado por enquanto
         tickets = [];
      } else {
         const searchUrl = new URL(`${(glpi as any).url}/search/Ticket`);
         searchUrl.searchParams.append("expand_dropdowns", "true");
         searchUrl.searchParams.append("range", "0-50");
         let criteriaIndex = 0;

         if (user.glpiUserId) {
           // Atribuído a ele
           searchUrl.searchParams.append(`criteria[${criteriaIndex}][field]`, "5");
           searchUrl.searchParams.append(`criteria[${criteriaIndex}][searchtype]`, "equals");
           searchUrl.searchParams.append(`criteria[${criteriaIndex}][value]`, user.glpiUserId.toString());
           
           // Requerente
           criteriaIndex++;
           searchUrl.searchParams.append(`criteria[${criteriaIndex}][link]`, "OR");
           searchUrl.searchParams.append(`criteria[${criteriaIndex}][field]`, "4");
           searchUrl.searchParams.append(`criteria[${criteriaIndex}][searchtype]`, "equals");
           searchUrl.searchParams.append(`criteria[${criteriaIndex}][value]`, user.glpiUserId.toString());
         }

         if (user.accessGroup?.glpiGroupId) {
           if (criteriaIndex > 0) {
              criteriaIndex++;
              searchUrl.searchParams.append(`criteria[${criteriaIndex}][link]`, "OR");
           }
           // Atribuído ao Grupo dele
           searchUrl.searchParams.append(`criteria[${criteriaIndex}][field]`, "8");
           searchUrl.searchParams.append(`criteria[${criteriaIndex}][searchtype]`, "equals");
           searchUrl.searchParams.append(`criteria[${criteriaIndex}][value]`, user.accessGroup.glpiGroupId.toString());
         }

         const res = await fetch(searchUrl.toString(), {
           method: "GET",
           headers: (glpi as any).headers,
         });

         if (res.ok) {
           const result = await res.json();
           tickets = result.data || [];
         } else {
           tickets = [];
         }
      }
    }
    
    await glpi.killSession();
    return { success: true, data: tickets };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function createTicketAction(title: string, description: string, userPhoneOrEmail: string) {
  try {
    const session = await getServerSession(authOptions);
    let requesterId = undefined;

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
      if (user?.glpiUserId) {
        requesterId = user.glpiUserId;
      }
    }

    const glpi = await GlpiClient.init();
    
    // Fallback: Tenta encontrar o usuário fornecido pelo form, se o logado não tiver
    if (!requesterId && userPhoneOrEmail) {
      const glpiUser = await glpi.findUser(userPhoneOrEmail);
      if (glpiUser && glpiUser.id) {
        requesterId = glpiUser.id;
      }
    }

    const ticket = await glpi.createTicket(title, description, requesterId);
    await glpi.killSession();
    
    return { success: true, data: ticket };
  } catch (err: any) {
    return { error: err.message };
  }
}
export async function getTicketFollowupsAction(ticketId: number) {
  try {
    const glpi = await GlpiClient.init();
    const followups = await glpi.getTicketFollowups(ticketId);
    await glpi.killSession();
    return { success: true, data: followups };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function addTicketFollowupAction(ticketId: number, content: string) {
  try {
    const glpi = await GlpiClient.init();
    const followup = await glpi.addTicketFollowup(ticketId, content);
    await glpi.killSession();
    return { success: true, data: followup };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function solveTicketAction(ticketId: number) {
  try {
    const glpi = await GlpiClient.init();
    await glpi.updateTicketStatus(ticketId, 5); // 5 = solved
    await glpi.killSession();
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updateTicketAction(ticketId: number, data: any) {
  try {
    const glpi = await GlpiClient.init();
    await glpi.updateTicket(ticketId, data);
    await glpi.killSession();
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deleteTicketAction(ticketId: number) {
  try {
    const glpi = await GlpiClient.init();
    await glpi.deleteTicket(ticketId, true); // true = force purge
    await glpi.killSession();
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}
