import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });
import { GlpiClient } from './src/lib/glpi';

async function main() {
  const glpi = await GlpiClient.init();
  const groupId = await glpi.createGroup('Suporte N2 Teste');
  console.log('Group created:', groupId);
  
  const userId = await glpi.createUser('João N2 Teste', 'joao.n2@teste.com');
  console.log('User created:', userId);
  
  if (groupId && userId) {
     const linked = await glpi.addUserToGroup(userId, groupId);
     console.log('User linked to group:', linked);
  }
}
main();
