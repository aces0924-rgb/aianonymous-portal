import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: { entryNo: { in: ['199', '200', '201', '202', '203'] } },
    orderBy: { entryNo: 'asc' },
    select: { entryNo: true, title: true, lyrics: true }
  });

  console.log(JSON.stringify(tracks, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
