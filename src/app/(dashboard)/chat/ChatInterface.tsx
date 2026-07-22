"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User as UserIcon, Clock, Phone, AlertCircle, MessageSquare, Check, CheckCheck, FileText, Image as ImageIcon, Play, Pause, Download, ChevronDown, Reply, Trash2, X, ZoomIn, ZoomOut } from "lucide-react";

import { fetchConversationsAction, fetchMessagesAction, sendMessageAction, deleteMessageAction } from "./actions";

function CustomAudioPlayer({ src }: { src: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) audioRef.current.pause();
      else audioRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) setDuration(audioRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = (Number(e.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(Number(e.target.value));
    }
  };

  const changeSpeed = () => {
    const nextRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    if (audioRef.current) audioRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const m = Math.floor(time / 60).toString().padStart(2, '0');
    const s = Math.floor(time % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="flex items-center gap-2 bg-black/5 p-2 rounded-lg w-[280px] max-w-full my-1">
      <audio 
        ref={audioRef} 
        src={src} 
        onTimeUpdate={handleTimeUpdate} 
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />
      <button onClick={togglePlay} className="w-9 h-9 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded-full shrink-0 transition-colors shadow-sm">
        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-1" />}
      </button>
      <div className="flex-1 flex flex-col justify-center">
        <input 
          type="range" 
          min="0" max="100" 
          value={progress || 0} 
          onChange={handleSeek}
          className="w-full h-1.5 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-medium">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
      <div className="flex flex-col items-center gap-1 shrink-0">
        <button onClick={changeSpeed} className="px-1.5 py-0.5 bg-black/10 hover:bg-black/20 rounded text-[10px] font-bold text-gray-700 w-8 transition-colors">
          {playbackRate}x
        </button>
        <a href={src} download target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-800 transition-colors" title="Baixar">
          <Download className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

export default function ChatInterface({ token, url, publicUrl }: { token: string, url: string, publicUrl: string }) {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [replyingTo, setReplyingTo] = useState<any | null>(null);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [openMenuMsgId, setOpenMenuMsgId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
      const interval = setInterval(() => fetchMessages(activeConvId), 3000);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchConversations() {
    try {
      const data = await fetchConversationsAction(url, publicUrl, token);
      setConversations(data);
    } catch (err) {
      console.error("Error fetching conversations:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMessages(conversationId: number) {
    try {
      const msgs = await fetchMessagesAction(url, publicUrl, token, conversationId);
      setMessages(msgs);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    const msgToSend = inputText;
    const replyId = replyingTo?.id;
    setInputText("");
    setReplyingTo(null);

    const optimisticMsg = {
      id: Date.now(),
      content: msgToSend,
      message_type: 1,
      created_at: Math.floor(Date.now() / 1000),
      sender_type: "User",
      status: "progress",
      content_attributes: replyId ? { in_reply_to: replyId } : {}
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const success = await sendMessageAction(url, token, activeConvId, msgToSend, replyId);
      if (!success) throw new Error("Failed to send");
      fetchMessages(activeConvId);
      fetchConversations();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  }

  async function deleteMessage(msgId: number) {
    if (!activeConvId) return;
    if (!window.confirm("Tem certeza que deseja excluir esta mensagem?")) return;
    
    setOpenMenuMsgId(null);
    setMessages(prev => prev.filter(m => m.id !== msgId));
    
    try {
      await deleteMessageAction(url, token, activeConvId, msgId);
      fetchMessages(activeConvId);
    } catch (err) {
      console.error("Erro ao deletar:", err);
    }
  }

  function formatTime(unixTimestamp: number) {
    if (!unixTimestamp) return "";
    return new Date(unixTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const activeConv = conversations.find(c => c.id === activeConvId);

  return (
    <>
      {zoomedImage && (
        <div className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => { setZoomedImage(null); setZoomScale(1); }}>
          <div className="absolute top-4 right-4 flex gap-4 z-[70]">
            <button onClick={(e) => { e.stopPropagation(); setZoomScale(s => Math.min(s + 0.5, 4)); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur">
              <ZoomIn className="w-6 h-6" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); setZoomScale(s => Math.max(s - 0.5, 0.5)); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur">
              <ZoomOut className="w-6 h-6" />
            </button>
            <button onClick={() => { setZoomedImage(null); setZoomScale(1); }} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur">
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="w-full h-full flex items-center justify-center overflow-auto">
            <img 
              src={zoomedImage} 
              alt="Zoomed" 
              className="max-w-none max-h-none object-contain transition-transform duration-200 cursor-zoom-in"
              style={{ transform: `scale(${zoomScale})` }}
              onClick={(e) => { e.stopPropagation(); setZoomScale(s => Math.min(s + 0.5, 4)); }}
            />
          </div>
        </div>
      )}

      <div className="flex h-[calc(100vh-4rem)] bg-white overflow-hidden rounded-t-lg shadow-sm border border-gray-200" onClick={() => setOpenMenuMsgId(null)}>
        {/* Sidebar */}
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
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 overflow-hidden">
                      {sender?.thumbnail ? (
                        <img 
                          src={sender.thumbnail} 
                          alt={sender.name || "Avatar"} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full items-center justify-center" style={{ display: sender?.thumbnail ? 'none' : 'flex' }}>
                        <UserIcon className="w-5 h-5" />
                      </div>
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

        {/* Main */}
        <div className="flex-1 flex flex-col bg-[#e5ddd5]">
          {activeConvId && activeConv ? (
            <>
              {/* Header */}
              <div className="h-16 px-6 bg-white border-b border-gray-200 flex items-center gap-4 shadow-sm z-10">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 overflow-hidden">
                  {activeConv.meta?.sender?.thumbnail ? (
                    <img 
                      src={activeConv.meta.sender.thumbnail} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.nextElementSibling) {
                          (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div className="w-full h-full items-center justify-center" style={{ display: activeConv.meta?.sender?.thumbnail ? 'none' : 'flex' }}>
                    <UserIcon className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{activeConv.meta?.sender?.name || activeConv.meta?.sender?.phone_number || "Desconhecido"}</h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {activeConv.meta?.sender?.phone_number || "Sem telefone"}
                  </p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map((msg) => {
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

                  const quotedMsgId = msg.content_attributes?.in_reply_to;
                  const quotedMsg = quotedMsgId ? messages.find(m => m.id === quotedMsgId) : null;

                  return (
                    <div key={msg.id} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                      <div className={`group max-w-[70%] p-3 rounded-lg shadow-sm relative ${isOutgoing ? 'bg-[#d9fdd3] text-gray-900 rounded-tr-none' : 'bg-white text-gray-900 rounded-tl-none'}`}>
                        {/* Dropdown Menu Toggle */}
                        <div className={`absolute top-1 ${isOutgoing ? 'left-[-35px]' : 'right-[-35px]'} opacity-0 group-hover:opacity-100 transition-opacity z-10`}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setOpenMenuMsgId(openMenuMsgId === msg.id ? null : msg.id); }}
                            className="p-1.5 text-gray-500 hover:bg-black/10 rounded-full"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          
                          {/* Menu Box */}
                          {openMenuMsgId === msg.id && (
                            <div className={`absolute top-8 ${isOutgoing ? 'right-0' : 'left-0'} w-48 bg-white border border-gray-100 rounded-lg shadow-xl z-20 py-1`}>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setReplyingTo(msg); setOpenMenuMsgId(null); }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 flex items-center gap-2"
                              >
                                <Reply className="w-4 h-4" /> Responder
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }}
                                className="w-full text-left px-4 py-2 hover:bg-red-50 text-sm text-red-600 flex items-center gap-2"
                              >
                                <Trash2 className="w-4 h-4" /> Excluir
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Quoted Message Preview */}
                        {quotedMsg && (
                          <div className="mb-2 p-2 bg-black/5 border-l-4 border-blue-500 rounded-md text-sm text-gray-600 cursor-pointer hover:bg-black/10 transition-colors">
                            <p className="font-semibold text-blue-600 text-[11px] mb-0.5">
                              {quotedMsg.message_type === 1 ? "Você" : activeConv.meta?.sender?.name || "Contato"}
                            </p>
                            <p className="truncate text-xs opacity-90">{quotedMsg.content || "Anexo"}</p>
                          </div>
                        )}

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mb-1 space-y-2">
                            {msg.attachments.map((att: any, idx: number) => {
                              if (att.file_type === 'image') {
                                return (
                                  <img 
                                    key={att.id || idx} 
                                    src={att.data_url} 
                                    alt="Anexo" 
                                    onClick={() => { setZoomedImage(att.data_url); setZoomScale(1); }}
                                    className="max-w-full rounded-md cursor-zoom-in hover:opacity-95 transition-opacity" 
                                  />
                                );
                              }
                              if (att.file_type === 'audio') {
                                return <CustomAudioPlayer key={att.id || idx} src={att.data_url} />;
                              }
                              if (att.file_type === 'video') {
                                return <video key={att.id || idx} controls src={att.data_url} className="max-w-full rounded-md" />;
                              }
                              return (
                                <a key={att.id || idx} href={att.data_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 bg-black/5 rounded-md text-blue-600 hover:underline">
                                  <FileText className="w-4 h-4" />
                                  <span className="text-sm font-medium truncate max-w-[200px]">Arquivo ({att.extension || 'Anexo'})</span>
                                </a>
                              );
                            })}
                          </div>
                        )}
                        {msg.content && <p className="text-[15px] whitespace-pre-wrap break-words">{msg.content}</p>}
                        <span className="text-[10px] text-gray-500 block text-right mt-1 flex items-center justify-end gap-1">
                          {formatTime(msg.created_at)}
                          {isOutgoing && (
                            msg.status === 'read' ? <CheckCheck className="w-3 h-3 text-blue-500" /> :
                            msg.status === 'delivered' ? <CheckCheck className="w-3 h-3 text-gray-500" /> :
                            msg.status === 'progress' || msg.status === 'failed' ? <Clock className="w-3 h-3 text-gray-400" /> :
                            <Check className="w-3 h-3 text-gray-500" />
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="bg-[#f0f2f5] border-t border-gray-200 flex flex-col">
                {replyingTo && (
                  <div className="px-4 py-3 bg-[#f0f2f5] border-b border-gray-200 flex items-center justify-between">
                    <div className="bg-black/5 p-2 border-l-4 border-blue-500 rounded-md flex-1 min-w-0 mr-4">
                      <p className="font-semibold text-blue-600 text-xs mb-0.5">
                        Respondendo a {replyingTo.message_type === 1 ? "Você" : activeConv.meta?.sender?.name || "Contato"}
                      </p>
                      <p className="text-gray-600 text-sm truncate">{replyingTo.content || "Anexo"}</p>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors shrink-0">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                
                <div className="p-4">
                  <form onSubmit={sendMessage} className="flex gap-2">
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Digite uma mensagem..."
                      className="flex-1 px-4 py-3 rounded-full border-none focus:ring-0 outline-none text-gray-800 shadow-sm bg-white"
                    />
                    <button 
                      type="submit"
                      disabled={!inputText.trim()}
                      className="w-12 h-12 rounded-full bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors disabled:opacity-50 shadow-sm shrink-0"
                    >
                      <Send className="w-5 h-5 ml-1" />
                    </button>
                  </form>
                </div>
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
    </>
  );
}
