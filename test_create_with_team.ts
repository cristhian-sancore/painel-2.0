import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });

import { createWhatsAppInstance } from './src/app/(dashboard)/evolution/actions';
import { ChatwootClient } from './src/lib/chatwoot';

async function main() {
  const cw = await ChatwootClient.init();
  const teamsRes = await cw.getTeams();
  const teams = teamsRes.payload || teamsRes;
  const firstTeam = teams.length > 0 ? teams[0].id : null;
  
  const testName = "TesteFinalEquipe" + Math.floor(Math.random() * 1000);
  console.log(`Testando actions.ts com a instância: ${testName} e equipe: ${firstTeam}`);
  
  const formData = new FormData();
  formData.append("instanceName", testName);
  if (firstTeam) formData.append("teamId", String(firstTeam));

  const result = await createWhatsAppInstance(formData);
  console.log("Resultado da actions.ts:", result);

  if (result.success) {
    const inboxesResponse = await cw.getInboxes();
    const inboxes = inboxesResponse.payload || inboxesResponse;
    const targetInbox = inboxes.find((i: any) => i.name === `WhatsApp - ${result.instanceName}`);
    
    if (targetInbox) {
      console.log(`✅ SUCESSO ABSOLUTO! Caixa criada e visível com ID: ${targetInbox.id}`);
    } else {
      console.log("❌ FALHA! A caixa não existe ou não está visível.");
    }
  }
  process.exit(0);
}

main();
