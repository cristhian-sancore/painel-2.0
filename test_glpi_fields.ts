import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });
import { GlpiClient } from './src/lib/glpi';

async function main() {
  const glpi = await GlpiClient.init();
  const searchUrl = glpi.url + '/listSearchOptions/Ticket';
  const res = await fetch(searchUrl, { headers: glpi.headers });
  const fields = await res.json();
  console.log('Field 4:', fields['4']?.name);
  console.log('Field 5:', fields['5']?.name);
  console.log('Field 8:', fields['8']?.name);
  console.log('Field 71:', fields['71']?.name); // group observer?
}
main();
