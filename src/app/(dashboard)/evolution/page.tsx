"use client";

import { useState, useEffect } from "react";
import { createWhatsAppInstance, fetchInstancesAction, deleteInstanceAction, getQrCodeAction, fetchTeamsAction } from "./actions";
import { QrCode, Smartphone, Plus, CheckCircle2, AlertCircle, Trash2, RefreshCw, Users, Server, X } from "lucide-react";

export default function EvolutionPage() {
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [instances, setInstances] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Modals state
  const [isNewInstanceModalOpen, setIsNewInstanceModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoadingData(true);
    try {
      const [instRes, teamsRes] = await Promise.all([
        fetchInstancesAction(),
        fetchTeamsAction()
      ]);
      
      if (instRes.success && instRes.data) {
        setInstances(Array.isArray(instRes.data) ? instRes.data : []);
      }
      if (teamsRes.success && teamsRes.data) {
        setTeams(teamsRes.data);
      }
    } catch (e) {
      console.error("Erro ao carregar dados", e);
    }
    setLoadingData(false);
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    setQrCode(null);
    setSuccessMsg(null);

    const res = await createWhatsAppInstance(formData);

    if (res.error) {
      setError(res.error);
    } else if (res.success) {
      setSuccessMsg(res.message!);
      if (res.qrCode) {
        setQrCode(res.qrCode);
        setIsQrModalOpen(true);
      }
      setIsNewInstanceModalOpen(false);
      loadData(); // recarrega a lista
    }
    
    setLoading(false);
  }

  async function handleDelete(instanceName: string) {
    if (!confirm(`Tem certeza que deseja apagar a instância "${instanceName}"? A inbox do Chatwoot também será apagada.`)) return;
    
    setLoadingData(true);
    const res = await deleteInstanceAction(instanceName);
    if (res.success) {
      setSuccessMsg(`Instância ${instanceName} excluída com sucesso!`);
      loadData();
    } else {
      setError(res.error || "Erro ao excluir instância");
      setLoadingData(false);
    }
  }

  async function handleShowQr(instanceName: string) {
    setQrCode(null);
    setError(null);
    setSuccessMsg(`Buscando QR Code para ${instanceName}...`);
    setIsQrModalOpen(true);
    
    const res = await getQrCodeAction(instanceName);
    if (res.success && res.base64) {
      setQrCode(res.base64);
      setSuccessMsg(`QR Code da instância ${instanceName} carregado. Leia pelo WhatsApp.`);
    } else {
      setError(res.error || "Não foi possível carregar o QR Code. Talvez a instância já esteja conectada.");
      setSuccessMsg(null);
    }
  }

  function closeModals() {
    setIsNewInstanceModalOpen(false);
    setIsQrModalOpen(false);
    setError(null);
    setSuccessMsg(null);
    setQrCode(null);
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">WhatsApp Evolution</h1>
            <p className="text-gray-500 text-sm">Conecte novos números e gerencie suas instâncias integradas ao Chatwoot.</p>
          </div>
        </div>
        <button
          onClick={() => {
            setError(null);
            setSuccessMsg(null);
            setIsNewInstanceModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nova Instância
        </button>
      </div>

      {error && !isNewInstanceModalOpen && !isQrModalOpen && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3 border border-red-100">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {successMsg && !isNewInstanceModalOpen && !isQrModalOpen && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-start gap-3 border border-green-100">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm">{successMsg}</p>
        </div>
      )}

      {/* Instâncias List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Server className="w-5 h-5 text-purple-500" />
            Instâncias Gerenciadas
          </h2>
          <button 
            onClick={loadData}
            disabled={loadingData}
            className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
            title="Atualizar"
          >
            <RefreshCw className={`w-5 h-5 ${loadingData ? 'animate-spin text-blue-500' : ''}`} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Nome da Instância</th>
                <th className="px-6 py-4 font-medium">Status da Conexão</th>
                <th className="px-6 py-4 font-medium">Integração</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {instances.map((inst, index) => {
                const instance = inst.instance || inst;
                const instanceName = instance.name || instance.instanceName || "";
                const connectionStatus = instance.connectionStatus || instance.status;
                const isOnline = connectionStatus === "open";
                const isConnecting = connectionStatus === "connecting";
                
                if (!instanceName) return null; // Prevenção extra
                
                return (
                  <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{instanceName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : isConnecting ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
                        <span className={isOnline ? 'text-green-700' : isConnecting ? 'text-yellow-700' : 'text-red-700'}>
                          {isOnline ? 'Conectado' : isConnecting ? 'Conectando' : 'Desconectado'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">Chatwoot</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {!isOnline && (
                          <button 
                            onClick={() => handleShowQr(instanceName)}
                            className="px-3 py-1.5 text-sm bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                          >
                            <QrCode className="w-4 h-4" />
                            QR Code
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(instanceName)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir Instância"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {instances.length === 0 && !loadingData && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Nenhuma instância encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nova Instância */}
      {isNewInstanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                Nova Instância
              </h2>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form action={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="instanceName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome do Número/Setor
                  </label>
                  <input 
                    type="text" 
                    id="instanceName" 
                    name="instanceName" 
                    required
                    placeholder="Ex: Suporte Financeiro"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                  />
                  <p className="text-xs text-gray-400 mt-1">Este nome será usado para criar a Caixa de Entrada no Chatwoot.</p>
                </div>

                <div>
                  <label htmlFor="teamId" className="block text-sm font-medium text-gray-700 mb-1">
                    Atribuir a uma Equipe (Opcional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Users className="h-4 w-4 text-gray-400" />
                    </div>
                    <select 
                      id="teamId" 
                      name="teamId" 
                      className="w-full pl-10 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none"
                    >
                      <option value="">-- Nenhuma Equipe --</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>{team.name}</option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Os membros desta equipe terão acesso imediato à nova caixa no Chatwoot.</p>
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
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="animate-pulse">Criando e Conectando...</span>
                    ) : (
                      "Gerar QR Code"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="font-medium text-gray-900">Leia o QR Code</h3>
              <button onClick={closeModals} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex flex-col items-center justify-center text-center">
              {qrCode ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Abra o WhatsApp no seu celular, vá em "Aparelhos Conectados" e aponte a câmera.</p>
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm inline-block">
                    <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
                  </div>
                </div>
              ) : error ? (
                <div className="text-red-500 flex flex-col items-center">
                  <AlertCircle className="w-12 h-12 mb-2 opacity-50" />
                  <p className="text-sm">{error}</p>
                </div>
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <RefreshCw className="w-12 h-12 mb-2 animate-spin text-blue-500" />
                  <p className="text-sm">{successMsg || "Carregando QR Code..."}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
