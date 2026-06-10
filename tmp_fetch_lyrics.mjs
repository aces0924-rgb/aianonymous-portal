import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: {
      id: { gte: 146 }
    },
    select: {
      id: true,
      title: true,
      lyrics: true
    },
    orderBy: { id: 'asc' }
  });
  console.log(JSON.stringify(tracks, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
