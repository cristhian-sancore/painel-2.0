import { prisma } from "./src/lib/prisma";
import { GlpiClient } from "./src/lib/glpi";

async function main() {
  console.log("Starting GLPI Sync...");
  
  try {
    const glpi = await GlpiClient.init();
    
    // Sync Groups
    const groups = await prisma.accessGroup.findMany();
    for (const group of groups) {
      if (!group.glpiGroupId) {
        console.log(`Syncing group: ${group.name}`);
        let glpiGroup = await glpi.findGroup(group.name);
        if (!glpiGroup) {
          console.log(`Creating GLPI group: ${group.name}`);
          const newId = await glpi.createGroup(group.name);
          if (newId) {
            glpiGroup = { id: newId, name: group.name };
          }
        }
        
        if (glpiGroup && glpiGroup.id) {
          await prisma.accessGroup.update({
            where: { id: group.id },
            data: { glpiGroupId: glpiGroup.id }
          });
          console.log(`Updated panel group ${group.name} with GLPI ID ${glpiGroup.id}`);
        }
      }
    }

    // Sync Users
    const users = await prisma.user.findMany();
    for (const user of users) {
      if (!user.glpiUserId) {
        console.log(`Syncing user: ${user.name || user.email}`);
        let glpiUser = await glpi.findUser(user.email);
        if (!glpiUser) {
          console.log(`Creating GLPI user: ${user.name || user.email}`);
          const newId = await glpi.createUser(user.name || user.email.split('@')[0], user.email);
          if (newId) {
            glpiUser = { id: newId, email: user.email };
          }
        }
        
        if (glpiUser && glpiUser.id) {
          await prisma.user.update({
            where: { id: user.id },
            data: { glpiUserId: glpiUser.id }
          });
          console.log(`Updated panel user ${user.email} with GLPI ID ${glpiUser.id}`);
        }
      }
    }
    
    console.log("GLPI Sync Completed!");
  } catch (error) {
    console.error("Error during sync:", error);
  }
}

main();
