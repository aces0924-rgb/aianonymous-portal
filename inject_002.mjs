import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const entryNo = "002";
  const analysis = `### 🌐 テーマ分析
**「静寂の独占と朝霧の幻想」**
誰もいない早朝の温泉街（由布院、金鱗湖）を舞台に、張り詰めた空気と幻想的な朝霧の中での、独占的な孤独と充足感を描いています。日常から切り離されたマージナル（境界的）な時間の美しさと、そこで自分を取り戻すプロセスがテーマの核心です。

### ⚙️ 歌詞の工夫点
「耳も取れそうな 冷たい空気」という身体的でリアリティのある感覚から始まり、「いま ぜんぶぼくのもの」という独占欲、そして最後にはその美しさを共有するかのような「ぜんぶきみのもの」へと変化する視点の対比が極めて叙情的です。朝霧の中で「迷って 迷って たどり着いた」という過程が、物理的な距離だけでなく、心の迷いと救済を暗示しているかのようです。

### 🎤 注目すべきパンチライン
**「あと何回 あと何回」**
奇跡のような瞬間に立ち会った時、人は喜びと同時に、その時間が有限であることに気づいてしまいます。あと何回この景色を見られるのか。美しさへの深い感動と、それがいつか失われることへの切なさが、この短いリフレインに凝縮されています。`;

  const updated = await prisma.trackHonban.update({
    where: { id: 1 },
    data: { analysis: analysis }
  });
  
  console.log(`Analysis injected successfully for No.${entryNo} [${updated.title}]`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
