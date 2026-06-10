import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    select: { entryNo: true, analysis: true }
  });

  const analyses = tracks.map(t => t.analysis).filter(a => a && a.length > 0);
  
  if (analyses.length === 0) {
    console.log("No analysis data found.");
    return;
  }

  const totalChars = analyses.reduce((sum, a) => sum + a.length, 0);
  const avgTotal = totalChars / analyses.length;

  let s1Total = 0, s2Total = 0, s3Total = 0;
  let s1Count = 0, s2Count = 0, s3Count = 0;

  analyses.forEach(a => {
    // アイコンで分割
    const parts = a.split(/\n?\n?(?=🌐|⚙️|🎤|🎤)/).filter(p => p.trim().length > 0);
    
    parts.forEach(p => {
      const content = p.replace(/^(🌐|⚙️|🎤).*?\n/, '').trim();
      if (p.includes('🌐')) { s1Total += content.length; s1Count++; }
      else if (p.includes('⚙️')) { s2Total += content.length; s2Count++; }
      else if (p.includes('🎤')) { s3Total += content.length; s3Count++; }
    });
  });

  // No.1 (001) のデータ
  const no1 = tracks.find(t => t.entryNo === "001" || t.entryNo === 1);

  console.log({
    totalTracks: analyses.length,
    averageTotal: Math.round(avgTotal),
    averageSections: [
      s1Count > 0 ? Math.round(s1Total / s1Count) : 0,
      s2Count > 0 ? Math.round(s2Total / s2Count) : 0,
      s3Count > 0 ? Math.round(s3Total / s3Count) : 0
    ],
    no1: {
      entryNo: no1?.entryNo,
      length: no1?.analysis?.length || 0
    }
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
