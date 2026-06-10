import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: { 
      entryNo: { 
        in: Array.from({length: 12}, (_, i) => (184 + i).toString()) 
      } 
    },
    select: {
      entryNo: true,
      title: true,
      lyrics: true
    },
    orderBy: { entryNo: 'asc' }
  });
  
  fs.writeFileSync('tmp_full_data_184_195.json', JSON.stringify(tracks, null, 2));
  console.log(`Fetched \${tracks.length} tracks.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
