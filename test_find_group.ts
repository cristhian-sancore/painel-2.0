import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });
import { GlpiClient } from './src/lib/glpi';

async function main() {
  const glpi = await GlpiClient.init();
  const res = await glpi.findGroup('Suporte N2 Teste');
  console.log('Result:', res);
}
main();
