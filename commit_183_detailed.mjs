import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const update = {
  entryNo: "183",
  analysis: `🌐 **テーマ分析**
既存の言語の枠組みを解体し、純粋な音節の響きとリズムだけで宇宙的・儀式的な世界観を構築した、極めて前衛的な音声詩的ナンバーです。繰り返される「VREXXA-MUNDI, SOL-THRYNE-A-VOSS」という力強い祝祭的なフレーズは、あたかも異星の神話や、遠い未来の祭祀を傍受したかのような錯覚をリスナーに与えます。意味を理解させるのではなく、音の「質感」と「勢い」で感情の深層に直接訴えかける、原始的かつ未来的なエネルギーに満ちています。

⚙️ **歌詞の工夫点**
「Grent-hildas marn-voxyl」「Luv-tri-enis」といった、硬質でメカニカルな響きを持つ造語の連打が、楽曲に強烈なキャラクター性と非日常性を与えています。また、随所に挿入される「"VAIE!"」「"GLYN!"」「"TS’FEI!"」といった鋭い叫び声や、(hah)という吐息の演出が、無機質な音声の羅列に生身の肉体性とダイナミズムを吹き込んでいます。終盤に向けて加速し、最後は「Hi♪」という親しみやすい挨拶で幕を閉じる構成のギャップも、リスナーの予想を裏切る見事な展開です。

🎤 **注目すべきパンチライン**
**「VREXXA-MUNDI, SOL-THRYNE-A-VOSS」**
楽曲の核として幾度も咆哮される、この呪文のようなフレーズ。意味は不明ながらも、その圧倒的な音圧とリズミカルな響きは、一度聴いたら忘れられない中毒性と、宇宙の理（ことわり）に触れるような神秘的な昂揚感をリスナーに刻み込みます。`
};

async function main() {
  await prisma.trackHonban.updateMany({
    where: { entryNo: update.entryNo },
    data: { analysis: update.analysis }
  });
  console.log(`Updated entryNo: \${update.entryNo}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
