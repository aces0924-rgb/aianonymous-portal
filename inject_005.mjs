import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const entryNo = "005";
  const analysis = `### 🌐 テーマ分析
**「アイデンティティの再帰的消失（Glitch）」**
SNSやAIが高度に発達した社会における、「誰かの言葉の切り貼り」で構成された自己を、剥いでも剥いでも現れる「仮面」のメタファーで描いています。個が溶解し、記号化された集合体（WE ARE NO ONE）へと至る過程での実存的な不安と、その無機質な美しさがテーマの核心です。

### ⚙️ 歌詞の工夫点
「trace replace erase rewrite」といったデータ操作用語を、デジタルなグリッチ感とともに畳みかける手法が極めて現代的です。「仮面の奥に 別の仮面」というマトリョーシカのような再帰構造が、出口のないループ（Endless loop）の絶望を強調しており、「存在だけが浮かぶ」という表現が、主体を失った情報の残響としての人間像を鮮烈に浮き彫りにしています。

### 🎤 注目すべきパンチライン
**「顔を探し壊す 残るのは空洞 ... それを私と呼ぶなら それでいい」**
本当の自分（真実の顔）という虚構を追い求めることを諦め、ただ反響する声と現象としての「仮面」そのものを自分として受け入れる。究極の虚無（空洞）を抱えたまま、それでも「息してる」という事実だけで存在を肯定する、冷徹で力強い実存の叫びです。`;

  const updated = await prisma.trackHonban.update({
    where: { id: 10 },
    data: { analysis: analysis }
  });
  
  console.log(`Analysis injected successfully for No.${entryNo} [${updated.title}]`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
