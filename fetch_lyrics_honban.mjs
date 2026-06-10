import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // entryNo が文字列として保存されているため、正確に一致するものを取得
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
  
  if (tracks.length === 0) {
    console.log("No tracks found. Checking all entries in TrackHonban...");
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
