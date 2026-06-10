import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    take: 5,
    orderBy: { id: 'asc' },
    select: {
      entryNo: true,
      analysis: true,
      review: true
    }
  });
  console.log(JSON.stringify(tracks, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
