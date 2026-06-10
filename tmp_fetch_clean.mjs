import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: {
      id: { in: [146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157, 158, 160, 161, 162, 163] }
    },
    select: {
      id: true,
      title: true,
      lyrics: true
    },
    orderBy: { id: 'asc' }
  });
  
  fs.writeFileSync('clean_lyrics_146_163.json', JSON.stringify(tracks, null, 2), 'utf-8');
  console.log('Successfully saved to clean_lyrics_146_163.json');
}

main().catch(console.error).finally(() => prisma.$disconnect());
