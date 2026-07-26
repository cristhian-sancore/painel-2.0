import { Server, Wrench, HardDrive, Globe } from "lucide-react";

export default function DatacenterPage() {
  return (
    <div className="max-w-6xl mx-auto py-12 px-4 flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-500/20 rounded-3xl flex items-center justify-center mb-8 relative">
        <Server className="w-12 h-12" />
        <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-white p-2 rounded-full shadow-lg">
          <Wrench className="w-5 h-5" />
        </div>
      </div>
      
      <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
        Módulo Datacenter
      </h1>
      
      <p className="text-xl text-gray-500 max-w-xl mb-8 leading-relaxed">
        Estamos trabalhando nos bastidores para conectar esta área ao seu Portainer. Em breve você poderá gerenciar seus containers e instâncias diretamente por aqui.
      </p>

      <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-semibold border border-blue-100">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
        </span>
        Em Construção
      </div>
    </div>
  );
}
