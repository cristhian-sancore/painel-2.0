import prisma from './src/lib/prisma';
async function main() {
  const groups = await prisma.accessGroup.findMany({ select: { id: true, name: true, glpiGroupId: true } });
  console.log(groups);
}
main();
