import { config } from 'dotenv';
import { ChatwootClient } from './src/lib/chatwoot';
import prisma from './src/lib/prisma';

config({ path: '.env' });
config({ path: '.env.local' });

async function main() {
  try {
    const cw = await ChatwootClient.init();
    
    // 1. Get all teams
    const teamsRes = await cw.getTeams();
    const teams = Array.isArray(teamsRes) ? teamsRes : (teamsRes.payload || []);
    
    // 2. Get all inboxes
    const inboxesRes = await cw.getInboxes();
    const inboxes = Array.isArray(inboxesRes) ? inboxesRes : (inboxesRes.payload || []);
    
    console.log(`Found ${teams.length} teams and ${inboxes.length} inboxes.`);

    for (const team of teams) {
      // Find inboxes that match the team name (heuristic)
      // Evolution inboxes usually match "WhatsApp - teamName"
      const matchingInboxes = inboxes.filter((i: any) => i.name.toLowerCase().includes(team.name.toLowerCase()));
      
      if (matchingInboxes.length > 0) {
        const inboxIds = matchingInboxes.map((i: any) => i.id);
        const mapKey = `team_inboxes_${team.id}`;
        
        await prisma.setting.upsert({
          where: { key: mapKey },
          update: { value: JSON.stringify(inboxIds) },
          create: { key: mapKey, value: JSON.stringify(inboxIds) }
        });
        
        console.log(`Mapped Team ${team.name} (ID: ${team.id}) to Inboxes: ${inboxIds.join(', ')}`);
      }
    }
    
    console.log("Migration complete!");
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

main();
