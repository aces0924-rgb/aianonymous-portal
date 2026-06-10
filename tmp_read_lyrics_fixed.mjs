import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: { entryNo: { in: ["166", "167", "168", "169"] } },
    select: {
      entryNo: true,
      title: true,
      lyrics: true
    }
  });
  for (const track of tracks) {
    console.log(`--- entryNo: ${track.entryNo} ---`);
    console.log(track.lyrics);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
