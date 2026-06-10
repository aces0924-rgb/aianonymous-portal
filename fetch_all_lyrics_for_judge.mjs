import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import fs from 'fs';

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    select: {
      id: true,
      entryNo: true,
      title: true,
      lyrics: true,
      analysis: true
    }
  });
  
  console.log(`Found ${tracks.length} tracks.`);
  fs.writeFileSync('all_lyrics_for_judge.json', JSON.stringify(tracks, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
