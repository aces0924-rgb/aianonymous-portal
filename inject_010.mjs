import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const entryNo = "010";
  const analysis = `### 🌐 テーマ分析
**「不屈の意志が放つ一筋の光（斬光）」**
孤独や痛みに飲み込まれそうな「夜」の世界を舞台に、それでも自らの鼓動を信じ、震える手で未来を掴み取ろうとする強い意志を描いています。絶望の淵から這い出し、自らの「声」そのもので闇を切り裂く「斬光」が、希望の象徴として鮮烈に提示されています。

### ⚙️ 歌詞の工夫点
「蒼い炎」「蒼斬光」といった「蒼」の色彩イメージを貫くことで、冷徹な孤独と静かな熱情が同居する独特の緊張感を表現しています。「砕けそうな心のままま それでもなお進み続ける」といった、自身の弱さや揺らぎを認めながらも前を向く、等身大で泥臭い力強さが物語としての深い共感を生んでいます。

### 🎤 注目すべきパンチライン
**「灰の下で息を潜めた 光はまだ死んじゃいない」**
一度は灰となり、燃え尽きたかと思われた情熱や命。しかしその深層で密かに火を灯し、牙を研ぎ続けていた不屈の精神を表現した力強い一節です。最果ての夜を越えるための、真の「生の輝き」がこの一行に凝縮されています。`;

  const updated = await prisma.trackHonban.update({
    where: { id: 6 },
    data: { analysis: analysis }
  });
  
  console.log(`Analysis injected successfully for No.${entryNo} [${updated.title}]`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
