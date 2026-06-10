import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // No.5 考察
  const analysis5 = `### 🌐 テーマ分析
この曲は、社会が強要する「Green（安全）」への同調圧力に対し、衝動的な「Red（警告・情熱）」をもって抗う姿を描いています。「Wait for the green（青を待て）」という使い古された教訓を、「Safety first is the price we have to pay（安全第一はその代償だ）」と切り捨てる一節が象徴的です。

### ⚙️ 歌詞の工夫点
英語詞特有の強いアタック感が、「Neon red」「Burning ice」といった対照的な色彩イメージを際立たせています。特に「Traffic light」を人生の比喩として使い、止まるべき場所でこそ加速するというパラドックスが、デジタル世代の焦燥感と熱量を見事に表現しています。

### 🎤 注目すべきパンチライン
> "Don't wait for the light, don't look back again / Higher and higher, we’re dancing in the rain!"  
光（合図）を待たず、土砂降りの雨の中（困難な状況）でこそ高く舞うという決意は、聴く者の背中を強く押すパワーに満ちています。`;

  // No.6 考察
  const analysis6 = `### 🌐 テーマ分析
一見すると贅沢な「お嬢様ライフ」への不満を綴るコミカルな楽曲に見えますが、その深層にはマテリアルな豊かさでは決して埋まらない現代特有の孤独が横たわっています。タイトルにある「デパス（安らぎ）」への渇望は、過剰な自意識の疲れを象徴しています。

### ⚙️ 歌詞の工夫点
「ケーキのサイズが小さい」といった些細な悩みと、「心臓のビートが早すぎる」という深刻な症状を並列させることで、少女の不安定な精神状態をユーモラスかつ切実に描き出しています。執事のセバスチャンと薬（デパス）を韻で繋げる遊び心の中に、閉塞的な日常が透けて見えます。

### 🎤 注目すべきパンチライン
> "頼りにしてるの デパスちゃん / ときめきよりも やすらぎチャン"  
劇的な恋や刺激（ときめき）よりも、ただ静かに眠れること、凪いだ心でいられることを選ぶ。この一節は、疲弊した現代人の本音を射抜くような鋭さを持っています。`;

  console.log("Injecting analysis for No.5 and No.6...");
  
  await prisma.track.updateMany({
    where: { entryNo: "005" },
    data: { analysis: analysis5 }
  });

  await prisma.track.updateMany({
    where: { entryNo: "006" },
    data: { analysis: analysis6 }
  });

  console.log("Analysis injected successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
