import { config } from 'dotenv';
import { ChatwootClient } from './src/lib/chatwoot';

config({ path: '.env' });
config({ path: '.env.local' });

async function main() {
  try {
    const cw = await ChatwootClient.init();
    const teamsRes = await cw.getTeams();
    const teams = Array.isArray(teamsRes) ? teamsRes : (teamsRes.payload || []);
    
    console.log("Teams:", teams.map((t: any) => ({ id: t.id, name: t.name })));
    
    const inboxesRes = await cw.getInboxes();
    const inboxes = Array.isArray(inboxesRes) ? inboxesRes : (inboxesRes.payload || []);
    console.log("\nInboxes:");
    inboxes.forEach((i: any) => console.log(`ID: ${i.id} | Name: ${i.name} | Channel: ${i.channel_type}`));

    console.log("\nFetching all agents...");
    const agentsRes = await cw.getAgents();
    const agents = Array.isArray(agentsRes) ? agentsRes : (agentsRes.payload || []);
    console.log("First agent fully:", JSON.stringify(agents[0], null, 2));

    if (inboxes.length > 0) {
      console.log(`\nFetching members for inbox ${inboxes[0].id}...`);
      const res = await fetch(`${cw.url}/api/v1/accounts/${cw.accountId}/inbox_members?inbox_id=${inboxes[0].id}`, { headers: cw.headers });
      const members = await res.json();
      console.log("Inbox members:", JSON.stringify(members, null, 2));
    }
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

main();
