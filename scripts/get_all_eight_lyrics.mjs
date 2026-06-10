import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const targetNos = ['089', '090', '091', '092', '093', '094', '095', '096'];
  const tracks = await prisma.trackHonban.findMany({
    where: { entryNo: { in: targetNos } },
    orderBy: { entryNo: 'asc' }
  });

  tracks.forEach(t => {
    console.log(`=== START_TRACK ===`);
    console.log(`NO: ${t.entryNo}`);
    console.log(`TITLE: ${t.title}`);
    console.log(`LYRICS: ${t.lyrics}`);
    console.log(`=== END_TRACK ===`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
