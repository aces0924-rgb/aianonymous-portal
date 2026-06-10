const { PrismaClient } = require('@prisma/client');
const Papa = require('papaparse');

const prisma = new PrismaClient();
const SHEET_URL = "https://docs.google.com/spreadsheets/d/1q3rESt0GZG_rs8hk0hU1beeURRttxQKQ1mGFBJNrlyg/export?format=csv&gid=1297990899";

async function main() {
  console.log('Fetching sheet data...');
  const res = await fetch(SHEET_URL);
  const csvContent = await res.text();

  console.log('Parsing CSV...');
  const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
  const rows = parsed.data;

  for (const row of rows) {
    const timestamp = row['タイムスタンプ'] || row['Timestamp'];
    if (!timestamp) continue;

    const entryNo = row['No'] || "";
    const title = row['■ 曲タイトル'] || row['楽曲タイトル'] || "Untitled";
    const review = row['楽曲考察'] || "";
    
    // ジャンル抽出
    let genre = "";
    if (review.includes("■ジャンル")) {
      const lines = review.split('\n');
      const genreIdx = lines.findIndex(l => l.includes("■ジャンル"));
      if (genreIdx !== -1 && lines[genreIdx+1]) {
        genre = lines[genreIdx+1].trim();
      }
    }

    console.log(`Updating ${entryNo}: ${title} (Genre: ${genre})`);
    await prisma.trackHonban.update({
      where: { timestamp },
      data: { 
        entryNo,
        genre,
        review,
        analysis: row['歌詞考察'] || ""
      }
    }).catch(e => console.error(`Failed: ${e.message}`));
  }
  console.log('Production database updated successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
