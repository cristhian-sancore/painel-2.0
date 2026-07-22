"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Key, Server, Loader2 } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [installationKey, setInstallationKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/setup/status")
      .then((res) => res.json())
      .then((data) => {
        if (!data.isSetupRequired) {
          router.push("/login"); // Setup já foi feito, manda pro login
        } else {
          setChecking(false);
        }
      })
      .catch(() => setChecking(false));
  }, [router]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, installationKey }),
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Erro ao realizar o setup.");
      }

      router.push("/login?setup=success");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-4 font-sans relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md bg-[#1e293b]/80 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-700/50 z-10">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <Server className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center text-white mb-2">Configuração Inicial</h2>
          <p className="text-center text-slate-400 mb-8 text-sm">
            Bem-vindo ao Painel! Crie a sua conta de Administrador usando a Chave de Instalação.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSetup} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300 ml-1">E-mail do Administrador</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-[#0f172a]/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="admin@sancore.com.br"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300 ml-1">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-[#0f172a]/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  placeholder="••••••••••••"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-300 ml-1">Chave de Instalação (INSTALLATION_KEY)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={installationKey}
                  onChange={(e) => setInstallationKey(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-[#0f172a]/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="Digite a chave secreta"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-[#1e293b] transform transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Concluir Instalação"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
