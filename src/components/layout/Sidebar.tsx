import Link from 'next/link';
import { LayoutDashboard, MessageSquare, Ticket, Server, Globe, HardDrive, Settings, Smartphone, Shield, Users } from 'lucide-react';

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export default async function Sidebar() {
  const session = await getServerSession(authOptions);
  let userPerms: string[] = [];
  let isAdmin = false;

  if (session?.user?.email) {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { accessGroup: true }
    });
    if (user) {
      if (user.role === 'admin' || user.role === 'administrator') {
        isAdmin = true;
      }
      if (user.accessGroup && user.accessGroup.permissions) {
        try {
          userPerms = JSON.parse(user.accessGroup.permissions);
        } catch(e) {}
      }
    }
  }

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/', reqPerm: null },
    { name: 'Chat', icon: MessageSquare, path: '/chat', reqPerm: 'chatwoot_admin' },
    { name: 'WhatsApp (Evo)', icon: Smartphone, path: '/evolution', reqPerm: 'evolution_admin' },
    { name: 'Chamados (GLPI)', icon: Ticket, path: '/glpi', reqPerm: 'glpi_admin' },
    { name: 'Datacenter', icon: Server, path: '/datacenter', reqPerm: 'datacenter_admin' },
    { name: 'DNS (Cloudflare)', icon: Globe, path: '/dns', reqPerm: 'dns_admin' },
    { name: 'Storage', icon: HardDrive, path: '/storage', reqPerm: 'storage_admin' },
    { name: 'Grupos de Acesso', icon: Shield, path: '/groups', reqPerm: 'users_admin' },
    { name: 'Usuários', icon: Users, path: '/users', reqPerm: 'users_admin' },
  ];

  const allowedItems = menuItems.filter(item => {
    if (isAdmin) return true;
    if (!item.reqPerm) return true; // Items without required permissions are always visible
    return userPerms.includes(item.reqPerm);
  });

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
        {allowedItems.map((item) => {
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
