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

    // 「🎤 注目すべきパンチライン」セクションを探す
    const punchlineRegex = /🎤.*[\r\n]+(?:\*\*「?|「)(.*?)(?:」?\*\*|」)/s;
    const match = analysis.match(punchlineRegex);

    if (match) {
      const quotedPunchline = match[1].trim();
      const normalizedLyrics = lyrics.replace(/\s+/g, '');
      const normalizedQuoted = quotedPunchline.replace(/\s+/g, '');

      if (!normalizedLyrics.includes(normalizedQuoted)) {
        mismatches.push({
          no: t.entryNo,
          title: t.title,
          quoted: quotedPunchline,
          reason: "Not found in lyrics"
        });
      }
    } else {
      mismatches.push({
        no: t.entryNo,
        title: t.title,
        quoted: "CANNOT_EXTRACT",
        reason: "Format mismatch"
      });
    }
  }

  const output = mismatches.map(m => `No.${m.no} [${m.title}] -> ${m.reason}\n   Quoted: ${m.quoted}`).join('\n\n');
  fs.writeFileSync('audit_results_utf8.txt', output, 'utf8');
  console.log(`Audit finished. Mismatches: ${mismatches.length}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
