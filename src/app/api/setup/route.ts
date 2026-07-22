import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email, password, installationKey } = await req.json();

    if (!email || !password || !installationKey) {
      return NextResponse.json(
        { error: "E-mail, senha e chave de instalação são obrigatórios." },
        { status: 400 }
      );
    }

    const count = await prisma.user.count();
    if (count > 0) {
      return NextResponse.json(
        { error: "O setup já foi realizado. O sistema já possui um administrador." },
        { status: 403 }
      );
    }

    const systemKey = process.env.INSTALLATION_KEY;
    if (!systemKey) {
      return NextResponse.json(
        { error: "A chave de instalação (INSTALLATION_KEY) não foi definida no servidor." },
        { status: 500 }
      );
    }

    if (installationKey !== systemKey) {
      return NextResponse.json(
        { error: "Chave de instalação incorreta." },
        { status: 401 }
      );
    }

    // Criar o usuário admin
    const newUser = await prisma.user.create({
      data: {
        email,
        password, // TODO: em produção real usar bcrypt
        name: "Administrador",
        role: "ADMIN",
      },
    });

    return NextResponse.json(
      { message: "Administrador criado com sucesso!", user: { email: newUser.email } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating setup admin:", error);
    return NextResponse.json(
      { error: "Erro interno ao configurar o administrador." },
      { status: 500 }
    );
  }
}
