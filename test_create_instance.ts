import { config } from 'dotenv';
import { EvolutionClient } from './src/lib/evolution';
import { ChatwootClient } from './src/lib/chatwoot';

config({ path: '.env' });
config({ path: '.env.local' });

async function main() {
  const testInstanceName = "TesteAutomacao" + Math.floor(Math.random() * 1000);
  try {
    const evo = await EvolutionClient.init();
    const chatwoot = await ChatwootClient.init();

    const accountId = await chatwoot.setAccountId();
    console.log(`Account ID encontrado: ${accountId}`);

    const instanceData = await evo.createInstance(testInstanceName);
    const generatedName = instanceData.instance?.instanceName || testInstanceName.replace(/\s+/g, '-').toLowerCase();
    
    console.log("3. Conectando a Instância ao Chatwoot...");
    const cwResult = await evo.connectToChatwoot(generatedName, accountId);
    console.log(`Resultado da conexão:`, JSON.stringify(cwResult, null, 2));

    await new Promise(r => setTimeout(r, 3000));

    const inboxesResponse = await chatwoot.getInboxes();
    const inboxes = inboxesResponse.payload || inboxesResponse;
    const targetInbox = inboxes.find((i: any) => i.name === `WhatsApp - ${generatedName}`);
    
    if (targetInbox) {
      console.log(`✅ SUCESSO! A Caixa de Entrada foi criada no Chatwoot com o ID: ${targetInbox.id}`);
    } else {
      console.log("❌ FALHA: A Caixa não foi criada no Chatwoot.");
    }
  } catch (e) {
    console.error("Erro durante o teste:", e);
  } finally {
    process.exit(0);
  }
}

main();
