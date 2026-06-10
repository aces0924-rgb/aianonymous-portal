import { PrismaClient } from '@prisma/client';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// .env から環境変数を読み込む簡易的な実装
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
      });
    }
  } catch (e) {}
}
loadEnv();

const DEFAULT_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1q3rESt0GZG_rs8hk0hU1beeURRttxQKQ1mGFBJNrlyg/export?format=csv&gid=1297990899";
const GDRIVE_FOLDER_ID = process.env.GDRIVE_FOLDER_ID || "1v4r9-w66hyhWpeYx8OkU5B2t61D0rl4e";
const API_KEY = process.env.GOOGLE_API_KEY;

async function syncTracksFromSheet() {
  console.log("Fetching sheet data...");
  const res = await fetch(DEFAULT_SHEET_CSV_URL);
  if (!res.ok) throw new Error("Failed to fetch sheet data");
  const csvContent = await res.text();

  const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
  const rows = parsed.data;
  console.log(`✅ Found ${rows.length} rows. Syncing to database...`);

  for (const row of rows) {
    const timestamp = row['タイムスタンプ'] || row['Timestamp'];
    if (!timestamp) continue;

    const title = row['■ 曲タイトル'] || row['楽曲タイトル'] || row['title'] || "Untitled";
    const songUrl = row['youtube:URL'] || row['YouTube:URL'] || row['■ 楽曲URL'] || row['URL'] || "";
    const lyrics = row['■ 歌詞（任意）'] || row['歌詞'] || row['lyrics'] || "";
    const artistName = row['■ 公開名（アーティスト名）※公開する場合のみ'] || row['名前（ハンドルネーム）'] || row['artist'] || "";
    const xAccount = row['■ X（旧Twitter）アカウント'] || row['X（旧Twitter）アカウント'] || row['xAccount'] || "";
    // const audioUrlFromSheet = row['■ 音源データURL（任意）'] || row['audioUrl'] || ""; 
    const publishConsent = row['■ 企画終了後の公開について'] || row['公開の承諾'] || "";
    const email = row['■ メールアドレス（任意）'] || row['メールアドレス'] || "";

    await prisma.trackHonban.upsert({
      where: { timestamp },
      update: { xAccount, title, songUrl, lyrics, publishConsent, artistName, email },
      create: { timestamp, xAccount, title, songUrl, lyrics, publishConsent, artistName, email }
    });
  }
}

async function syncGDriveAudio() {
  if (!API_KEY) {
    console.warn("⚠️  GOOGLE_API_KEY が設定されていません。Google Drive同期をスキップします。");
    return;
  }

  console.log(`📂 Google Drive フォルダをスキャン中: ${GDRIVE_FOLDER_ID}...`);
  
  const q = encodeURIComponent(`'${GDRIVE_FOLDER_ID}' in parents and trashed = false`);
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&key=${API_KEY}&fields=files(id,name,size)&pageSize=1000`;
    
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.error) {
      console.error(`❌ Google Drive API エラー: ${data.error.message}`);
      return;
    }

    const files = data.files || [];
    console.log(`✅ ${files.length} 個のファイルが見つかりました。`);

    // データベースから全楽曲を取得（登録日順）
    const tracks = await prisma.trackHonban.findMany({
      orderBy: { createdAt: 'asc' }
    });

    // 重複するNoがある場合、MP3を優先するようにソート
    const sortedFiles = [...files].sort((a, b) => {
      const aExt = path.extname(a.name).toLowerCase();
      const bExt = path.extname(b.name).toLowerCase();
      if (aExt === '.mp3' && bExt !== '.mp3') return -1;
      if (aExt !== '.mp3' && bExt === '.mp3') return 1;
      return 0;
    });

    const processedNos = new Set();

    for (const file of sortedFiles) {
      const match = file.name.match(/^(\d+)/);
      if (!match) continue;

      const trackNo = parseInt(match[1], 10);
      if (processedNos.has(trackNo)) continue; // すでに優先度の高いファイルで処理済み
      processedNos.add(trackNo);

      const trackIndex = trackNo - 1;

      if (trackIndex >= 0 && trackIndex < tracks.length) {
        const track = tracks[trackIndex];
        const directUrl = `https://docs.google.com/uc?id=${file.id}&export=download`;

        if (track.audioUrl !== directUrl) {
          const fileSizeMB = Math.round((file.size || 0) / 1024 / 1024);
          console.log(`DEBUG: Raw File ID: "${file.id}"`);
          console.log(`DEBUG: Direct URL: "${directUrl}"`);
          console.log(`🎵 No.${String(trackNo).padStart(3, '0')} [${track.title}] の音源を更新中: ${file.name} (${fileSizeMB}MB)...`);
          await prisma.trackHonban.update({
            where: { id: track.id },
            data: { audioUrl: directUrl }
          });
        }
      }
    }
}

async function main() {
  try {
    await syncTracksFromSheet();
    // await syncGDriveAudio();
    console.log("✨ All sync tasks completed successfully!");
  } catch (err) {
    console.error("❌ Sync Error:", err);
  }
}

main()
  .finally(() => prisma.$disconnect());
