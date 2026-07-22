import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 overflow-hidden font-sans selection:bg-blue-500/30">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden relative">
        {/* Subtle background glow effect */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <Header />
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth z-0 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
