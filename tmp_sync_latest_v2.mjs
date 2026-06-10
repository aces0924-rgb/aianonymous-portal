import { PrismaClient } from '@prisma/client';
import Papa from 'papaparse';

const prisma = new PrismaClient();

const DEFAULT_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1q3rESt0GZG_rs8hk0hU1beeURRttxQKQ1mGFBJNrlyg/export?format=csv&gid=1297990899";

async function syncTracksFromSheet() {
  console.log("Fetching sheet data from:", DEFAULT_SHEET_CSV_URL);
  const res = await fetch(DEFAULT_SHEET_CSV_URL);
  if (!res.ok) throw new Error("Failed to fetch sheet data");
  const csvContent = await res.text();

  const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
  const rows = parsed.data;
  console.log(`Found ${rows.length} rows. Syncing to database...`);

  for (const row of rows) {
    const timestamp = row['タイムスタンプ'] || row['Timestamp'];
    if (!timestamp) continue;

    const id = parseInt(row['No']);
    const title = row['■ 曲タイトル'] || row['楽曲タイトル'] || row['title'] || "Untitled";
    const songUrl = row['youtube:URL'] || row['YouTube:URL'] || row['■ 楽曲URL'] || row['URL'] || "";
    const lyrics = row['■ 歌詞（任意）'] || row['歌詞'] || row['lyrics'] || "";
    const artistName = row['■ 公開名（アーティスト名）※公開する場合のみ'] || row['名前（ハンドルネーム）'] || row['artist'] || "";
    const xAccount = row['■ X（旧Twitter）アカウント'] || row['X（旧Twitter）アカウント'] || row['xAccount'] || "";
    const audioUrl = row['■ 音源データURL（任意）'] || row['audioUrl'] || ""; 
    const publishConsent = row['■ 企画終了後の公開について'] || row['公開の承諾'] || "";
    const email = row['■ メールアドレス（任意）'] || row['メールアドレス'] || "";
    const sheetAnalysis = row['歌詞考察'] || "";
    const sheetReview = row['曲考察'] || "";

    const existingTrack = await prisma.track.findUnique({ where: { timestamp } });

    const updateData = {
      id,
      xAccount,
      title,
      songUrl,
      lyrics,
      publishConsent,
      artistName,
      email,
      review: sheetReview || undefined
    };

    // Protect existing analysis if sheet is empty
    if (sheetAnalysis) {
      updateData.analysis = sheetAnalysis;
    }

    await prisma.track.upsert({
      where: { timestamp },
      update: updateData,
      create: { 
        ...updateData,
        timestamp,
        analysis: sheetAnalysis || null
      }
    });
  }
  console.log("Sync completed successfully!");
}

syncTracksFromSheet()
  .catch(err => {
    console.error("Sync Error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
