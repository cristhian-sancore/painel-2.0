"use client";

import { Bell, Search, User, LogOut } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-[#1e293b]/80 backdrop-blur-md border-b border-[#334155] flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center bg-[#0f172a] rounded-lg px-3 py-1.5 w-64 border border-[#334155] focus-within:border-blue-500 transition-colors shadow-inner">
        <Search className="w-4 h-4 text-slate-400 mr-2" />
        <input 
          type="text" 
          placeholder="Buscar clientes, VMs, OS..." 
          className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-slate-500"
        />
      </div>

      <div className="flex items-center space-x-4">
        <button className="relative p-2 rounded-full hover:bg-[#334155] transition-colors text-slate-300 hover:text-white">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-[#1e293b]"></span>
        </button>
        
        {session?.user ? (
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-slate-300">{session.user.name}</span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center cursor-pointer border border-[#334155] shadow-md hover:scale-105 transition-transform" title="Perfil">
              <span className="text-white text-xs font-bold">{session.user.name?.charAt(0)}</span>
            </div>
            <button onClick={() => signOut()} className="p-2 text-slate-400 hover:text-rose-400 transition-colors" title="Sair">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center border border-[#334155]">
            <User className="w-4 h-4 text-slate-400" />
          </div>
        )}
      </div>
    </header>
  );
}
