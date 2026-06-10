import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const targets = ['064','065','066','067','068'];
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
