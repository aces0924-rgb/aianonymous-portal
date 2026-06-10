import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const keywords = ['フェス', 'イベント', '本フェス', '匿名フェス', 'グランドフィナーレ', '公募', '開催', 'フィナーレ'];

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: {
      entryNo: { gte: '002', lte: '088' }
    },
    orderBy: { entryNo: 'asc' }
  });

  console.log(`Auditing ${tracks.length} tracks for meta-talk keywords...`);
  let matchCount = 0;

  tracks.forEach(t => {
    keywords.forEach(k => {
      if (t.analysis.includes(k)) {
        console.log(`[MATCH] NO: ${t.entryNo} TITLE: ${t.title} KEYWORD: ${k}`);
        const start = Math.max(0, t.analysis.indexOf(k) - 60);
        const end = Math.min(t.analysis.length, t.analysis.indexOf(k) + 60);
        console.log(`CONTEXT: ...${t.analysis.substring(start, end).replace(/\n/g, ' ')}...`);
        console.log('---');
        matchCount++;
      }
    });
  });

  console.log(`Audit complete. Total keywords found: ${matchCount}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
