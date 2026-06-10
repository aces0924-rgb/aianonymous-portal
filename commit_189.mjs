import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.trackHonban.updateMany({
    where: { entryNo: "189" },
    data: { analysis: `🌐 **テーマ分析**
自然界の成長サイクルを借りて、所有や境界、そして「美しさ」によって隠蔽された歴史の痛みを暴き出す、壮大な哲学詩です。「希望」という名の庭園が誰かの犠牲の上に築かれている可能性を静かに、かつ鋭く問うています。

⚙️ **歌詞の工夫点**
全編英語による詩的な比喩が普遍性を与えています。「銀行家の口を持つ鐘」など、現代社会の虚飾とパワーゲームをシュルレアリスム的に可視化するイメージが秀逸です。

🎤 **注目すべきパンチライン**
**「We called it hope, we called it peace But every rose had human teeth」**` }
  });
  console.log("Updated entryNo: 189");
}

main().catch(console.error).finally(() => prisma.$disconnect());
