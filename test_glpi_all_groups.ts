import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });
import { GlpiClient } from './src/lib/glpi';

async function main() {
  const glpi = await GlpiClient.init();
  const res = await fetch(${glpi.url}/Group?expand_dropdowns=true, { headers: glpi.headers });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}
main();
