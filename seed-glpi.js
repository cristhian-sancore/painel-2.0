const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  await prisma.setting.upsert({
    where: { key: 'glpi_url' },
    update: { value: 'https://glpi.cristhiansancore.com.br/apirest.php' },
    create: { key: 'glpi_url', value: 'https://glpi.cristhiansancore.com.br/apirest.php' },
  });
  await prisma.setting.upsert({
    where: { key: 'glpi_app_token' },
    update: { value: 'Sancore@2404' },
    create: { key: 'glpi_app_token', value: 'Sancore@2404' },
  });
  await prisma.setting.upsert({
    where: { key: 'glpi_user_token' },
    update: { value: 'X2YDSYheWgkqTK5qiUpcksoFTuJ3q3ynmKwwMYnf' },
    create: { key: 'glpi_user_token', value: 'X2YDSYheWgkqTK5qiUpcksoFTuJ3q3ynmKwwMYnf' },
  });
  console.log("GLPI settings seeded.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
