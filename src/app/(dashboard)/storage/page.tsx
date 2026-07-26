import { HardDrive, Wrench } from "lucide-react";

export default function StoragePage() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="w-24 h-24 bg-gradient-to-tr from-slate-600 to-slate-400 text-white shadow-xl shadow-slate-500/20 rounded-3xl flex items-center justify-center mb-8 relative">
        <HardDrive className="w-12 h-12" />
        <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white p-2 rounded-full shadow-lg">
          <Wrench className="w-5 h-5" />
        </div>
      </div>
      
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
        Módulo de Storage
      </h1>
      
      <p className="text-xl text-gray-500 max-w-xl mb-8 leading-relaxed">
        Estamos arquitetando o módulo de armazenamento para gerenciar seus discos, backups e arquivos centralizados.
      </p>

      <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full font-semibold border border-slate-200">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-500"></span>
        </span>
        Em Construção
      </div>
    </div>
  );
}
