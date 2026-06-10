import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const entryNo = "001";
  const analysis = `### 🌐 テーマ分析
**「虚像のラグジュアリーと精神のディール」**
華やかな夜の世界、シャンパン、ビロードといった高価格な記号の裏側で、自分自身のアイデンティティを切り売り（Credit Transaction）し、虚飾を纏うことでしか存在できない空虚さを描いています。消費される「個」の悲哀と、その極限状態での叫びがテーマの核心です。

### ⚙️ 歌詞の工夫点
「査定の目は まるでレンジ」という比喩表現が極めて鋭利です。冷徹な市場原理によって人間の価値が瞬時に数値化され、温められた「ハリボテの嘘」として使い捨てられる残忍さを、現代的な無機質な家電の記号で鮮やかに切り取っています。また、「Credit Transaction」「Sugar Connection」といったビジネス用語を快楽と孤独の文脈に織り交ぜる構造が、作品のサイバーパンクな質感を強調しています。

### 🎤 注目すべきパンチライン
**「誰にも 譲らない その痣が 私の 真実だ！」**
全てを偽り、査定され、切り売りしてきた「私」が、唯一売ることのできなかった、そして誰にも侵せなかった「痛み（痣）」だけを自らのアイデンティティとして抱きしめる一節。虚無の果てに到達した、逆説的で泥臭い「生の証明」が、聴き手の胸を強く打ちます。`;

  const updated = await prisma.trackHonban.update({
    where: { id: 5 },
    data: { analysis: analysis }
  });
  
  console.log(`Analysis injected successfully for No.${entryNo} [${updated.title}]`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
