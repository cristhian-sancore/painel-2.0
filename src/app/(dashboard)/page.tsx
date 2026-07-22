import { Users, Server, Ticket, MessageSquare } from 'lucide-react';

export default function Home() {
  const stats = [
    { label: 'VMs Ativas', value: '12', icon: Server, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Chamados Abertos', value: '4', icon: Ticket, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { label: 'Clientes Ativos', value: '28', icon: Users, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Mensagens Hoje', value: '156', icon: MessageSquare, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">Visão Geral</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20">
          + Novo Cliente
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-[#1e293b]/80 backdrop-blur-sm border border-[#334155] rounded-xl p-6 flex items-center hover:border-blue-500/50 transition-colors shadow-sm">
              <div className={`p-4 rounded-lg ${stat.bg} mr-4`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
              </div>
            </div>
          )
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1e293b]/80 backdrop-blur-sm border border-[#334155] rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4">Últimos Chamados (GLPI)</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-[#0f172a]/50 rounded-lg border border-[#334155]/50 hover:border-[#334155] transition-colors">
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-rose-500 mr-4"></div>
                  <div>
                    <p className="font-medium text-white text-sm">Problema com acesso VPN</p>
                    <p className="text-xs text-slate-400 mt-1">Cliente A • Atualizado há 2h</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-rose-500/10 text-rose-400 text-xs font-medium border border-rose-500/20">
                  Alta Prioridade
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1e293b]/80 backdrop-blur-sm border border-[#334155] rounded-xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-white mb-4">Status Datacenter</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300 font-medium">CPU Global</span>
                <span className="text-slate-400">45%</span>
              </div>
              <div className="w-full bg-[#0f172a] rounded-full h-2 border border-[#334155]">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300 font-medium">RAM Global</span>
                <span className="text-slate-400">72%</span>
              </div>
              <div className="w-full bg-[#0f172a] rounded-full h-2 border border-[#334155]">
                <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '72%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-300 font-medium">Storage Global</span>
                <span className="text-slate-400">30%</span>
              </div>
              <div className="w-full bg-[#0f172a] rounded-full h-2 border border-[#334155]">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
