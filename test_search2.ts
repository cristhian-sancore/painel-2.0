import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });
import { GlpiClient } from './src/lib/glpi';

async function main() {
  const glpi = await GlpiClient.init();
  await glpi.initSession();
  const res = await fetch(glpi.url + '/search/Ticket?criteria[0][field]=5&criteria[0][searchtype]=equals&criteria[0][value]=999999', { headers: glpi.headers });
  const data = await res.json();
  console.log('Result for dummy user 999999:', data.data ? data.data.length : data);
}
main();
