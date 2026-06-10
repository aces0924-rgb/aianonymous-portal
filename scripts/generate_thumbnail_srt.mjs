import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// SRTのタイムスタンプ形式(HH:MM:SS,mmm)に変換する関数
function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  // 今回はミリ秒は常に000でOK
  const mmm = '000';

  const hhStr = h.toString().padStart(2, '0');
  const mmStr = m.toString().padStart(2, '0');
  const ssStr = s.toString().padStart(2, '0');

  return `${hhStr}:${mmStr}:${ssStr},${mmm}`;
}

async function main() {
  try {
    // entryNoの昇順でTrackThumbnailを取得
    const thumbnails = await prisma.trackThumbnail.findMany({
      orderBy: { entryNo: 'asc' }
    });

    let srtContent = '';
    let currentTime = 0; // 開始時間（秒）
    const duration = 4; // 1枚あたり4秒

    thumbnails.forEach((thumb, index) => {
      // 匿名処理
      const artist = thumb.isAnonymous ? '匿名' : (thumb.artistName || '不明');
      
      let xidLine = '';
      if (!thumb.isXAnonymous) {
        const xid = thumb.twitterId ? thumb.twitterId.replace(/^@/, '') : '';
        xidLine = xid ? `Xid：@${xid}` : 'Xid：なし';
      }

      // SRTフォーマット
      const startTime = formatTime(currentTime);
      const endTime = formatTime(currentTime + duration);

      srtContent += `${index + 1}\n`;
      srtContent += `${startTime} --> ${endTime}\n`;
      srtContent += `イラスト：${artist}\n`;
      if (xidLine) {
        srtContent += `${xidLine}\n`;
      }
      srtContent += `\n`;

      currentTime += duration;
    });

    const outputPath = path.join(process.cwd(), 'fanart_credits.srt');
    fs.writeFileSync(outputPath, srtContent, 'utf-8');
    
    console.log(`✅ SRTファイルの生成が完了しました: ${outputPath}`);
    console.log(`合計 ${thumbnails.length} 件のサムネイル情報を含んでいます。`);

  } catch (error) {
    console.error("エラーが発生しました:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
