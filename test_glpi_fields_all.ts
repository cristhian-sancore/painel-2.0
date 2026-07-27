import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });
import { GlpiClient } from './src/lib/glpi';

async function main() {
  const glpi = await GlpiClient.init();
  await glpi.initSession();
  const searchUrl = glpi.url + '/listSearchOptions/Ticket';
  const res = await fetch(searchUrl, { headers: glpi.headers });
  const fields = await res.json();
  const keys = Object.keys(fields);
  for (const k of keys) {
    if (fields[k].name && (fields[k].name.toLowerCase().includes('requerente') || fields[k].name.toLowerCase().includes('requester') || fields[k].name.toLowerCase().includes('téc') || fields[k].name.toLowerCase().includes('tech') || fields[k].name.toLowerCase().includes('group') || fields[k].name.toLowerCase().includes('grupo'))) {
       console.log('ID:', k, '->', fields[k].name, 'Table:', fields[k].table, 'Field:', fields[k].field);
    }
  }
}
main();
