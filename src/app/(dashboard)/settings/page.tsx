"use client";

import { useState, useEffect } from "react";
import { Save, Server, MessageSquare, Monitor, Loader2, Database } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [settings, setSettings] = useState({
    evolution_url: "",
    evolution_key: "",
    chatwoot_url: "",
    chatwoot_token: "",
    glpi_url: "",
    glpi_token: "",
    proxmox_url: "",
    proxmox_token: "",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ type: "success", text: "Configurações salvas com sucesso!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erro ao salvar." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações Globais</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gerencie as conexões de API com os serviços do seu Data Center.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          Salvar Alterações
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 border ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* WhatsApp Evolution */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-gray-800">WhatsApp Evolution</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API URL</label>
              <input
                type="text"
                name="evolution_url"
                value={settings.evolution_url}
                onChange={handleChange}
                placeholder="https://api.seudominio.com.br"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Global API Key</label>
              <input
                type="password"
                name="evolution_key"
                value={settings.evolution_key}
                onChange={handleChange}
                placeholder="Sua chave secreta do Evolution"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Chatwoot */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-gray-800">Chatwoot</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API URL</label>
              <input
                type="text"
                name="chatwoot_url"
                value={settings.chatwoot_url}
                onChange={handleChange}
                placeholder="https://chatwoot.seudominio.com.br"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Token (Admin)</label>
              <input
                type="password"
                name="chatwoot_token"
                value={settings.chatwoot_token}
                onChange={handleChange}
                placeholder="WGMzdQwPraor579LG7o9NRcm"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Proxmox */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg text-orange-600">
              <Server className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-gray-800">Proxmox VE</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Host / API URL</label>
              <input
                type="text"
                name="proxmox_url"
                value={settings.proxmox_url}
                onChange={handleChange}
                placeholder="https://192.168.0.10:8006/api2/json"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Token de API (ID=Secret)</label>
              <input
                type="password"
                name="proxmox_token"
                value={settings.proxmox_token}
                onChange={handleChange}
                placeholder="root@pam!TokenId=Secret"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* GLPI */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gray-50 px-6 py-4 flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
              <Database className="w-5 h-5" />
            </div>
            <h2 className="font-semibold text-gray-800">GLPI Helpdesk</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API URL</label>
              <input
                type="text"
                name="glpi_url"
                value={settings.glpi_url}
                onChange={handleChange}
                placeholder="https://glpi.seudominio.com.br/apirest.php"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">App Token / User Token</label>
              <input
                type="password"
                name="glpi_token"
                value={settings.glpi_token}
                onChange={handleChange}
                placeholder="Seus tokens do GLPI"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
