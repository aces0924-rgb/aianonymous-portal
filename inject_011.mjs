import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const entryNo = "011";
  const analysis = `### 🌐 テーマ分析
**「捕食者と愛執のジレンマ」**
童話『赤ずきん』をモチーフに、純粋な魂に惹かれた「バケモノ」の視点から、愛したいという切望と壊してしまいたいという獣的な本能の葛藤を描いています。抑えきれない衝動が悲劇的な結末（捕食）へと向かう、ダーク・ゴシックな物語がテーマの核心です。

### ⚙️ 歌詞の工夫点
「抱きしめたいのか 噛みたいのか」「キスか捕食か 味で分かるよ」といった、対極にある概念を共感覚的に並置する手法が秀逸です。優しさと暴力、愛と飢えが表裏一体となった歪んだ愛情表現が、「赤いフード」という鮮烈な色のイメージとともに、聴き手の本能的な恐怖と官能を同時に刺激します。

### 🎤 注目すべきパンチライン
**「赤いフードが 落ちたあとに 愛も本能も 一緒に食べた」**
最終的に本能に抗えず、愛する対象を永遠に自分の一部にしてしまうという、最も残酷で純粋な「合一」の瞬間。救いのない結末でありながら、それがバケモノにとっての唯一の愛の成就であったことを象徴する、冷たくも重厚な一節です。`;

  const updated = await prisma.trackHonban.update({
    where: { id: 2 },
    data: { analysis: analysis }
  });
  
  console.log(`Analysis injected successfully for No.${entryNo} [${updated.title}]`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
