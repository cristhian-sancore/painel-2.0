import { config } from 'dotenv';
import { ChatwootClient } from './src/lib/chatwoot';
import prisma from './src/lib/prisma';

config({ path: '.env' });
config({ path: '.env.local' });

async function main() {
  try {
    const cw = await ChatwootClient.init();
    
    // Get all settings related to team_inboxes
    const settings = await prisma.setting.findMany({
      where: { key: { startsWith: 'team_inboxes_' } }
    });

    console.log(`Found ${settings.length} team-inbox mappings.`);

    for (const setting of settings) {
      const teamId = setting.key.replace('team_inboxes_', '');
      const inboxesArr = JSON.parse(setting.value);
      
      console.log(`\nProcessing Team ID: ${teamId}`);
      
      // Fetch team members from Chatwoot
      const membersRes = await cw.getTeamMembers(Number(teamId));
      const teamMembers = Array.isArray(membersRes) ? membersRes : (membersRes.payload || []);
      
      if (teamMembers.length === 0) {
        console.log(`- Team ${teamId} has no members. Skipping.`);
        continue;
      }
      
      const teamMemberIds = teamMembers.map((m: any) => m.id || m.user_id);
      console.log(`- Team ${teamId} has members: ${teamMemberIds.join(', ')}`);

      // Also ensure administrator is in the list
      const agentsRes = await cw.getAgents();
      const agents = Array.isArray(agentsRes) ? agentsRes : (agentsRes.payload || []);
      const admin = agents.find((a: any) => a.role === "administrator");
      if (admin && !teamMemberIds.includes(admin.id)) {
        teamMemberIds.push(admin.id);
      }

      for (const inboxId of inboxesArr) {
        console.log(`  - Checking Inbox ID: ${inboxId}`);
        // Add everyone to the inbox
        await cw.assignMembersToInbox(inboxId, teamMemberIds);
        console.log(`  - Assigned members ${teamMemberIds.join(', ')} to Inbox ${inboxId}`);
      }
    }
    
    console.log("\nMigration of existing users to inboxes complete!");
  } catch (e) {
    console.error(e);
  }
  process.exit(0);
}

main();
