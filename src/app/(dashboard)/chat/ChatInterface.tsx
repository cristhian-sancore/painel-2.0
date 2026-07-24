"use client";

import { useState, useEffect, useRef } from "react";
import { Send, User as UserIcon, Clock, Phone, AlertCircle, MessageSquare, Check, CheckCheck, FileText, Image as ImageIcon, Play, Pause, Download, ChevronDown, Reply, Trash2, X, ZoomIn, ZoomOut, Info, Mail, Hash, Briefcase, Filter, Paperclip, Mic, Smile, Square, ChevronLeft, Ticket } from "lucide-react";

import { fetchConversationsAction, fetchMessagesAction, sendMessageAction, deleteMessageAction, fetchAgentsAction, assignAgentAction, updatePriorityAction, toggleStatusAction, fetchCannedResponsesAction } from "./actions";
import { createTicketAction } from "../glpi/actions";

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

// Lista simples de emojis para o popover
const COMMON_EMOJIS = ["😀","😂","🤣","😊","😍","😘","🥰","😎","🤔","😐","🙄","😪","😷","🤒","🤢","🤮","🤧","🥵","🥶","🥴","😵","🤯","🤠","🥳","😎","🤓","🧐","😕","😟","🙁","😮","😯","😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿","💀","☠️","💩","🤡","👹","👺","👻","👽","👾","🤖","😺","😸","😹","😻","😼","😽","🙀","😿","😾","🙈","🙉","🙊","💋","💌","💘","💝","💖","💗","💓","💞","💕","💟","❣️","💔","❤️","🧡","💛","💚","💙","💜","🤎","🖤","🤍","💯","💢","💥","💫","💦","💨","🕳️","💣","💬","👁️‍🗨️","🗨️","🗯️","💭","💤","👍","👎","👏","🙌","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦾","🦿","🦵","🦶","👂","🦻","👃","🧠","🫀","🫁","🦷","🦴","👀","👁️","👅","👄"];

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

  // Modal para Criar Chamado GLPI
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: "", description: "" });
  const [creatingTicket, setCreatingTicket] = useState(false);

  // Filtros
  const [filterAssignee, setFilterAssignee] = useState<'me'|'unassigned'|'all'>('me');
  const [filterStatus, setFilterStatus] = useState<'open'|'resolved'|'all'>('open');
  
  // Painel lateral e Agentes
  const [showContactInfo, setShowContactInfo] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  
  // Novos estados para a caixa de input
  const [isPrivate, setIsPrivate] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [cannedResponses, setCannedResponses] = useState<any[]>([]);
  const [showMacros, setShowMacros] = useState(false);
  const [macroFilter, setMacroFilter] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  
  // Estados do gravador de voz
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevMessagesLength = useRef(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchConversations();
    fetchAgents();
    fetchCannedResponses();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [filterAssignee, filterStatus]);

  useEffect(() => {
    if (activeConvId) {
      prevMessagesLength.current = 0;
      fetchMessages(activeConvId);
      const interval = setInterval(() => fetchMessages(activeConvId), 3000);
      return () => clearInterval(interval);
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
    if (messages.length > prevMessagesLength.current) {
      if (isAtBottom || prevMessagesLength.current === 0) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } else if (messages.length > 0 && prevMessagesLength.current === 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  // Autoresize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [inputText]);

  async function fetchAgents() {
    const data = await fetchAgentsAction(url, token);
    setAgents(data);
  }

  async function fetchCannedResponses() {
    const data = await fetchCannedResponsesAction(url, token);
    setCannedResponses(data);
  }

  async function fetchConversations() {
    try {
      const data = await fetchConversationsAction(url, publicUrl, token, filterAssignee, filterStatus);
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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
        setAttachments(prev => [...prev, file]);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error("Erro ao acessar microfone", err);
      alert("Não foi possível acessar o microfone.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);

    // Lógica de macros (/)
    if (val.startsWith('/')) {
      setShowMacros(true);
      setMacroFilter(val.substring(1).toLowerCase());
    } else {
      setShowMacros(false);
    }
  };

  const insertMacro = (content: string) => {
    setInputText(content);
    setShowMacros(false);
    textareaRef.current?.focus();
  };

  const insertEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
    setShowEmojis(false);
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setAttachments(prev => [...prev, ...fileArray]);
    }
    // reset input safely after processing
    setTimeout(() => {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }, 100);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if ((!inputText.trim() && attachments.length === 0) || !activeConvId) return;

    const msgToSend = inputText;
    const isPrivateMsg = isPrivate;
    const filesToSend = [...attachments];
    const replyId = replyingTo?.id;

    setInputText("");
    setAttachments([]);
    setReplyingTo(null);
    setShowMacros(false);

    // Optimistic UI
    const optimisticMsg = {
      id: Date.now(),
      content: msgToSend,
      message_type: 1,
      created_at: Math.floor(Date.now() / 1000),
      sender_type: "User",
      status: "progress",
      private: isPrivateMsg,
      content_attributes: replyId ? { in_reply_to: replyId } : {},
      attachments: filesToSend.map(f => ({
        id: Date.now() + Math.random(),
        file_type: f.type.startsWith('image/') ? 'image' : f.type.startsWith('audio/') ? 'audio' : 'file',
        data_url: URL.createObjectURL(f)
      }))
    };
    setMessages(prev => [...prev, optimisticMsg]);
    
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    try {
      const formData = new FormData();
      if (msgToSend) formData.append("content", msgToSend);
      formData.append("message_type", "outgoing");
      formData.append("private", isPrivateMsg ? "true" : "false");
      
      if (replyId) {
        formData.append("content_attributes[in_reply_to]", replyId.toString());
      }

      filesToSend.forEach(file => {
        formData.append("attachments[]", file);
      });

      const success = await sendMessageAction(url, token, activeConvId, formData);
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

  async function handleAssignAgent(assigneeId: number) {
    if (!activeConvId) return;
    await assignAgentAction(url, token, activeConvId, assigneeId);
    fetchConversations();
  }

  async function handleUpdatePriority(priority: string) {
    if (!activeConvId) return;
    await updatePriorityAction(url, token, activeConvId, priority === 'none' ? null : priority);
    fetchConversations();
  }

  async function handleToggleStatus(newStatus: string) {
    if (!activeConvId) return;
    await toggleStatusAction(url, token, activeConvId, newStatus);
    fetchConversations();
    if (newStatus === 'resolved' && filterStatus === 'open') {
      setActiveConvId(null);
    }
  }

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!activeConv || !newTicket.title || !newTicket.description) return;
    
    setCreatingTicket(true);
    const emailOrPhone = activeConv.meta?.sender?.email || activeConv.meta?.sender?.phone_number || "";
    const res = await createTicketAction(newTicket.title, newTicket.description, emailOrPhone);
    
    if (res.error) {
      alert("Erro ao criar chamado: " + res.error);
    } else {
      setIsTicketModalOpen(false);
      setNewTicket({ title: "", description: "" });
      
      // Envia uma mensagem interna no chat informando o número do chamado
      const ticketId = res.data?.id;
      if (ticketId) {
        const formData = new FormData();
        formData.append("content", `Chamado #${ticketId} criado com sucesso no GLPI.`);
        formData.append("private", "true");
        await sendMessageAction(url, token, activeConv.id, formData);
        fetchMessages(activeConv.id);
      } else {
        alert("Chamado criado com sucesso!");
      }
    }
    setCreatingTicket(false);
  }

  function formatTime(unixTimestamp: number) {
    if (!unixTimestamp) return "";
    return new Date(unixTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const formatRecordingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const activeConv = conversations.find(c => c.id === activeConvId);
  const filteredMacros = cannedResponses.filter(r => r.short_code.toLowerCase().includes(macroFilter));

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

      <div className="relative flex h-[calc(100vh-7.5rem)] w-full bg-white overflow-hidden rounded-t-lg shadow-sm border border-gray-200" onClick={() => {setOpenMenuMsgId(null); setShowEmojis(false);}}>
        {/* Left Sidebar - Conversations */}
        <div className={`w-full md:w-1/3 lg:w-1/4 md:min-w-[280px] border-r border-gray-200 flex flex-col bg-gray-50 shrink-0 ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-800">Conversas</h2>
              <div className="relative group">
                <button className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium text-gray-700 flex items-center gap-1 transition-colors">
                  <Filter className="w-4 h-4" /> {filterStatus === 'open' ? 'Abertas' : filterStatus === 'resolved' ? 'Resolvidas' : 'Todas'}
                </button>
                <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 overflow-hidden">
                  <button onClick={() => setFilterStatus('open')} className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${filterStatus === 'open' ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>Abertas</button>
                  <button onClick={() => setFilterStatus('resolved')} className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${filterStatus === 'resolved' ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>Resolvidas</button>
                  <button onClick={() => setFilterStatus('all')} className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${filterStatus === 'all' ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}>Todas</button>
                </div>
              </div>
            </div>
            
            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              <button 
                onClick={() => setFilterAssignee('me')} 
                className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${filterAssignee === 'me' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Minhas
              </button>
              <button 
                onClick={() => setFilterAssignee('unassigned')} 
                className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${filterAssignee === 'unassigned' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Não atribuídas
              </button>
              <button 
                onClick={() => setFilterAssignee('all')} 
                className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${filterAssignee === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Todos
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Carregando...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                <AlertCircle className="w-10 h-10 mb-2 opacity-50" />
                <p>Nenhuma conversa encontrada.</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const sender = conv.meta?.sender;
                const lastMsg = conv.messages?.[0]?.content || (conv.messages?.[0]?.attachments?.length > 0 ? "Anexo" : "Sem mensagens");
                const time = formatTime(conv.last_activity_at);
                
                return (
                  <div 
                    key={conv.id}
                    onClick={() => setActiveConvId(conv.id)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors flex gap-3 ${activeConvId === conv.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                  >
                    <div className="relative w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      {sender?.thumbnail ? (
                        <img 
                          src={sender.thumbnail} 
                          alt={sender.name || "Avatar"} 
                          className="w-full h-full object-cover rounded-full" 
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className="w-full h-full items-center justify-center rounded-full" style={{ display: sender?.thumbnail ? 'none' : 'flex' }}>
                        <UserIcon className="w-6 h-6" />
                      </div>
                      {/* Online dot */}
                      {sender?.availability_status === 'online' && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
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

        {/* Center Main - Chat */}
        <div className={`flex-1 flex-col bg-[#e5ddd5] min-w-0 border-r border-gray-200 relative ${!activeConvId ? 'hidden md:flex' : 'flex'}`}>
          {activeConvId && activeConv ? (
            <>
              {/* Header */}
              <div className="h-16 px-4 md:px-6 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setActiveConvId(null)} 
                    className="md:hidden p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Voltar para conversas"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={() => setShowContactInfo(!showContactInfo)}
                    className="flex items-center gap-3 hover:bg-gray-50 p-1.5 rounded-lg transition-colors text-left"
                  >
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
                      <h3 className="font-bold text-gray-900 text-sm md:text-base leading-tight">{activeConv.meta?.sender?.name || activeConv.meta?.sender?.phone_number || "Desconhecido"}</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {activeConv.meta?.sender?.phone_number || "Sem telefone"}
                      </p>
                    </div>
                  </button>
                </div>
                
                <button 
                  onClick={() => setShowContactInfo(!showContactInfo)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                  title="Informações do contato"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4" ref={messagesContainerRef}>
                {messages.map((msg) => {
                  const isOutgoing = msg.message_type === 1;
                  const isActivity = msg.message_type === 3 || msg.message_type === 2;
                  const isPrivateMsg = msg.private;

                  if (isActivity) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <span className="px-3 py-1 bg-yellow-100/80 text-yellow-800 text-xs rounded-lg shadow-sm text-center max-w-[80%]">
                          {msg.content}
                        </span>
                      </div>
                    );
                  }

                  const quotedMsgId = msg.content_attributes?.in_reply_to;
                  const quotedMsg = quotedMsgId ? messages.find(m => m.id === quotedMsgId) : null;

                  return (
                    <div key={msg.id} className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
                      <div className={`group max-w-[80%] md:max-w-[70%] p-3 rounded-lg shadow-sm relative ${isPrivateMsg ? 'bg-[#fff5c4] text-yellow-900' : isOutgoing ? 'bg-[#d9fdd3] text-gray-900' : 'bg-white text-gray-900'} ${isOutgoing ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
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

                        {isPrivateMsg && (
                          <div className="text-xs font-bold text-yellow-600 mb-1 flex items-center gap-1 uppercase">
                            🔒 Nota Privada
                          </div>
                        )}

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
                        <span className="text-[10px] opacity-60 block text-right mt-1 flex items-center justify-end gap-1">
                          {formatTime(msg.created_at)}
                          {isOutgoing && !isPrivateMsg && (
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

              {/* Input Area (New Rich Input) */}
              <div className={`border-t border-gray-200 flex flex-col p-4 pt-2 transition-colors ${isPrivate ? 'bg-[#fff9e6]' : 'bg-[#f0f2f5]'}`}>
                
                {/* Tabs */}
                <div className="flex items-center gap-2 mb-2">
                  <button 
                    onClick={() => setIsPrivate(false)}
                    className={`px-4 py-1.5 rounded-t-lg text-sm font-medium transition-colors ${!isPrivate ? 'bg-white text-gray-800 shadow-sm border border-gray-200 border-b-0 relative z-10 top-[1px]' : 'text-gray-500 hover:bg-black/5'}`}
                  >
                    Responder
                  </button>
                  <button 
                    onClick={() => setIsPrivate(true)}
                    className={`px-4 py-1.5 rounded-t-lg text-sm font-medium transition-colors flex items-center gap-1 ${isPrivate ? 'bg-[#fff5c4] text-yellow-800 shadow-sm border border-yellow-200 border-b-0 relative z-10 top-[1px]' : 'text-gray-500 hover:bg-black/5'}`}
                  >
                    🔒 Mensagem Privada
                  </button>
                </div>

                {replyingTo && (
                  <div className="px-4 py-2 bg-white/50 border border-gray-200 rounded-t-lg flex items-center justify-between mb-0">
                    <div className="bg-black/5 p-2 border-l-4 border-blue-500 rounded-md flex-1 min-w-0 mr-4">
                      <p className="font-semibold text-blue-600 text-xs mb-0.5">
                        Respondendo a {replyingTo.message_type === 1 ? "Você" : activeConv.meta?.sender?.name || "Contato"}
                      </p>
                      <p className="text-gray-600 text-sm truncate">{replyingTo.content || "Anexo"}</p>
                    </div>
                    <button onClick={() => setReplyingTo(null)} className="p-1 text-gray-500 hover:bg-gray-200 rounded-full transition-colors shrink-0">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                <form onSubmit={sendMessage} className={`flex flex-col border border-gray-200 shadow-sm rounded-lg overflow-visible ${isPrivate ? 'bg-[#fff5c4]' : 'bg-white'}`}>
                  
                  {/* Macros Popover */}
                  {showMacros && filteredMacros.length > 0 && (
                    <div className="absolute bottom-[100px] left-6 w-80 max-h-64 overflow-y-auto bg-white border border-gray-200 shadow-2xl rounded-lg z-50">
                      <div className="px-3 py-2 text-xs font-bold text-gray-500 bg-gray-50 border-b border-gray-100 uppercase tracking-wider">
                        Respostas Prontas
                      </div>
                      {filteredMacros.map(macro => (
                        <button 
                          key={macro.id}
                          type="button"
                          onClick={() => insertMacro(macro.content)}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0 transition-colors"
                        >
                          <p className="text-sm font-semibold text-blue-600 mb-0.5">/{macro.short_code}</p>
                          <p className="text-xs text-gray-600 truncate">{macro.content}</p>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Attachment Previews */}
                  {attachments.length > 0 && (
                    <div className="flex gap-2 p-3 pb-0 overflow-x-auto">
                      {attachments.map((file, i) => (
                        <div key={i} className="relative bg-black/5 rounded-md p-2 pr-8 flex items-center gap-2 max-w-[200px] border border-gray-200">
                          <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                          <span className="text-xs text-gray-700 truncate">{file.name}</span>
                          <button type="button" onClick={() => removeAttachment(i)} className="absolute right-1 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded-full text-gray-500">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Textarea */}
                  <div className="px-3 pt-3 pb-1">
                    <textarea 
                      ref={textareaRef}
                      value={inputText}
                      onChange={handleInputChange}
                      onKeyDown={handleInputKeyDown}
                      placeholder={isPrivate ? "Digite uma nota privada..." : "Shift + enter para nova linha. Digite '/' para selecionar uma Resposta Pronta."}
                      className="w-full bg-transparent border-none focus:ring-0 outline-none text-gray-800 resize-none min-h-[44px] max-h-[150px] text-[15px] leading-relaxed"
                      rows={1}
                    />
                  </div>

                  {/* Toolbar */}
                  <div className="flex items-center justify-between p-2 pt-1 border-t border-black/5">
                    <div className="flex items-center gap-1 relative">
                      
                      {/* Emoji Picker Toggle */}
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setShowEmojis(!showEmojis); }}
                        className="p-2 text-gray-500 hover:bg-black/5 rounded-md transition-colors"
                        title="Emojis"
                      >
                        <Smile className="w-5 h-5" />
                      </button>

                      {/* Emojis Popover */}
                      {showEmojis && (
                        <div className="absolute bottom-full left-0 mb-2 w-64 h-64 overflow-y-auto bg-white border border-gray-200 shadow-xl rounded-lg p-3 grid grid-cols-6 gap-2 z-50" onClick={(e)=>e.stopPropagation()}>
                          {COMMON_EMOJIS.map(em => (
                            <button key={em} type="button" onClick={() => insertEmoji(em)} className="text-xl hover:bg-gray-100 rounded p-1">{em}</button>
                          ))}
                        </div>
                      )}

                      {/* Attachment Button */}
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        onChange={handleFileSelect}
                      />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-500 hover:bg-black/5 rounded-md transition-colors"
                        title="Anexar Arquivo"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>

                      {/* Audio Button */}
                      {isRecording ? (
                        <div className="flex items-center gap-2 ml-2 bg-red-50 text-red-600 px-3 py-1 rounded-full animate-pulse border border-red-100">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="text-sm font-semibold w-12">{formatRecordingTime(recordingTime)}</span>
                          <button type="button" onClick={stopRecording} className="p-1 hover:bg-red-200 rounded-full ml-1 text-red-700">
                            <Square className="w-4 h-4 fill-current" />
                          </button>
                        </div>
                      ) : (
                        <button 
                          type="button"
                          onClick={startRecording}
                          className="p-2 text-gray-500 hover:bg-black/5 rounded-md transition-colors"
                          title="Gravar Áudio"
                        >
                          <Mic className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    <button 
                      type="submit"
                      disabled={(!inputText.trim() && attachments.length === 0) || isRecording}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      Enviar (↵)
                    </button>
                  </div>

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

        {/* Right Sidebar - Contact & Actions (Overlay Drawer) */}
        {activeConvId && activeConv && showContactInfo && (
          <div className="w-full sm:w-[320px] bg-white flex flex-col overflow-y-auto absolute right-0 top-0 bottom-0 z-40 shadow-2xl border-l border-gray-200 animate-in slide-in-from-right duration-200">
            <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-gray-50">
              <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wider">Informações do Contato</h2>
              <button onClick={() => setShowContactInfo(false)} className="p-1.5 text-gray-500 rounded-full hover:bg-gray-200 transition-colors">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <div className="p-6">
              {/* Contact Profile */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4 overflow-hidden shadow-sm">
                  {activeConv.meta?.sender?.thumbnail ? (
                    <img 
                      src={activeConv.meta.sender.thumbnail} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="text-2xl font-bold">
                      {activeConv.meta?.sender?.name?.charAt(0)?.toUpperCase() || "C"}
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{activeConv.meta?.sender?.name || "Desconhecido"}</h2>
                <span className={`px-2 py-1 mt-2 text-xs font-medium rounded-full ${activeConv.meta?.sender?.availability_status === 'online' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {activeConv.meta?.sender?.availability_status === 'online' ? 'Online' : 'Indisponível'}
                </span>
              </div>

              {/* Contact Details */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate">{activeConv.meta?.sender?.email || "Indisponível"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                  <span>{activeConv.meta?.sender?.phone_number || "Indisponível"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Hash className="w-4 h-4 text-gray-400 shrink-0" />
                  <span className="truncate" title={activeConv.meta?.sender?.identifier}>{activeConv.meta?.sender?.identifier || "Indisponível"}</span>
                </div>
              </div>

              <hr className="border-gray-100 mb-6" />

              {/* Actions Section */}
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4" /> Ações da conversa
              </h3>

              <div className="mb-4">
                <button
                  onClick={() => setIsTicketModalOpen(true)}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Ticket className="w-4 h-4" />
                  Abrir Chamado (GLPI)
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Agent Assignment */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Agente atribuído</label>
                  <select 
                    value={activeConv.meta?.assignee?.id || ''}
                    onChange={(e) => handleAssignAgent(Number(e.target.value))}
                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 bg-white border"
                  >
                    <option value="">Nenhum</option>
                    {agents.map(agent => (
                      <option key={agent.id} value={agent.id}>{agent.name || agent.available_name}</option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Prioridade</label>
                  <select 
                    value={activeConv.priority || 'none'}
                    onChange={(e) => handleUpdatePriority(e.target.value)}
                    className="w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 bg-white border"
                  >
                    <option value="none">Nenhuma</option>
                    <option value="low">Baixa</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta</option>
                    <option value="urgent">Urgente</option>
                  </select>
                </div>

                {/* Status Toggle */}
                <div className="pt-4">
                  {activeConv.status === 'open' ? (
                    <button 
                      onClick={() => handleToggleStatus('resolved')}
                      className="w-full py-2 px-4 bg-green-50 hover:bg-green-100 text-green-700 font-medium text-sm rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Marcar como Resolvida
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleToggleStatus('open')}
                      className="w-full py-2 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm rounded-md transition-colors flex items-center justify-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4" /> Reabrir Conversa
                    </button>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}
        {/* Right Sidebar */}
      </div>

      {/* Modal Novo Chamado GLPI */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-purple-600" />
                Criar Chamado para {activeConv?.meta?.sender?.name}
              </h2>
              <button onClick={() => setIsTicketModalOpen(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <form onSubmit={handleCreateTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Título</label>
                  <input
                    type="text"
                    required
                    value={newTicket.title}
                    onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                    placeholder="Resumo do problema..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                  <textarea
                    required
                    rows={4}
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                    placeholder="Detalhe o problema..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none resize-none"
                  ></textarea>
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsTicketModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creatingTicket}
                    className="px-5 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {creatingTicket ? "Criando..." : "Salvar Chamado"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
