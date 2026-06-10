import { PrismaClient } from '@prisma/client';
import Papa from 'papaparse';

const prisma = new PrismaClient();

async function fullSync() {
  const sheetUrl = "https://docs.google.com/spreadsheets/d/1q3rESt0GZG_rs8hk0hU1beeURRttxQKQ1mGFBJNrlyg/export?format=csv&gid=1297990899";
  const startId = 1; // 全て対象
  
  console.log("📥 Fetching Spreadsheet data...");
  const res = await fetch(sheetUrl);
  const csvContent = await res.text();
  const parsed = Papa.parse(csvContent, { header: true, skipEmptyLines: true });
  const rows = parsed.data;

  const filteredRows = rows.filter(row => parseInt(row['No'] || "0") >= startId);
  console.log(`📊 Found ${filteredRows.length} rows to process.`);

  for (const row of filteredRows) {
    const timestamp = row['タイムスタンプ'] || row['Timestamp'];
    if (!timestamp) continue;

    const entryNo = row['No'] || "";
    const title = row['■ 曲タイトル'] || "Untitled";
    const songUrl = row['youtube:URL'] || row['■ 楽曲URL'] || "";
    const audioUrl = row['■ 音源データURL（任意）'] || "";
    const analysis = row['歌詞考察'] || "";
    const review = row['楽曲考察'] || "";
    const lyrics = row['■ 歌詞（任意）'] || "";
    const artistName = row['■ 公開名（アーティスト名）※公開する場合のみ'] || "";

    await prisma.track.upsert({
      where: { timestamp },
      update: { title, songUrl, entryNo, artistName, lyrics, review },
      create: { 
        timestamp, title, songUrl, entryNo, artistName, lyrics, review,
        published: false
      }
    });
  }
  console.log("✅ Spreadsheet upsert done.");

  /* --- Folder Sync (User manually updates audioUrl, so disabled) ---
  const apiKey = 'AIzaSyAze71Lj44kuYS7iV7jME8r6DbvKYBHIxc';
  const folderId = '1v4r9-w66hyhWpeYx8OkU5B2t61D0rl4e';
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const driveUrl = `https://www.googleapis.com/drive/v3/files?q=${q}&key=${apiKey}&fields=files(id,name)&pageSize=1000`;
  const driveRes = await fetch(driveUrl);
  const driveData = await driveRes.json();
  const files = driveData.files || [];

  for (const file of files) {
    const match = file.name.match(/^(\d+)/);
    if (!match) continue;
    const normalizedNo = match[1].padStart(3, '0');
    const directUrl = `https://docs.google.com/uc?export=download&id=${file.id}`;
    
    await prisma.track.updateMany({
      where: { entryNo: normalizedNo },
      data: { audioUrl: directUrl }
    });
  }
  ------------------------------------ */
  console.log("✨ Full manual sync completed.");
}

fullSync().then(() => prisma.$disconnect());
