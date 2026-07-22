const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.setting.update({
    where: { key: 'chatwoot_url' },
    data: { value: 'http://chatwoot-evolution-chatwoot-1:3000' }
  });
  console.log("Updated!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
