import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.user.findMany({ include: { accessGroup: true } });
  console.log(users.map(u => ({ email: u.email, role: u.role, group: u.accessGroup?.name })));
}
run();
