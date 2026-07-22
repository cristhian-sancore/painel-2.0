import { ChatwootClient } from "@/lib/chatwoot";
import { MessageSquare, Inbox, Users, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ChatwootPage() {
  let inboxes = [];
  let conversations = [];
  let error = null;

  try {
    const chatwoot = await ChatwootClient.init();
    
    const inboxesData = await chatwoot.getInboxes();
    inboxes = inboxesData.payload || [];

    const conversationsData = await chatwoot.getConversations();
    conversations = conversationsData.data.payload || [];
  } catch (err: any) {
    console.error(err);
    error = err.message;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 border-t border-gray-200">
      {/* Sidebar: Inboxes */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 font-semibold text-gray-800 flex items-center gap-2">
          <Inbox className="w-5 h-5 text-blue-600" />
          Caixas de Entrada
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {error && <div className="p-4 text-red-500 text-sm">{error}</div>}
          
          {inboxes.length === 0 && !error && (
            <div className="text-gray-400 text-sm p-2">Nenhuma caixa de entrada encontrada.</div>
          )}
          
          <ul className="space-y-1">
            {inboxes.map((inbox: any) => (
              <li key={inbox.id}>
                <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-sm text-gray-700">
                  {inbox.channel_type === "Channel::Whatsapp" ? (
                    <Phone className="w-4 h-4 text-green-500" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="truncate">{inbox.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Middle Column: Conversations */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 font-semibold text-gray-800 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Conversas Ativas
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 && !error && (
            <div className="p-8 text-center text-gray-400 text-sm">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              Nenhuma conversa ativa no momento.
            </div>
          )}

          <ul className="divide-y divide-gray-100">
            {conversations.map((conv: any) => (
              <li key={conv.id} className="p-4 hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium text-gray-900 text-sm truncate pr-2">
                    {conv.meta.sender.name || "Desconhecido"}
                  </h4>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {new Date(conv.messages[0]?.created_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {conv.messages[0]?.content || "Enviou um anexo"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Chat Area (Placeholder for now) */}
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Selecione uma conversa para iniciar o atendimento</p>
        </div>
      </div>
    </div>
  );
}
