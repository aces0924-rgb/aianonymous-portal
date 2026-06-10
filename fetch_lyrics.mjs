import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: {
      entryNo: {
        in: ['114', '115', '116']
      }
    },
    select: {
      id: true,
      entryNo: true,
      title: true,
      lyrics: true
    }
  });
  console.log(JSON.stringify(tracks, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
