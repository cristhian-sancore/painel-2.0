import { ChatwootClient } from "@/lib/chatwoot";
import { MessageSquare, Inbox, Users, Phone } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ChatwootPage({ searchParams }: { searchParams: { inboxId?: string } }) {
  let inboxes = [];
  let conversations = [];
  let error = null;
  const currentInboxId = searchParams.inboxId;

  try {
    const chatwoot = await ChatwootClient.init();
    
    const inboxesData = await chatwoot.getInboxes();
    inboxes = inboxesData.payload || [];

    const conversationsData = await chatwoot.getConversations();
    const allConversations = conversationsData.data.payload || [];
    
    if (currentInboxId) {
      conversations = allConversations.filter((c: any) => String(c.inbox_id) === currentInboxId);
    } else {
      conversations = allConversations;
    }
  } catch (err: any) {
    console.error(err);
    error = err.message;
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 border-t border-gray-200">
      {/* Sidebar: Inboxes */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200 font-semibold text-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-blue-600" />
            Caixas de Entrada
          </div>
          {currentInboxId && (
            <Link href="/chatwoot" className="text-xs text-blue-500 hover:underline">Ver Todas</Link>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {error && <div className="p-4 text-red-500 text-sm">{error}</div>}
          
          {inboxes.length === 0 && !error && (
            <div className="text-gray-400 text-sm p-2">Nenhuma caixa de entrada encontrada.</div>
          )}
          
          <ul className="space-y-1">
            {inboxes.map((inbox: any) => (
              <li key={inbox.id}>
                <Link 
                  href={`/chatwoot?inboxId=${inbox.id}`} 
                  className={`flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-100 text-sm ${currentInboxId === String(inbox.id) ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
                >
                  {inbox.channel_type === "Channel::Whatsapp" ? (
                    <Phone className={`w-4 h-4 ${currentInboxId === String(inbox.id) ? 'text-blue-600' : 'text-green-500'}`} />
                  ) : (
                    <MessageSquare className={`w-4 h-4 ${currentInboxId === String(inbox.id) ? 'text-blue-600' : 'text-gray-400'}`} />
                  )}
                  <span className="truncate">{inbox.name}</span>
                </Link>
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
              Nenhuma conversa ativa encontrada nesta caixa.
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
                    {conv.messages && conv.messages[0] ? new Date(conv.messages[0].created_at * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2">
                  {conv.messages && conv.messages[0] ? (conv.messages[0].content || "Enviou um anexo") : "Nenhuma mensagem"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Main Chat Area (Placeholder) */}
      <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="bg-white p-4 rounded-full inline-block shadow-sm mb-4">
            <MessageSquare className="w-12 h-12 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Painel de Resumo</h2>
          <p className="text-gray-500 text-sm mb-6">
            Esta tela mostra um resumo das suas caixas de entrada e conversas ativas. Para responder aos clientes, utilizar arquivos de mídia, atalhos rápidos e automações, por favor, acesse o sistema do Chatwoot.
          </p>
          <a 
            href={error ? "#" : "https://chatwoot2.cristhiansancore.com.br"} 
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            Abrir Chatwoot
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          </a>
        </div>
      </div>
    </div>
  );
}
