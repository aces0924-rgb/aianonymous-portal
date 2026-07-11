const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const t = await prisma.track.count();
  const th = await prisma.trackHonban.count();
  console.log({ track: t, trackHonban: th });
  await prisma.$disconnect();
}
main();
