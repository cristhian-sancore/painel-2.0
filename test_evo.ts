import { config } from 'dotenv';
import { EvolutionClient } from './src/lib/evolution';

config({ path: '.env' });
config({ path: '.env.local' });

async function main() {
  try {
    const evo = await EvolutionClient.init();
    const instances = await evo.getInstances();
    console.log(JSON.stringify(instances, null, 2));
  } catch (e) {
    console.error(e);
  }
}

main();
