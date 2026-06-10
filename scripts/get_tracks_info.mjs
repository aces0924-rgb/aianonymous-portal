import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: { entryNo: { in: ['084', '085', '086', '087', '088'] } },
    select: { id: true, entryNo: true, title: true }
  });
  console.log(JSON.stringify(tracks, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
