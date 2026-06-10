import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: { entryNo: { in: Array.from({length: 20}, (_, i) => (146 + i).toString()) } },
    select: { entryNo: true, title: true, lyrics: true },
    orderBy: { entryNo: 'asc' }
  });
  for (const track of tracks) {
    console.log(`[entryNo: ${track.entryNo}] Title: ${track.title}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
