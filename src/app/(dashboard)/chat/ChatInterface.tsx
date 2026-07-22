"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User as UserIcon, Clock, Phone, AlertCircle } from "lucide-react";

export default function ChatInterface({ token, url }: { token: string, url: string }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Poll conversations every 5 seconds
  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  // Poll messages every 3 seconds for the active conversation
  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
      const interval = setInterval(() => fetchMessages(activeConvId), 3000);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchConversations() {
    try {
      const res = await fetch(`${url}/api/v1/accounts/1/conversations`, {
        headers: { "api_access_token": token }
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data.data.payload || []);
      }
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(conversationId: number) {
    try {
      const res = await fetch(`${url}/api/v1/accounts/1/conversations/${conversationId}/messages`, {
        headers: { "api_access_token": token }
      });
      if (res.ok) {
        const data = await res.json();
        // Messages come sorted or we can sort them by created_at
        const msgs = (data.payload || []).sort((a: any, b: any) => a.created_at - b.created_at);
        setMessages(msgs);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    const msgToSend = inputText;
    setInputText("");

    // Optimistic UI update
    const optimisticMsg = {
      id: Date.now(),
      content: msgToSend,
      message_type: 1, // 1 = outgoing
      created_at: Math.floor(Date.now() / 1000),
      sender_type: "User"
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await fetch(`${url}/api/v1/accounts/1/conversations/${activeConvId}/messages`, {
        method: "POST",
        headers: { 
          "api_access_token": token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: msgToSend,
          private: false
        })
      });
      if (!res.ok) {
        throw new Error("Failed to send");
      }
      // Re-fetch immediately
      fetchMessages(activeConvId);
      fetchConversations();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }

  function formatTime(unixTimestamp: number) {
    if (!unixTimestamp) return "";
    return new Date(unixTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const activeConv = conversations.find(c => c.id === activeConvId);

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-white overflow-hidden rounded-t-lg shadow-sm border border-gray-200">
      {/* Sidebar: Conversations */}
      <div className="w-1/3 min-w-[300px] border-r border-gray-200 flex flex-col bg-gray-50">
        <div className="p-4 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-bold text-gray-800">Minhas Conversas</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Carregando...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-gray-400 flex flex-col items-center">
              <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
              <p>Nenhuma conversa atribuída a você.</p>
            </div>
          ) : (
            conversations.map((conv) => {
              const sender = conv.meta?.sender;
              const lastMsg = conv.messages?.[0]?.content || "Sem mensagens";
              const time = formatTime(conv.last_activity_at);
              
              return (
                <div 
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors flex gap-3 ${activeConvId === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    {sender?.thumbnail ? (
                      <img src={sender.thumbnail} alt={sender.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <UserIcon className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {sender?.name || sender?.phone_number || "Desconhecido"}
                      </h3>
                      <span className="text-xs text-gray-400 shrink-0">{time}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate">{lastMsg}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main: Chat Area */}
      <div className="flex-1 flex flex-col bg-[#e5ddd5]">
        {activeConvId && activeConv ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-6 bg-white border-b border-gray-200 flex items-center gap-4 shadow-sm z-10">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                {activeConv.meta?.sender?.thumbnail ? (
                  <img src={activeConv.meta.sender.thumbnail} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <UserIcon className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900">{activeConv.meta?.sender?.name || activeConv.meta?.sender?.phone_number || "Desconhecido"}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Phone className="w-3 h-3" /> {activeConv.meta?.sender?.phone_number || "Sem telefone"}
                </p>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((msg) => {
                // message_type: 0 = incoming (contact), 1 = outgoing (agent), 2 = template, 3 = activity
                const isOutgoing = msg.message_type === 1;
                const isActivity = msg.message_type === 3 || msg.message_type === 2;

                if (isActivity) {
                  return (
                    <div key={msg.id} className="flex justify-center my-2">
                      <span className="px-3 py-1 bg-yellow-100/80 text-yellow-800 text-xs rounded-lg shadow-sm">
                        {msg.content}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-[70%] p-3 rounded-lg shadow-sm relative ${isOutgoing ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none'}`}
                    >
                      <p className="text-[15px] whitespace-pre-wrap break-words">{msg.content}</p>
                      <span className="text-[10px] text-gray-500 block text-right mt-1 flex items-center justify-end gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#f0f2f5] border-t border-gray-200">
              <form onSubmit={sendMessage} className="flex gap-2">
                <input 
                  type="text" 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Digite uma mensagem..."
                  className="flex-1 px-4 py-3 rounded-full border-none focus:ring-0 outline-none text-gray-800 shadow-sm"
                />
                <button 
                  type="submit"
                  disabled={!inputText.trim()}
                  className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors disabled:opacity-50 shadow-sm"
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <div className="w-24 h-24 bg-white/50 rounded-full flex items-center justify-center mb-4 shadow-sm">
              <MessageSquare className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-lg">Selecione uma conversa para iniciar o atendimento</p>
          </div>
        )}
      </div>
    </div>
  );
}
