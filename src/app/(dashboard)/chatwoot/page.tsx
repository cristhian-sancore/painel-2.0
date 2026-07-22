import { ChatwootClient } from "@/lib/chatwoot";
import { MessageSquare } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ChatwootPage() {
  let chatwootUrl = "";
  let error = null;

  try {
    const urlSetting = await prisma.setting.findUnique({ where: { key: "chatwoot_url" } });
    chatwootUrl = urlSetting?.value || process.env.CHATWOOT_API_URL || "";
    
    if (!chatwootUrl) {
      throw new Error("URL do Chatwoot não configurada. Vá em Configurações Globais.");
    }

    if (!chatwootUrl.startsWith("http")) {
      chatwootUrl = "https://" + chatwootUrl;
    }
  } catch (err: any) {
    console.error(err);
    error = err.message;
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] bg-gray-50 items-center justify-center">
        <div className="text-center text-red-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-gray-50 border-t border-gray-200">
      <iframe 
        src={chatwootUrl} 
        className="w-full h-full border-none"
        title="Chatwoot Interface"
        allow="camera; microphone; fullscreen; display-capture; picture-in-picture; clipboard-write; clipboard-read"
      />
    </div>
  );
}
