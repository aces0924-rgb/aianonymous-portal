import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import fetch from 'node-fetch';

const prisma = new PrismaClient();

// 共有フォルダのID
const GDRIVE_FOLDER_ID = process.env.GDRIVE_FOLDER_ID || "1v4r9-w66hyhWpeYx8OkU5B2t61D0rl4e";
// Google Cloud Consoleで取得したAPIキー
const API_KEY = process.env.GOOGLE_API_KEY;

async function syncGDriveAudio() {
  if (!API_KEY) {
    console.warn("⚠️  GOOGLE_API_KEY が .env に設定されていません。Google Drive同期をスキップします。");
    return;
  }

  console.log(`📂 Google Drive フォルダをスキャン中: ${GDRIVE_FOLDER_ID}...`);
  
  try {
    const q = encodeURIComponent(`'${GDRIVE_FOLDER_ID}' in parents and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&key=${API_KEY}&fields=files(id,name)&pageSize=1000`;
    
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.error) {
      throw new Error(`Google Drive API エラー: ${data.error.message}`);
    }

    const files = data.files || [];
    console.log(`✅ ${files.length} 個のファイルが見つかりました。`);

    // データベースから全楽曲を取得（登録日順）
    const tracks = await prisma.track.findMany({
      orderBy: { createdAt: 'asc' }
    });

    let updateCount = 0;

    for (const file of files) {
      // ファイル名の先頭の数字を抽出 (例: "001_xxx.wav" -> "001")
      const match = file.name.match(/^(\d+)/);
      if (!match) continue;

      const trackNo = parseInt(match[1], 10);
      const trackIndex = trackNo - 1; // No.001 は配列の 0番目

      if (trackIndex >= 0 && trackIndex < tracks.length) {
        const track = tracks[trackIndex];
        const directUrl = `https://docs.google.com/uc?export=download&id=${file.id}`;

        /* // URLが異なる場合のみ更新 (User manually updates audioUrl, so disabled)
        if (track.audioUrl !== directUrl) {
          console.log(`🎵 No.${String(trackNo).padStart(3, '0')} [${track.title}] を更新中...`);
          await prisma.track.update({
            where: { id: track.id },
            data: { audioUrl: directUrl }
          });
          updateCount++;
        } */
      }
    }

    console.log(`✨ 同期完了！ ${updateCount} 件の楽曲を更新しました。`);
  } catch (error) {
    console.error("❌ 同期中にエラーが発生しました:", error);
  }
}

syncGDriveAudio()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
