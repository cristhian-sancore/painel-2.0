import { config } from 'dotenv';
import { GlpiClient } from './src/lib/glpi';
config({ path: '.env' });
config({ path: '.env.local' });

async function main() {
  try {
    const glpi = await GlpiClient.init();
    const tickets = await glpi.getTickets();
    console.log('Tickets count:', tickets.length);
    console.log('First ticket:', tickets[0] || 'None');
  } catch(e: any) {
    console.error('Error:', e.message);
  }
}
main();
