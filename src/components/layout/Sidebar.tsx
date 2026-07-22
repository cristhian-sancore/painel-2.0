import Link from 'next/link';
import { LayoutDashboard, MessageSquare, Ticket, Server, Globe, HardDrive, Settings, Smartphone, Shield, Users } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Chat', icon: MessageSquare, path: '/chat' },
    { name: 'WhatsApp (Evo)', icon: Smartphone, path: '/evolution' },
    { name: 'Chamados (GLPI)', icon: Ticket, path: '/glpi' },
    { name: 'Datacenter', icon: Server, path: '/datacenter' },
    { name: 'DNS (Cloudflare)', icon: Globe, path: '/dns' },
    { name: 'Storage', icon: HardDrive, path: '/storage' },
    { name: 'Grupos de Acesso', icon: Shield, path: '/groups' },
    { name: 'Usuários', icon: Users, path: '/users' },
  ];

  return (
    <aside className="w-64 h-screen bg-[#1e293b] border-r border-[#334155] flex flex-col transition-all z-20">
      <div className="h-16 flex items-center px-6 border-b border-[#334155]">
        <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3 shadow-lg shadow-blue-500/20">
          <Server className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg tracking-wide text-white">Sancore<span className="text-blue-400">DC</span></span>
      </div>
      
      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Menu Principal
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-[#334155] transition-all group"
            >
              <Icon className="w-5 h-5 mr-3 text-slate-400 group-hover:text-blue-400 transition-colors" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#334155]">
        <Link href="/settings" className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-slate-300 hover:text-white hover:bg-[#334155] transition-colors group">
          <Settings className="w-5 h-5 mr-3 text-slate-400 group-hover:text-white" />
          Configurações
        </Link>
      </div>
    </aside>
  );
}
