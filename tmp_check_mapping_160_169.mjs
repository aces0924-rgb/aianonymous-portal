import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: { entryNo: { in: ["160", "161", "162", "163", "164", "165", "166", "167", "168", "169"] } },
    select: {
      entryNo: true,
      title: true,
      lyrics: true
    },
    orderBy: { entryNo: 'asc' }
  });
  for (const track of tracks) {
    console.log(`[entryNo: ${track.entryNo}] Title: ${track.title}`);
    console.log(`Lyrics: ${track.lyrics.substring(0, 100)}...`);
    console.log('-------------------');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
