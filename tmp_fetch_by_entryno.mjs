import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const allTracks = await prisma.trackHonban.findMany({
    select: {
      id: true,
      entryNo: true,
      title: true,
      lyrics: true
    }
  });
  
  // entryNoを数値に変換して146以上をフィルタリング
  const targetTracks = allTracks
    .filter(t => t.entryNo && parseInt(t.entryNo) >= 146)
    .sort((a, b) => parseInt(a.entryNo) - parseInt(b.entryNo));
  
  fs.writeFileSync('lyrics_146_plus.json', JSON.stringify(targetTracks, null, 2), 'utf-8');
  console.log(`Successfully saved ${targetTracks.length} tracks to lyrics_146_plus.json`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
