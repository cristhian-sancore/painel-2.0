import { config } from 'dotenv';
import prisma from './src/lib/prisma';
import { ChatwootClient } from './src/lib/chatwoot';

config({ path: '.env' });
config({ path: '.env.local' });

async function run() {
  try {
    const platformToken = "YbswfR8ZdxBDYmHAtbKsFDea";
    const chatwootUrl = "https://chatwoot2.cristhiansancore.com.br";
    const accessToken = "i9Ch9WjTicBEyfBtiqqNukZS";

    console.log("Creating user via platform API...");
    const chatwootRes = await fetch(`${chatwootUrl}/platform/api/v1/users`, {
      method: "POST",
      headers: {
        "api_access_token": platformToken,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "Test User Agent",
        email: `test_agent_${Date.now()}@domain.com`,
        password: "Password123!",
      })
    });

    if (!chatwootRes.ok) {
      console.log("Failed to create user:", await chatwootRes.text());
      return;
    }

    const cwUserResp: any = await chatwootRes.json();
    console.log("Created User via Platform:", cwUserResp);
    
    console.log("Linking user to account using Admin API...");
    const adminRes = await fetch(`${chatwootUrl}/api/v1/accounts/1/agents`, {
      method: 'POST',
      headers: {
        'api_access_token': accessToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: cwUserResp.name || "Test User Agent",
        email: cwUserResp.email,
        role: "agent"
      })
    });
    
    if (!adminRes.ok) {
        console.log("Failed to link via Admin:", await adminRes.text());
        return;
    }
    
    console.log("Successfully linked via Admin:", await adminRes.json());
  } catch(e) {
    console.error(e);
  }
}

run();
