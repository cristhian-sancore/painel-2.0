import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });

// Setup a mock form data
import { createWhatsAppInstance } from './src/app/(dashboard)/evolution/actions';
import { ChatwootClient } from './src/lib/chatwoot';

async function main() {
  const testName = "TesteFinal" + Math.floor(Math.random() * 1000);
  console.log(`Testando actions.ts com a instância: ${testName}`);
  
  const formData = new FormData();
  formData.append("instanceName", testName);
  formData.append("teamId", "");

  const result = await createWhatsAppInstance(formData);
  console.log("Resultado da actions.ts:", result);

  if (result.success) {
    const chatwoot = await ChatwootClient.init();
    const inboxesResponse = await chatwoot.getInboxes();
    const inboxes = inboxesResponse.payload || inboxesResponse;
    const targetInbox = inboxes.find((i: any) => i.name === `WhatsApp - ${result.instanceName}`);
    
    if (targetInbox) {
      console.log(`✅ SUCESSO ABSOLUTO! Caixa criada manualmente pelo fallback com ID: ${targetInbox.id}`);
    } else {
      console.log("❌ FALHA! A caixa não existe nem após o fallback.");
    }
  }
  process.exit(0);
}

main();
