import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });

import { ChatwootClient } from './src/lib/chatwoot';

async function main() {
  const cw = await ChatwootClient.init();
  try {
    console.log("Creating inbox...");
    const newInbox = await cw.createApiInbox("WhatsApp - Debug", "http://localhost:8081/chatwoot");
    console.log("Created:", newInbox);
    
    console.log("Assigning to team 1...");
    await cw.assignMembersToInbox(newInbox.id, [1]);
    
    const res = await cw.getInboxes();
    const inboxes = res.payload || res;
    console.log("Inboxes length:", inboxes.length);
    console.log("Names:", inboxes.map((i:any) => i.name));
  } catch(e) {
    console.error("Error:", e);
  }
  process.exit(0);
}
main();
