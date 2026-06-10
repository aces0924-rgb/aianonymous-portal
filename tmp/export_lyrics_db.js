const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    orderBy: {
      id: 'asc'
    }
  });

  const targetDir = 'G:\\マイドライブ\\AI-anonymousFES\\動画作成\\歌詞';
  if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
  }
  
  let count = 0;
  for (const track of tracks) {
    if (!track.entryNo) continue;
    const no = parseInt(track.entryNo, 10);
    if (no >= 109) {
      if (track.lyrics) {
         // Safe title (keeping Japanese characters, alphanumeric, spaces, hyphens)
         // We also want to match the old python script logic if possible, or just something safe
         let title = track.title || '';
         let safeTitle = "";
         for (let i = 0; i < title.length; i++) {
             const char = title[i];
             // Allow alphanumeric, space, underscore, hyphen, and Japanese/Chinese chars
             if (char.match(/[\w\s_\-]/) || char.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)) {
                 safeTitle += char;
             } else {
                 // fallback just keep it if it's not a restricted windows char
                 if (!char.match(/[\\/:*?"<>|]/)) {
                     safeTitle += char;
                 }
             }
         }
         safeTitle = safeTitle.trim();
         
         const noStr = no.toString().padStart(3, '0');
         const fileName = `${noStr}_${safeTitle}.txt`;
         
         // Cleanup lyrics like in Python script
         let cleanLyrics = track.lyrics.replace(/\[.*?\]/g, '');
         cleanLyrics = cleanLyrics.replace(/\n{3,}/g, '\n\n').trim();

         // Write as utf-8 (node does this by default, though python used utf-8-sig. Let's use utf-8)
         const filePath = path.join(targetDir, fileName);
         fs.writeFileSync(filePath, '\uFEFF' + cleanLyrics, 'utf8'); // prepending BOM to match utf-8-sig
         console.log(`Saved DB lyrics for No.${no}: ${fileName}`);
         count++;
      } else {
         console.log(`No lyrics for No.${no}: ${track.title}`);
      }
    }
  }
  console.log(`Finished processing DB lyrics. Total updated: ${count}`);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
