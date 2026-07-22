import { prisma } from './src/lib/prisma';

async function main() {
  try {
    await prisma.setting.upsert({
      where: { key: 'chatwoot_token' },
      update: { value: 'i9Ch9WjTicBEyfBtiqqNukZS' },
      create: { key: 'chatwoot_token', value: 'i9Ch9WjTicBEyfBtiqqNukZS' }
    });
    console.log("Token do Chatwoot atualizado no banco de dados com sucesso!");
  } catch (e) {
    console.error(e);
  } finally {
    // avoid process hanging if prisma isn't explicitly closed, 
    // but with driver adapters we can just exit
    process.exit(0);
  }
}

main();
