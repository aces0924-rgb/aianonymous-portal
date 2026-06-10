import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const entryNo = "007";
  const analysis = `### 🌐 テーマ分析
**「届かない光への憧憬と疾走」**
手の届かない遠い存在である「君」を「夜空」や「ブラックホール」に例え、その秘密に近づきたいという純粋で、かつ危うい好奇心を描いています。未知への探求心がそのまま恋心へと昇華され、夜を駆け抜けていく瑞々しい疾走感がテーマの核心です。

### ⚙️ 歌詞の工夫点
「秘密は ブラックホール」「新しい謎が ウインクする」といった、SF的なモチーフをキュートに擬人化したメタファーが、楽曲にポップなリズムと知的な遊び心を与えています。一見キラキラとしたラブソングのようでいて、その背景に広がる「果てない闇」を「君の居場所」と定義する視点が、深みのある世界観を構築しています。

### 🎤 注目すべきパンチライン
**「その遠さが 恋みたいだ」**
物理的な距離感ではなく、相手を理解しきれない「心の掴みどころのなさ」こそを「恋」の本質として定義した、非常に直感的なフレーズです。夜空の広大さと、恋する者の切なさを一瞬でリンクさせ、作品全体の叙情性を一気に引き上げています。`;

  const updated = await prisma.trackHonban.update({
    where: { id: 14 },
    data: { analysis: analysis }
  });
  
  console.log(`Analysis injected successfully for No.${entryNo} [${updated.title}]`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
