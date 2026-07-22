import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await prisma.setting.findMany();
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json(settingsMap);
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    // Convert object to array of {key, value}
    const updates = Object.entries(body).map(([key, value]) => ({
      key,
      value: String(value),
    }));

    // Prisma doesn't have an easy "upsertMany", so we'll do it in a transaction
    const transactions = updates.map((update) => 
      prisma.setting.upsert({
        where: { key: update.key },
        update: { value: update.value },
        create: { key: update.key, value: update.value }
      })
    );

    await prisma.$transaction(transactions);

    return NextResponse.json({ success: true, message: "Configurações salvas!" });
  } catch (error: any) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
