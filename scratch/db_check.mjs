import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const count = await prisma.track.count();
  console.log(`--- DB STATUS ---`);
  console.log(`Current Track Count: ${count}`);
  
  if (count > 0) {
    const latest = await prisma.track.findFirst({ orderBy: { id: 'desc' } });
    console.log(`Latest Track: No.${latest.entryNo} - ${latest.title}`);
  }
}

check()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
