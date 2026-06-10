import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const targets = ['021','022','023','024','025','026','027','028','029','030','031','032','033','035','036','037','038','039','040'];
  const tracks = await prisma.trackHonban.findMany({
    where: { entryNo: { in: targets } },
    orderBy: { entryNo: 'asc' }
  });

  tracks.forEach(t => {
    console.log(`=== TRACK_START ===`);
    console.log(`NO: ${t.entryNo}`);
    console.log(`TITLE: ${t.title}`);
    console.log(`LYRICS: ${t.lyrics}`);
    console.log(`=== TRACK_END ===`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
