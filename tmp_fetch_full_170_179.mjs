import { PrismaClient } from '@prisma/client';
import fs from 'fs';
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
  
  fs.writeFileSync('tmp_full_data_170_179.json', JSON.stringify(tracks, null, 2));
  console.log('Data written to tmp_full_data_170_179.json');
}

main().catch(console.error).finally(() => prisma.$disconnect());
