import { config } from 'dotenv';
import { ChatwootClient } from './src/lib/chatwoot';

config({ path: '.env' });
config({ path: '.env.local' });

async function main() {
  try {
    const cw = await ChatwootClient.init();
    const inboxes = await cw.getInboxes();
    console.log("Inboxes:", JSON.stringify(inboxes, null, 2));
  } catch (e) {
    console.error(e);
  }
}

main();
