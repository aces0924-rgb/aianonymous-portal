const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const DEFAULT_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1q3rESt0GZG_rs8hk0hU1beeURRttxQKQ1mGFBJNrlyg/export?format=csv&gid=1297990899";
  
  try {
    const res = await fetch(DEFAULT_SHEET_CSV_URL);
    const text = await res.text();
    const rows = text.split('\n').slice(1, 6).map(line => line.split(','));
    console.log("CSV Timestamps (first 5):");
    rows.forEach(r => console.log(`- [${r[1]}]`));

    const dbTracks = await prisma.trackHonban.findMany({ take: 5, orderBy: { id: 'asc' } });
    console.log("\nDB Timestamps (first 5):");
    dbTracks.forEach(t => console.log(`- [${t.timestamp}] (No.${t.entryNo})`));

  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
