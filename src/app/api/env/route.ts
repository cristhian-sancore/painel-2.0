import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ 
    chatwootUrl: process.env.CHATWOOT_API_URL, 
    chatwootToken: process.env.CHATWOOT_ACCESS_TOKEN 
  });
}
