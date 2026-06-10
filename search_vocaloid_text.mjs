
import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const targetTerms = ["ボカロ", "Pさん"];
  
  console.log(`Searching for tracks containing ${targetTerms.join(', ')} in the analysis field...`);
  
  const tracks = await prisma.trackHonban.findMany({
    where: {
      OR: targetTerms.map(term => ({ analysis: { contains: term } }))
    },
    select: {
      entryNo: true,
      title: true,
      analysis: true,
      lyrics: true,
    },
    orderBy: {
      entryNo: 'asc',
    },
  });

  if (tracks.length === 0) {
    console.log("No tracks found with that term.");
  } else {
    let output = `Found ${tracks.length} tracks:\n`;
    tracks.forEach(track => {
      output += `\n==================================================\n`;
      output += `No.${track.entryNo}: ${track.title}\n`;
      output += `==================================================\n`;
      output += `[EXISTING ANALYSIS]\n`;
      output += track.analysis + `\n`;
      output += `\n[LYRICS]\n`;
      output += track.lyrics + `\n`;
    });
    
    fs.writeFileSync('C:/Users/ACAC/.gemini/antigravity/scratch/data_for_reanalysis_utf8.txt', output, 'utf8');
    console.log("Saved results to data_for_reanalysis_utf8.txt");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
