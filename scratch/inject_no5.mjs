import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const targetId = 5;
  const analysisContent = `🌐 **テーマ分析 (Theme Analysis)**
常識の境界線を突破する意志。本作は、社会が強要する「青信号（安全性）」という名の停滞に対し、内なる情熱、あるいは警告としての「赤信号（Red lights）」を肯定的に再定義しています。止まるべき場所でこそ加速する、逆説的な勇気が全編に流れています。

⚙️ **歌詞の工夫点 (Techniques & Expressions)**
「Waiting for the green」という慣用的な安全策を「平穏に塗り固められた嘘（peace that’s built upon a lie）」と表現し、赤信号を「火（fire）」に見立てるメタファーが秀逸です。都会的なネオンのライティングと、泥臭いまでの情熱の対比が、英語詩特有のリズムと相まって非常に力強く響きます。

🎤 **注目すべきパンチライン (Punchline)**
「Red signal glowing, but I'm looking at you / The one who’s walking, the one who is true」
――世界が「止まれ」と言っていても、目の前で歩き続ける「君」こそが真実であるという、圧倒的な信頼の表明。信号の色よりも、隣にいる魂の鼓動を信じるという決意が、この曲の最も熱い核となっています。`;

  console.log(`Injecting analysis for No.${targetId}`);

  const updatedTrack = await prisma.track.update({
    where: { id: targetId },
    data: { 
      analysis: analysisContent,
      published: true // Ensure it's public
    }
  });

  console.log("Analysis injected successfully for:", updatedTrack.title);
}

main()
  .catch(err => {
    console.error("Injection Error:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
