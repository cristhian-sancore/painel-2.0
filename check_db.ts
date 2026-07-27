import { config } from 'dotenv';
config({ path: '.env' });
config({ path: '.env.local' });
import prisma from './src/lib/prisma';
async function main() {
  const users = await prisma.user.findMany({ include: { accessGroup: true } });
  for (const u of users) {
    if (u.role === 'ADMIN') continue;
    console.log('User:', u.email, 'Role:', u.role, 'Group:', u.accessGroup?.name, 'GLPI User:', u.glpiUserId, 'GLPI Group:', u.accessGroup?.glpiGroupId);
  }
}
main();
