import { config } from 'dotenv';
import { ChatwootClient } from './src/lib/chatwoot';
config({ path: '.env' });
config({ path: '.env.local' });

async function main() {
  const cw = await ChatwootClient.init();
  const res = await cw.getInboxes();
  const inboxes = res.payload || res;
  inboxes.forEach((i: any) => console.log(`Inbox ID: ${i.id} | Name: ${i.name} | Channel: ${i.channel_type}`));
  process.exit(0);
}
main();
