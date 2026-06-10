import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:C:/Users/ACAC/Desktop/アニメ用/vocaloid-ai-event/prisma/dev.db'
    }
  }
});

async function main() {
  const tracks = await prisma.track.findMany({
    orderBy: { id: 'desc' }
  });
  console.log(JSON.stringify(tracks, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
