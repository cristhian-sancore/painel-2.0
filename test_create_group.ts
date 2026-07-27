import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });
import { GlpiClient } from './src/lib/glpi';

async function main() {
  process.env.GLPI_API_URL = 'https://glpi.cristhiansancore.com.br/apirest.php';
  const glpi = await GlpiClient.init();
  try {
    const id = await glpi.createGroup('Grupo Teste via Script');
    console.log('Group created with ID:', id);
  } catch(e) {
    console.error('Error:', e);
  }
}
main();
