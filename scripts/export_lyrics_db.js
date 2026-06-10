const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  // 引数から開始Noを取得（デフォルトは1）
  const startNo = parseInt(process.argv[2] || '1', 10);
  
  const tracks = await prisma.trackHonban.findMany({
    orderBy: { id: 'asc' }
  });

  const targetDir = process.argv[3] || 'G:\\マイドライブ\\AI-anonymousFES\\動画作成\\歌詞';
  if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
  }
  
  let count = 0;
  for (const track of tracks) {
    if (!track.entryNo) continue;
    const no = parseInt(track.entryNo, 10);
    
    if (no >= startNo) {
      if (track.lyrics) {
         let title = track.title || '';
         let safeTitle = "";
         for (let i = 0; i < title.length; i++) {
             const char = title[i];
             // 日本語や英数字を許可
             if (char.match(/[\w\s_\-]/) || char.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/)) {
                 safeTitle += char;
             } else if (!char.match(/[\\/:*?"<>|]/)) { // Windowsの禁則文字以外は残す
                 safeTitle += char;
             }
         }
         safeTitle = safeTitle.trim();
         
         const noStr = no.toString().padStart(3, '0');
         const fileName = `${noStr}_${safeTitle}.txt`;
         
         // 歌詞のクリーンアップ
         let cleanLyrics = track.lyrics.replace(/\[.*?\]/g, '');
         cleanLyrics = cleanLyrics.replace(/\n{3,}/g, '\n\n').trim();

         const filePath = path.join(targetDir, fileName);
         fs.writeFileSync(filePath, '\uFEFF' + cleanLyrics, 'utf8'); // BOM付きUTF-8
         console.log(`[歌詞保存] ${fileName}`);
         count++;
      }
    }
  }
  console.log(`\nDBからの歌詞同期完了. 計 ${count} 件更新`);
}

main().catch(e => {
    console.error(e);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});
