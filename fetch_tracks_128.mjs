import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: {
      entryNo: {
        gte: '128'
      }
    },
    orderBy: {
      entryNo: 'asc'
    }
  });

  console.log(JSON.stringify(tracks, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
