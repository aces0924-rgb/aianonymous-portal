import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import Papa from 'papaparse';

const prisma = new PrismaClient();
const DEFAULT_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1q3rESt0GZG_rs8hk0hU1beeURRttxQKQ1mGFBJNrlyg/export?format=csv&gid=1297990899";

async function main() {
  const startId = 89;
  console.log(`Syncing tracks from No.${startId} onwards...`);

  try {
    const res = await fetch(DEFAULT_SHEET_CSV_URL);
    if (!res.ok) throw new Error("Failed to fetch sheet data");
    const csvContent = await res.text();

    const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
    let rows = parsed.data;

    const filteredRows = rows.filter(row => {
      const rowId = parseInt(row['No'] || "0");
      return rowId >= startId;
    });

    console.log(`Found ${filteredRows.length} tracks to sync.`);

    for (const row of filteredRows) {
      const timestamp = row['タイムスタンプ'] || row['Timestamp'];
      if (!timestamp) continue;

      const entryNo = row['No'] || "";
      const title = row['■ 曲タイトル'] || row['楽曲タイトル'] || "Untitled";
      const songUrl = row['youtube:URL'] || row['■ 楽曲URL'] || "";
      const lyrics = row['■ 歌詞（任意）'] || "";
      const artistName = row['■ 公開名（アーティスト名）※公開する場合のみ'] || "";
      const xAccount = row['■ X（旧Twitter）アカウント'] || "";
      const audioUrl = row['■ 音源データURL（任意）'] || "";
      const publishConsent = row['■ 企画終了後の公開について'] || "";
      const email = row['■ メールアドレス（任意）'] || "";
      const review = row['楽曲考察'] || "";

      const updateData = {
        xAccount, title, songUrl, lyrics, publishConsent, artistName, email, review, entryNo
      };

      await prisma.trackHonban.upsert({
        where: { timestamp },
        update: updateData,
        create: {
          ...updateData,
          timestamp,
          published: false
        }
      });
      console.log(`Synced: No.${entryNo} [${title}]`);
    }

    console.log("Sync completed successfully.");
  } catch (err) {
    console.error("Sync failed:", err);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
