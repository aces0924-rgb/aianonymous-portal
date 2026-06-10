import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: {
      entryNo: {
        in: ['117', '118', '119', '120', '121', '122', '123', '124', '125', '126', '127']
      }
    },
    select: {
      entryNo: true,
      title: true,
      lyrics: true
    }
  });
  fs.writeFileSync('lyrics_117_127.json', JSON.stringify(tracks, null, 2));
  console.log(`Successfully fetched ${tracks.length} tracks.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
