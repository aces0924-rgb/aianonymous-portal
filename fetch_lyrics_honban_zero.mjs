import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: {
      entryNo: {
        in: ['0114', '0115', '0116']
      }
    },
    select: {
      id: true,
      entryNo: true,
      title: true,
      lyrics: true
    }
  });
  
  if (tracks.length === 0) {
    console.log("No tracks found with 0-padding. Checking similar values...");
    const all = await prisma.trackHonban.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: { entryNo: true, title: true }
    });
    console.log("Recent entries:", all);
  } else {
    console.log(JSON.stringify(tracks, null, 2));
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
