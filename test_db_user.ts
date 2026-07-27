import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });
import prisma from './src/lib/prisma';

async function main() {
  const users = await prisma.user.findMany({ include: { accessGroup: true } });
  for (const user of users) {
    console.log('User: ' + user.email + ' | Role: ' + user.role + ' | Group: ' + (user.accessGroup ? user.accessGroup.name : 'None') + ' | GLPI User ID: ' + user.glpiUserId + ' | Permissions: ' + (user.accessGroup ? user.accessGroup.permissions : 'None'));
  }
}
main();
