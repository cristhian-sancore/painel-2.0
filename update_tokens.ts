import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.setting.upsert({
    where: { key: 'chatwoot_token' },
    update: { value: 'i9Ch9WjTicBEyfBtiqqNukZS' },
    create: { key: 'chatwoot_token', value: 'i9Ch9WjTicBEyfBtiqqNukZS' },
  });

  await prisma.setting.upsert({
    where: { key: 'chatwoot_platform_token' },
    update: { value: 'YbswfR8ZdxBDYmHAtbKsFDea' },
    create: { key: 'chatwoot_platform_token', value: 'YbswfR8ZdxBDYmHAtbKsFDea' },
  });

  await prisma.setting.upsert({
    where: { key: 'chatwoot_url' },
    update: { value: 'https://chatwoot2.cristhiansancore.com.br' },
    create: { key: 'chatwoot_url', value: 'https://chatwoot2.cristhiansancore.com.br' },
  });

  console.log("Tokens atualizados no banco de dados com sucesso!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
