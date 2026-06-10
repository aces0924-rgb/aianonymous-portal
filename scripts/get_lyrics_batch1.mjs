import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const targets = ['004','005','007','008','009','010','011','012','013','014','015','016','017','018','019','020'];
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
