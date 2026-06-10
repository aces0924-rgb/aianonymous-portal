import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const entryNo = "013";
  const analysis = `### 🌐 テーマ分析
**「普遍なる無償の愛と光」**
巣立ちゆく我が子への祈りと祝福をテーマにした、時代や場所を超えて共鳴する普遍的な「愛の賛歌」です。どれほど遠く離れても、時間が色褪せても、決して消えることのない「光」として子供の未来を照らし続ける、無償の母性が極めて純粋な形で描かれています。

### ⚙️ 歌詞の工夫点
「ママの愛」という極めて日常的で直球な言葉をあえて使い、それを「消えぬ光」というシンボリックで崇高な表現へと昇華させている点が特徴です。物語の展開とともに、祈りの対象（子）が物理的に遠ざかっていく寂しさと、それ以上に強固な「永遠の同在」という確信が重なり合い、聴き手を大きな安心感で包み込みます。

### 🎤 注目すべきパンチライン
**「心はいつも 君を照らしている」**
物理的な庇護の手が届かなくなった後の、究極的な関わりの形としての「光」。自分自身の存在を一つの灯火として、相手の行く末を絶え間なく見守り続けたいという、無私無欲の愛がこの一文に力強く、そして優しく込められています。`;

  const updated = await prisma.trackHonban.update({
    where: { id: 9 },
    data: { analysis: analysis }
  });
  
  console.log(`Analysis injected successfully for No.${entryNo} [${updated.title}]`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
