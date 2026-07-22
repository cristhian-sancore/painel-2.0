"use client";

import { useState, useEffect } from "react";
import { fetchGroupsAction, createGroupAction, deleteGroupAction } from "./actions";
import { Shield, Plus, CheckCircle2, AlertCircle, Trash2, RefreshCw, X } from "lucide-react";

export default function GroupsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [groups, setGroups] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoadingData(true);
    const res = await fetchGroupsAction();
    if (res.success && res.data) {
      setGroups(res.data);
    } else {
      setError(res.error || "Erro ao carregar grupos.");
    }
    setLoadingData(false);
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const res = await createGroupAction(formData);

    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      setSuccessMsg("Grupo criado com sucesso!");
      setIsModalOpen(false);
      loadData();
    }
    setLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Tem certeza que deseja excluir o grupo "${name}"?`)) return;
    
    setLoadingData(true);
    const res = await deleteGroupAction(id);
    if (res.success) {
      setSuccessMsg(`Grupo ${name} excluído com sucesso!`);
      loadData();
    } else {
      setError(res.error || "Erro ao excluir grupo.");
      setLoadingData(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grupos de Acesso</h1>
            <p className="text-gray-500 text-sm">Gerencie os níveis de permissão dos usuários do sistema e do Chatwoot.</p>
          </div>
        </div>
        <button
          onClick={() => {
            setError(null);
            setSuccessMsg(null);
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Grupo
        </button>
      </div>

      {error && !isModalOpen && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {successMsg && !isModalOpen && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-start gap-3 border border-green-100">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{successMsg}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            Grupos Cadastrados
          </h2>
          <button 
            onClick={loadData}
            disabled={loadingData}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loadingData ? 'animate-spin text-indigo-500' : ''}`} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Nome do Grupo</th>
                <th className="px-6 py-4 font-medium">Data de Criação</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{group.name}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {new Date(group.createdAt).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(group.id, group.name)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block"
                      title="Excluir Grupo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {groups.length === 0 && !loadingData && (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                    Nenhum grupo encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-500" />
                Novo Grupo
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form action={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Grupo
                  </label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    required
                    placeholder="Ex: Administrador"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Se for "Administrador", o usuário também será admin no Chatwoot. Outros nomes criam Agentes padrão.
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 border border-red-100 mt-4">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-xs">{error}</p>
                  </div>
                )}

                <div className="mt-6">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? "Salvando..." : "Criar Grupo"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
