import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.track.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: { entryNo: true, title: true }
  });
  console.log('Track Table:', tracks);

  const tracksHonban = await prisma.trackHonban.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    select: { entryNo: true, title: true }
  });
  console.log('TrackHonban Table:', tracksHonban);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
