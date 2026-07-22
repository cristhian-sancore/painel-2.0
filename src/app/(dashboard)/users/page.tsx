"use client";

import { useState, useEffect } from "react";
import { fetchUsersAction, createUserAction, deleteUserAction } from "./actions";
import { fetchGroupsAction } from "../groups/actions";
import { Users, Plus, CheckCircle2, AlertCircle, Trash2, RefreshCw, X, Shield } from "lucide-react";

export default function UsersPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoadingData(true);
    const [usersRes, groupsRes] = await Promise.all([
      fetchUsersAction(),
      fetchGroupsAction()
    ]);
    
    if (usersRes.success && usersRes.data) {
      setUsers(usersRes.data);
    } else {
      setError(usersRes.error || "Erro ao carregar usuários.");
    }

    if (groupsRes.success && groupsRes.data) {
      setGroups(groupsRes.data);
    }
    setLoadingData(false);
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const res = await createUserAction(formData);

    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      setSuccessMsg(res.message || "Usuário criado com sucesso!");
      setIsModalOpen(false);
      loadData();
    }
    setLoading(false);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Tem certeza que deseja excluir o usuário "${name}"? Esta ação removerá o acesso ao painel, mas não excluirá do Chatwoot automaticamente.`)) return;
    
    setLoadingData(true);
    const res = await deleteUserAction(id);
    if (res.success) {
      setSuccessMsg(`Usuário ${name} excluído com sucesso!`);
      loadData();
    } else {
      setError(res.error || "Erro ao excluir usuário.");
      setLoadingData(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Usuários do Sistema</h1>
            <p className="text-gray-500 text-sm">Gerencie os acessos, senhas e sincronize com o Chatwoot de forma transparente.</p>
          </div>
        </div>
        <button
          onClick={() => {
            setError(null);
            setSuccessMsg(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Novo Usuário
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
            <Users className="w-5 h-5 text-blue-500" />
            Usuários Cadastrados
          </h2>
          <button 
            onClick={loadData}
            disabled={loadingData}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loadingData ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Nome</th>
                <th className="px-6 py-4 font-medium">E-mail</th>
                <th className="px-6 py-4 font-medium">CPF</th>
                <th className="px-6 py-4 font-medium">Grupo de Acesso</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4">{user.cpf || '-'}</td>
                  <td className="px-6 py-4">
                    {user.accessGroup ? (
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-medium">
                        {user.accessGroup.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic text-xs">Sem Grupo</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(user.id, user.name || user.email)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block"
                      title="Excluir Usuário"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && !loadingData && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl my-8 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                Cadastrar Novo Usuário
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form action={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Nome Completo *</label>
                    <input type="text" id="name" name="name" required placeholder="Ex: João da Silva" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900" />
                  </div>

                  <div>
                    <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 mb-1">CPF</label>
                    <input type="text" id="cpf" name="cpf" placeholder="000.000.000-00" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900" />
                  </div>

                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
                    <input type="date" id="birthDate" name="birthDate" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900" />
                  </div>

                  <div className="md:col-span-2">
                    <hr className="my-2 border-gray-100" />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-mail (Login) *</label>
                    <input type="email" id="email" name="email" required placeholder="joao@empresa.com" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900" />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Senha de Acesso *</label>
                    <input type="password" id="password" name="password" required placeholder="Mínimo 6 caracteres" minLength={6} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900" />
                  </div>

                  <div>
                    <label htmlFor="accessGroupId" className="block text-sm font-medium text-gray-700 mb-1">Grupo de Acesso</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Shield className="h-4 w-4 text-gray-400" />
                      </div>
                      <select id="accessGroupId" name="accessGroupId" required className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none bg-white text-gray-900">
                        <option value="" className="text-gray-900">Selecione um grupo...</option>
                        {groups.map(g => (
                          <option key={g.id} value={g.id} className="text-gray-900">{g.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3 text-blue-800 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 text-blue-600" />
                  <p>
                    <strong>Integração Chatwoot:</strong> Ao salvar, este usuário será criado automaticamente no Chatwoot com a senha e e-mail informados, pronto para atender.
                  </p>
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
                  <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50">
                    {loading ? "Processando..." : "Salvar Usuário"}
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
