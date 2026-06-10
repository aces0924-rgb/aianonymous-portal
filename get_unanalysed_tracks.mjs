import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: {
      OR: [
        { analysis: '' },
        { analysis: null }
      ],
      published: true // 公開済みのものを優先
    },
    select: {
      id: true,
      entryNo: true,
      title: true,
      lyrics: true
    },
    orderBy: {
        entryNo: 'asc'
    }
  });
  console.log(JSON.stringify(tracks, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
