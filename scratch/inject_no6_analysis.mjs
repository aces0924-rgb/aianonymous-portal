import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const entryNo = "006";
  const analysisContent = `🌐 **テーマ分析 (Theme Analysis)**
虚飾の裏にある生存の渇望。「お嬢様」という華やかな記号の陰で、ケーキのサイズやキャビアの粒といった滑稽な悩みに変換される、耐え難いほどの「生」への不安感。

⚙️ **歌詞の工夫点 (Techniques & Expressions)**
貴族的な優雅な言葉遣いと、薬物名（デパス）や「ジャン・バルジャン」という重厚な救済のメタファーの落差。お嬢様のティアラが「軽くなる」という表現に込められた、依存と解放の境界。

🎤 **注目すべきパンチライン (Punchline)**
「ときめきよりも やすらぎチャン」 —— 刺激ではなく平穏のみを求める、切実すぎる現代的内面。`;

  const reviewContent = `■ジャンル
メルヘン・ゴシック・ポップ / エレクトロ・スウィング

■曲のイメージ
豪華絢爛なお茶会の情景が浮かぶ華やかなオーケストラサウンド。しかし、その背後で不協和音を奏でるシンセサイザーが、崩れゆく精神の均衡を表現しています。

■曲と歌詞の親和性
規則正しいビートの中に、時折混ざる「早すぎる心臓の鼓動（BPMの加速）」を感じさせるアレンジ。優雅な立ち振る舞いの裏にある、焦燥感と安らぎの渇望が、音と言葉で見事に一体化しています。`;

  console.log(`Injecting analysis and review for No.${entryNo}`);

  const updatedTrack = await prisma.track.update({
    where: { timestamp: "2026/04/15 18:17:02" }, // Unique key for No.6
    data: { 
      analysis: analysisContent,
      review: reviewContent,
      published: true // Make it public
    }
  });

  console.log("Analysis and Review injected successfully for:", updatedTrack.title);
}

main()
  .catch(err => {
    console.error("Injection Error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
