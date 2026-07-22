import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";
import ChatInterface from "./ChatInterface";
import { MessageSquare } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ChatPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center text-gray-500">
        Faça login para acessar o chat.
      </div>
    );
  }

  // Pegar o token do Chatwoot do usuário no banco
  let user = null;
  try {
    user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });
  } catch (error: any) {
    // If the database is missing the new columns (e.g., in VPS volume), add them automatically
    if (error.message && error.message.includes('chatwootAccessToken')) {
      console.log("Auto-migrating User table to add chatwoot columns...");
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE User ADD COLUMN chatwootId INTEGER;`);
      } catch (e) {}
      try {
        await prisma.$executeRawUnsafe(`ALTER TABLE User ADD COLUMN chatwootAccessToken TEXT;`);
      } catch (e) {}
      
      // Try again
      user = await prisma.user.findUnique({
        where: { email: session.user.email }
      });
    } else {
      throw error;
    }
  }

  // --- Auto-fill admin token for VPS transition ---
  if (user && !user.chatwootAccessToken && user.email === "cristhiansancore@gmail.com") {
    console.log("Auto-filling admin Chatwoot token...");
    try {
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          chatwootAccessToken: "i9Ch9WjTicBEyfBtiqqNukZS",
          chatwootId: 1
        }
      });
    } catch (e) {
      console.error("Failed to auto-fill admin token:", e);
    }
  }

  if (!user?.chatwootAccessToken) {
    return (
      <div className="flex flex-col h-[calc(100vh-4rem)] bg-white items-center justify-center text-gray-500">
        <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">Conta não vinculada</h2>
        <p className="max-w-md text-center mb-6">
          Seu usuário não possui um token de acesso pessoal do Chatwoot configurado.
        </p>
        <p className="max-w-md text-center text-sm text-gray-400">
          Você precisa ser um usuário cadastrado com sincronização automática do Chatwoot no Painel.
        </p>
      </div>
    );
  }

  const urlSetting = await prisma.setting.findUnique({ where: { key: "chatwoot_url" } });
  let chatwootUrl = urlSetting?.value || process.env.CHATWOOT_API_URL || "https://chatwoot2.cristhiansancore.com.br";
  
  if (!chatwootUrl.startsWith("http")) {
    chatwootUrl = "https://" + chatwootUrl;
  }

  return <ChatInterface token={user.chatwootAccessToken} url={chatwootUrl} />;
}
