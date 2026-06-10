import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: {
      analysis: { not: null },
      lyrics: { not: null }
    },
    orderBy: { entryNo: 'asc' }
  });

  const mismatches = [];

  for (const t of tracks) {
    const analysis = t.analysis || "";
    const lyrics = t.lyrics || "";
    const normalizedLyrics = lyrics.replace(/\s+/g, '');

    // 考察文の中から、何らかの引用符（「」、“”、**、>など）で囲まれた部分や、
    // 🎤セクションにある文章をより柔軟に探す
    let foundValidQuote = false;
    let quoteToTest = "";

    // 1. 🎤セクション全体を抽出
    const punchlineSection = analysis.split(/🎤|パンチライン/).pop() || "";
    
    // 2. その中から「」や太字の引用っぽいのを探す
    const quoteMatches = punchlineSection.match(/[「『](.*?)[」』]|\*\*(.*?)\*\*/g);
    
    if (quoteMatches) {
      for (let q of quoteMatches) {
        // 記号を除去して純粋なテキストにする
        const cleanQuote = q.replace(/[「」『』\*]/g, '').trim();
        if (cleanQuote.length < 5) continue; // 短すぎるものは無視

        const normalizedQuoted = cleanQuote.replace(/\s+/g, '');
        if (normalizedLyrics.includes(normalizedQuoted)) {
          foundValidQuote = true;
          break;
        } else {
          quoteToTest = cleanQuote; // 不一致だったものを記録
        }
      }
    }

    if (!foundValidQuote && quoteToTest) {
      mismatches.push({
        no: t.entryNo,
        title: t.title,
        quoted: quoteToTest,
        reason: "Hallucinated punchline (not in lyrics)"
      });
    }
  }

  const output = mismatches.map(m => `No.${m.no} [${m.title}] -> ${m.reason}\n   Invalid Quote: ${m.quoted}`).join('\n\n');
  fs.writeFileSync('audit_hallucinations_utf8.txt', output, 'utf8');
  console.log(`Audit finished. Found ${mismatches.length} true hallucinations.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
