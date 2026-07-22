"use client";

import { useState, useEffect } from "react";
import { fetchGroupsAction, createGroupAction, deleteGroupAction, updateGroupAction } from "./actions";
import { Shield, Plus, CheckCircle2, AlertCircle, Trash2, RefreshCw, X, Edit } from "lucide-react";

const PERMISSIONS = [
  { id: "chatwoot_admin", label: "Acesso ao Chatwoot" },
  { id: "evolution_admin", label: "Acesso ao Evolution (WhatsApp)" },
  { id: "glpi_admin", label: "Acesso ao GLPI (Chamados)" },
  { id: "datacenter_admin", label: "Acesso ao Datacenter" },
  { id: "dns_admin", label: "Acesso ao DNS (Cloudflare)" },
  { id: "storage_admin", label: "Acesso ao Storage" },
  { id: "users_admin", label: "Gerenciar Usuários e Grupos" },
];

export default function GroupsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [groups, setGroups] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<any>(null);

  // Form State
  const [name, setName] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

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

  function openNewModal() {
    setError(null);
    setSuccessMsg(null);
    setEditingGroup(null);
    setName("");
    setSelectedPerms([]);
    setIsModalOpen(true);
  }

  function openEditModal(group: any) {
    setError(null);
    setSuccessMsg(null);
    setEditingGroup(group);
    setName(group.name);
    try {
      setSelectedPerms(JSON.parse(group.permissions || "[]"));
    } catch {
      setSelectedPerms([]);
    }
    setIsModalOpen(true);
  }

  function togglePermission(id: string) {
    setSelectedPerms(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("permissions", JSON.stringify(selectedPerms));

    let res;
    if (editingGroup) {
      res = await updateGroupAction(editingGroup.id, formData);
    } else {
      res = await createGroupAction(formData);
    }

    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      setSuccessMsg(editingGroup ? "Grupo atualizado com sucesso!" : "Grupo criado com sucesso!");
      setIsModalOpen(false);
      loadData();
    }
    setLoading(false);
  }

  async function handleDelete(id: string, groupName: string) {
    if (!confirm(`Tem certeza que deseja excluir o grupo "${groupName}"?`)) return;
    
    setLoadingData(true);
    const res = await deleteGroupAction(id);
    if (res.success) {
      setSuccessMsg(`Grupo ${groupName} excluído com sucesso!`);
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
          onClick={openNewModal}
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
                <th className="px-6 py-4 font-medium">Permissões (Qtd)</th>
                <th className="px-6 py-4 font-medium">Data de Criação</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {groups.map((group) => {
                let permsCount = 0;
                try {
                  permsCount = JSON.parse(group.permissions || "[]").length;
                } catch {}
                
                return (
                  <tr key={group.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{group.name}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium">
                        {permsCount} concedidas
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(group.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(group)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Editar Grupo"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(group.id, group.name)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir Grupo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {groups.length === 0 && !loadingData && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Nenhum grupo encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                {editingGroup ? (
                  <><Edit className="w-5 h-5 text-indigo-500" /> Editar Grupo</>
                ) : (
                  <><Plus className="w-5 h-5 text-indigo-500" /> Novo Grupo</>
                )}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Grupo *
                  </label>
                  <input 
                    type="text" 
                    id="name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Ex: Administrador"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-gray-900"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Grupos com a palavra "Administrador" darão acesso total também no Chatwoot.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Permissões de Acesso ao Painel
                  </label>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {PERMISSIONS.map(perm => (
                      <label key={perm.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          checked={selectedPerms.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                        <span className="ml-3 text-sm text-gray-700 font-medium select-none">
                          {perm.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg flex items-start gap-2 border border-red-100">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p className="text-xs">{error}</p>
                  </div>
                )}

                <div className="pt-4 flex gap-3 justify-end border-t border-gray-100">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-lg transition-colors">
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? "Salvando..." : (editingGroup ? "Salvar Alterações" : "Criar Grupo")}
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
