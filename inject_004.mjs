import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const entryNo = "004";
  const analysis = `### 🌐 テーマ分析
**「自己破壊と再生のブルース」**
積み上げてきた正しさや嘘が瓦解する中で、行き場のない衝動をぶつける破壊的カタルシスを描いています。全てを壊した（Break It All）後に残る、決して消すことのできない「自分自身」という存在を、痛みと共に肯定していく再生の物語がテーマの核心です。

### ⚙️ 歌詞の工夫点
「Will I smile tomorrow / Or will I break down」という冒頭の自問自答が、英語と日本語の混交によって内面の混乱と葛藤をより直接的に響かせています。「救いなんて なくていい」と言い切る潔さが、既存の価値観に押しつぶされそうになっていた自己を解き放つトリガーとなっており、破壊の後に「まっさら」になろうとする構成が、聴き手に強烈な解放感を与えます。

### 🎤 注目すべきパンチライン
**「傷だらけで 構わない This is my life I move on」**
救いや正しさを求めることをやめ、ボロボロになった現状の自分こそが唯一無二の真実であると受け入れる覚悟の瞬間です。絶望の底で「自分を消すことはできない」と悟るからこそ生まれる、泥臭くも強固な生存意志が、この一節に凝縮されています。`;

  const updated = await prisma.trackHonban.update({
    where: { id: 11 },
    data: { analysis: analysis }
  });
  
  console.log(`Analysis injected successfully for No.${entryNo} [${updated.title}]`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
