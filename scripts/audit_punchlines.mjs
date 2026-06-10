import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: {
      analysis: { not: null },
      lyrics: { not: null }
    },
    orderBy: { entryNo: 'asc' }
  });

  console.log(`Auditing ${tracks.length} tracks for punchline mismatch...\n`);
  const mismatches = [];

  for (const t of tracks) {
    const analysis = t.analysis || "";
    const lyrics = t.lyrics || "";

    // 「🎤 注目すべきパンチライン」の後の引用部分を抽出する
    // 基本的に **「引用文」** の形式か、🎤のすぐ後にあることを想定
    const punchlineRegex = /🎤.*[\r\n]+(?:\*\*「?|「)(.*?)(?:」?\*\*|」)/s;
    const match = analysis.match(punchlineRegex);

    if (match) {
      const quotedPunchline = match[1].trim();
      
      // 歌詞に含まれているかチェック (改行やスペースの違いを考慮して正規化)
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
      // 正規表現にマッチしない（フォーマットが違う）場合もチェック対象に入れる
      mismatches.push({
        no: t.entryNo,
        title: t.title,
        quoted: "CANNOT_EXTRACT",
        reason: "Analysis format mismatch or missing punchline"
      });
    }
  }

  if (mismatches.length === 0) {
    console.log("No mismatches found!");
  } else {
    console.log(`Found ${mismatches.length} potential issues:\n`);
    mismatches.forEach(m => {
      console.log(`- No.${m.no} [${m.title}]`);
      console.log(`  Quoted: ${m.quoted}`);
      console.log(`  Reason: ${m.reason}`);
      console.log('---');
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
