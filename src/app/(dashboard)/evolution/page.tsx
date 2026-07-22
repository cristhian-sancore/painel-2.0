"use client";

import { useState } from "react";
import { createWhatsAppInstance } from "./actions";
import { QrCode, Smartphone, Plus, CheckCircle2, AlertCircle } from "lucide-react";

export default function EvolutionPage() {
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
      setQrCode(res.qrCode || null);
    }
    
    setLoading(false);
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
          <Smartphone className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Evolution</h1>
          <p className="text-gray-500 text-sm">Conecte novos números e crie caixas de entrada automaticamente no Chatwoot.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Formulário */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            Nova Instância
          </h2>

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
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3 border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {successMsg && (
            <div className="mt-4 p-4 bg-green-50 text-green-700 rounded-lg flex items-start gap-3 border border-green-100">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm">{successMsg}</p>
            </div>
          )}
        </div>

        {/* QR Code Area */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          {qrCode ? (
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Leia o QR Code</h3>
              <p className="text-sm text-gray-500">Abra o WhatsApp no seu celular, vá em "Aparelhos Conectados" e aponte a câmera.</p>
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm inline-block">
                <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
              </div>
            </div>
          ) : (
            <div className="text-gray-400 max-w-xs">
              <QrCode className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-sm">Preencha o formulário ao lado para gerar o QR Code de conexão.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
