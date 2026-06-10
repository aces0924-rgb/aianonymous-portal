import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: {
      entryNo: {
        in: ['114', '115', '116']
      }
    }
  });
  fs.writeFileSync('lyrics_output.json', JSON.stringify(tracks, null, 2));
  console.log("Lyrics written to lyrics_output.json");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
