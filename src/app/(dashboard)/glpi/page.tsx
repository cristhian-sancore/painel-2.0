"use client";

import { useState, useEffect } from "react";
import { fetchTicketsAction, createTicketAction, getTicketFollowupsAction, addTicketFollowupAction, solveTicketAction, updateTicketAction, deleteTicketAction } from "./actions";
import { Ticket, Plus, RefreshCw, AlertCircle, CheckCircle2, User, Clock, FileText, Send, Check, Edit2, Trash2, X, Save, Users, Server } from "lucide-react";

export default function GlpiPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Modal para criar chamado
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ title: "", description: "", clientInfo: "" });
  const [creating, setCreating] = useState(false);

  // Modal de Detalhes
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [followups, setFollowups] = useState<any[]>([]);
  const [loadingFollowups, setLoadingFollowups] = useState(false);
  const [newFollowup, setNewFollowup] = useState("");
  const [addingFollowup, setAddingFollowup] = useState(false);
  const [solving, setSolving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusMap: Record<number, string> = { 1: "Novo", 2: "Processando (atribuído)", 3: "Processando (planejado)", 4: "Pendente", 5: "Solucionado", 6: "Fechado" };
  const levelMap: Record<number, string> = { 1: "Muito Baixa", 2: "Baixa", 3: "Média", 4: "Alta", 5: "Muito Alta" };
  const typeMap: Record<number, string> = { 1: "Incidente", 2: "Requisição" };

  useEffect(() => {
    loadTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      loadFollowups(selectedTicket.id);
      setIsEditing(false);
      setEditData({
        name: selectedTicket.name,
        type: selectedTicket.type || 1,
        status: selectedTicket.status || 1,
        urgency: selectedTicket.urgency || 3,
        impact: selectedTicket.impact || 3,
        priority: selectedTicket.priority || 3,
        content: selectedTicket.content || "",
      });
    } else {
      setFollowups([]);
      setNewFollowup("");
      setIsEditing(false);
      setEditData({});
    }
  }, [selectedTicket]);

  async function handleUpdateTicket() {
    if (!selectedTicket) return;
    setIsSaving(true);
    const res = await updateTicketAction(selectedTicket.id, editData);
    if (res.success) {
      setSuccess("Chamado atualizado com sucesso!");
      setTimeout(() => setSuccess(null), 3000);
      setIsEditing(false);
      loadTickets(); // Refresh list to get new data
      // Close modal for simplicity or fetch specific ticket again, here we close it to trigger refresh smoothly
      setSelectedTicket(null);
    } else {
      alert("Erro ao atualizar chamado: " + res.error);
    }
    setIsSaving(false);
  }

  async function handleDeleteTicket() {
    if (!selectedTicket) return;
    setIsDeleting(true);
    const res = await deleteTicketAction(selectedTicket.id);
    if (res.success) {
      setSuccess("Chamado excluído com sucesso!");
      setTimeout(() => setSuccess(null), 3000);
      setSelectedTicket(null);
      loadTickets();
    } else {
      alert("Erro ao excluir chamado: " + res.error);
    }
    setIsDeleting(false);
  }

  async function loadFollowups(ticketId: number) {
    setLoadingFollowups(true);
    const res = await getTicketFollowupsAction(ticketId);
    if (res.success && res.data) {
      // Sort by date (oldest first usually)
      setFollowups(res.data.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    }
    setLoadingFollowups(false);
  }

  async function handleAddFollowup(e: React.FormEvent) {
    e.preventDefault();
    if (!newFollowup.trim() || !selectedTicket) return;
    
    setAddingFollowup(true);
    const res = await addTicketFollowupAction(selectedTicket.id, newFollowup);
    if (res.success) {
      setNewFollowup("");
      await loadFollowups(selectedTicket.id);
    } else {
      alert("Erro ao adicionar acompanhamento: " + res.error);
    }
    setAddingFollowup(false);
  }

  async function handleSolveTicket() {
    if (!selectedTicket) return;
    if (!confirm("Tem certeza que deseja marcar este chamado como resolvido?")) return;
    
    setSolving(true);
    const res = await solveTicketAction(selectedTicket.id);
    if (res.success) {
      setSelectedTicket(null);
      loadTickets();
      setSuccess("Chamado marcado como resolvido!");
      setTimeout(() => setSuccess(null), 3000);
    } else {
      alert("Erro ao resolver chamado: " + res.error);
    }
    setSolving(false);
  }

  async function loadTickets() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTicketsAction();
      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setTickets(Array.isArray(res.data) ? res.data : []);
      }
    } catch (e: any) {
      setError(e.message || "Erro ao carregar chamados.");
    }
    setLoading(false);
  }

  async function handleCreateTicket(e: React.FormEvent) {
    e.preventDefault();
    if (!newTicket.title || !newTicket.description) return;
    
    setCreating(true);
    setError(null);
    
    const res = await createTicketAction(newTicket.title, newTicket.description, newTicket.clientInfo);
    
    if (res.error) {
      setError(res.error);
    } else {
      setSuccess("Chamado criado com sucesso!");
      setIsNewTicketOpen(false);
      setNewTicket({ title: "", description: "", clientInfo: "" });
      loadTickets();
      setTimeout(() => setSuccess(null), 3000);
    }
    setCreating(false);
  }

  // Helper para mapear status do GLPI
  const getStatusBadge = (statusId: number) => {
    switch (statusId) {
      case 1: return <span className="px-2 py-1 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md text-xs font-medium">Novo</span>;
      case 2: return <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-xs font-medium">Em Andamento (Atribuído)</span>;
      case 3: return <span className="px-2 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-xs font-medium">Em Andamento (Planejado)</span>;
      case 4: return <span className="px-2 py-1 bg-orange-50 text-orange-700 border border-orange-200 rounded-md text-xs font-medium">Pendente</span>;
      case 5: return <span className="px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md text-xs font-medium">Solucionado</span>;
      case 6: return <span className="px-2 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-md text-xs font-medium">Fechado</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">Desconhecido ({statusId})</span>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Chamados (GLPI)</h1>
            <p className="text-gray-500 text-sm">Gerencie os tickets de suporte do seu Data Center.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadTickets}
            disabled={loading}
            className="p-2.5 text-gray-500 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 rounded-lg transition-all bg-gray-50"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin text-blue-500' : ''}`} />
          </button>
          <button
            onClick={() => setIsNewTicketOpen(true)}
            className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 px-5 rounded-lg transition-colors flex items-center gap-2 shadow-md shadow-gray-900/10"
          >
            <Plus className="w-5 h-5" />
            Novo Chamado
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold">Erro de Conexão com GLPI</p>
            <p className="text-sm mt-1">{error}</p>
            {error.includes("Configurações") && (
              <a href="/settings" className="text-sm underline mt-2 inline-block">Ir para Configurações</a>
            )}
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-3 border border-green-100">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/50 border-b border-gray-100 text-gray-500 uppercase tracking-wider text-xs font-semibold">
              <tr>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4 w-1/3">Título</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tickets.length > 0 ? (
                tickets.map((ticket: any) => (
                  <tr key={ticket.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-500">#{ticket.id}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 truncate max-w-xs" title={ticket.name}>{ticket.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(ticket.date_creation).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedTicket(ticket)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1 ml-auto"
                      >
                        <FileText className="w-4 h-4" /> Detalhes
                      </button>
                    </td>
                  </tr>
                ))
              ) : !loading && !error && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    Nenhum chamado encontrado.
                  </td>
                </tr>
              )}
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    Buscando chamados...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo Chamado */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-gray-500" />
                Criar Novo Chamado
              </h2>
              <button onClick={() => setIsNewTicketOpen(false)} className="text-gray-400 hover:text-gray-700">
                &times;
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">E-mail ou Telefone do Cliente (Opcional)</label>
                  <input
                    type="text"
                    value={newTicket.clientInfo}
                    onChange={(e) => setNewTicket({...newTicket, clientInfo: e.target.value})}
                    placeholder="Ex: cliente@email.com ou 11999999999"
                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Isso tentará vincular o chamado a um usuário existente no GLPI.</p>
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewTicketOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {creating && <RefreshCw className="w-4 h-4 animate-spin" />}
                    Salvar Chamado
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhes do Chamado */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-gray-500 bg-white px-2 py-1 rounded text-sm border border-gray-200">#{selectedTicket.id}</span>
                  {getStatusBadge(isEditing ? editData.status : selectedTicket.status)}
                </div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={e => setEditData({...editData, name: e.target.value})}
                    className="text-xl font-bold text-gray-900 leading-tight w-full px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">{selectedTicket.name}</h2>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isEditing && (
                  <>
                    <button onClick={() => setIsEditing(true)} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center gap-1 transition-colors">
                      <Edit2 className="w-4 h-4" /> Editar
                    </button>
                    <button onClick={handleDeleteTicket} disabled={isDeleting} className="px-3 py-1.5 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 flex items-center gap-1 transition-colors disabled:opacity-50">
                      {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Excluir
                    </button>
                  </>
                )}
                {isEditing && (
                  <button onClick={() => setIsEditing(false)} className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 flex items-center gap-1 transition-colors">
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                )}
                <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-700 bg-white rounded-full p-1 border border-gray-200 shadow-sm ml-2">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Coluna Esquerda: Form de Detalhes */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b pb-2">Informações Básicas</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Data de Abertura</label>
                      <input type="text" readOnly value={new Date(selectedTicket.date_creation).toLocaleString('pt-BR')} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Tipo</label>
                      <select disabled={!isEditing} value={isEditing ? editData.type : selectedTicket.type} onChange={e => setEditData({...editData, type: Number(e.target.value)})} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200">
                        {Object.entries(typeMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                      <select disabled={!isEditing} value={isEditing ? editData.status : selectedTicket.status} onChange={e => setEditData({...editData, status: Number(e.target.value)})} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200">
                        {Object.entries(statusMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Origem da Requisição</label>
                      <input type="text" readOnly value={selectedTicket.requesttypes_id || "Helpdesk"} className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Urgência</label>
                      <select disabled={!isEditing} value={isEditing ? editData.urgency : selectedTicket.urgency} onChange={e => setEditData({...editData, urgency: Number(e.target.value)})} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200">
                        {Object.entries(levelMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Impacto</label>
                      <select disabled={!isEditing} value={isEditing ? editData.impact : selectedTicket.impact} onChange={e => setEditData({...editData, impact: Number(e.target.value)})} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200">
                        {Object.entries(levelMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Prioridade</label>
                      <select disabled={!isEditing} value={isEditing ? editData.priority : selectedTicket.priority} onChange={e => setEditData({...editData, priority: Number(e.target.value)})} className="w-full px-2 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:border-gray-200">
                        {Object.entries(levelMap).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Descrição</label>
                    {isEditing ? (
                      <textarea
                        value={editData.content}
                        onChange={e => setEditData({...editData, content: e.target.value})}
                        rows={6}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      />
                    ) : (
                      <div 
                        className="prose prose-sm max-w-none text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 max-h-48 overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: selectedTicket.content || "Sem descrição." }}
                      />
                    )}
                  </div>
                  
                  {/* Abas estáticas como no GLPI */}
                  <div className="flex gap-2 pt-2 border-t mt-4">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-bold text-gray-600">
                      <Users className="w-3.5 h-3.5" /> Atores <span className="bg-gray-200 text-gray-700 px-1.5 rounded-full">3</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-md text-xs font-bold text-gray-600">
                      <Server className="w-3.5 h-3.5" /> Itens <span className="bg-gray-200 text-gray-700 px-1.5 rounded-full">0</span>
                    </div>
                  </div>
                </div>

                {/* Coluna Direita: Acompanhamentos */}
                <div className="flex flex-col h-full">
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2 border-b pb-2">
                    <Clock className="w-4 h-4" /> Acompanhamentos
                  </h3>
                  
                  <div className="space-y-3 flex-1 overflow-y-auto pr-2 mb-4">
                    {loadingFollowups ? (
                      <div className="text-center py-4 text-gray-400 text-sm flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Carregando...
                      </div>
                    ) : followups.length === 0 ? (
                      <div className="text-sm text-gray-400 bg-gray-50/50 p-4 rounded-xl border border-gray-100 text-center">
                        Nenhum acompanhamento registrado.
                      </div>
                    ) : (
                      followups.map((fw: any) => (
                        <div key={fw.id} className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                          <div className="flex justify-between items-center mb-1.5 border-b border-gray-50 pb-1.5">
                            <span className="text-xs font-bold text-gray-700">{fw.users_id_editor ? "Agente/Usuário" : "Sistema"}</span>
                            <span className="text-xs text-gray-400">{new Date(fw.date).toLocaleString('pt-BR')}</span>
                          </div>
                          <div className="text-sm text-gray-600 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: fw.content }} />
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleAddFollowup} className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 shrink-0">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Novo Acompanhamento</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFollowup}
                        onChange={(e) => setNewFollowup(e.target.value)}
                        placeholder="Digite uma atualização..."
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        disabled={addingFollowup}
                      />
                      <button
                        type="submit"
                        disabled={!newFollowup.trim() || addingFollowup}
                        className="px-3 py-1.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                      >
                        {addingFollowup ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center shrink-0">
              {isEditing ? (
                <button
                  onClick={handleUpdateTicket}
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Salvar Chamado
                </button>
              ) : (
                selectedTicket.status !== 5 && selectedTicket.status !== 6 ? (
                  <button
                    onClick={handleSolveTicket}
                    disabled={solving}
                    className="px-4 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {solving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Resolver Chamado
                  </button>
                ) : (
                  <div className="text-sm font-bold text-green-600 flex items-center gap-2 px-4 py-2.5 bg-green-50 rounded-xl border border-green-100">
                    <CheckCircle2 className="w-5 h-5" /> Chamado Resolvido/Fechado
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
