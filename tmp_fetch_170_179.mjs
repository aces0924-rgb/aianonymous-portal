import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: { 
      entryNo: { 
        in: Array.from({length: 10}, (_, i) => (170 + i).toString()) 
      } 
    },
    select: {
      entryNo: true,
      title: true,
      lyrics: true
    },
    orderBy: { entryNo: 'asc' }
  });
  
  console.log(JSON.stringify(tracks, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
