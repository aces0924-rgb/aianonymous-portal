import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const analyses = [
  {
    entryNo: "047",
    title: "FizzBuzz!",
    analysis: `### 🌐 テーマ分析
**「論理と韻律の融合」と「反復するプログラムの美学」**
プログラミングの基礎であるFizzBuzz問題を、VBAやJavaScriptのコードをそのまま歌詞として詠み上げるという、超実験的なデジタルトラック。

### ⚙️ 歌詞の工夫点
"Option Explicit"や"modulo"といった構文が、冷徹なリズムを刻むパーカッションのように機能。論理構造そのものを音楽のストラクチャーに変換する試みが斬新です。

### 🎤 注目すべきパンチライン
**「Check the logic, print the result!」** — 感情に左右されない完璧なアルゴリズムへの信頼と、出力結果を待つ瞬間の高揚感が同居しています。`
  },
  {
    entryNo: "048",
    title: "雨粒のシンコペーション",
    analysis: `### 🌐 テーマ分析
**「都会の浄化」と「自己の再構築」**
降り続く雨を、過去の「嘘」や心の「重荷」を洗い流すための神聖な儀式として捉えた、透明感あふれる叙情詩。

### ⚙️ 歌詞の工夫点
「アスファルトの匂い」「濡れたシャツ」といった五感を刺激する描写が、内面的な「呼吸」の回復へと繋がる構成。雨音をシンコペーション（切分法）になぞらえ、単調な日常に新たなリズムを与えています。

### 🎤 注目すべきパンチライン
**「世界が透明に 書き換わる」** — 視界を遮る雨が、逆に世界をクリアに再定義（リライト）してくれるという逆説的な救い。`
  },
  {
    entryNo: "049",
    title: "今日ビジュ優勝",
    analysis: `### 🌐 テーマ分析
**「セルフラブの肯定」と「日常のイベント化」**
鏡の中の自分を肯定し、「今日という日」を最高の結果（優勝）にするための、ポジティブで高エネルギーなガールズ・アンセム。

### ⚙️ 歌詞の工夫点
「ビジュ優勝」「勝ち確」「だるい」といった現代の口語（オタク・ギャル用語）をテンポよく配置。「リップを塗って更新」という、メイクを自己更新のメタファーとする表現が鮮やかです。

### 🎤 注目すべきパンチライン
**「なんでもない日が 宝物じゃん」** — 特別な理由がなくても、自分が自分を「優勝」だと思えれば、その一日は最高に輝き出すという究極の肯定。`
  },
  {
    entryNo: "050",
    title: "生ぬるい苺",
    analysis: `### 🌐 テーマ分析
**「消化不全の記憶」と「境界線の崩落」**
贈り物である苺のように、甘美だが鮮度が落ちて「生ぬるく」なってしまった執着や関係性についての、官能的で残酷なメタファー。

### ⚙️ 歌詞の工夫点
「生ぬるい苺」と「生ぬるい一期（一期一会）」のダブルミーニング、さらには「裁定」「割いた」「咲いた」の同音異義語を畳み掛け、整理の付かない感情の混濁を表現しています。

### 🎤 注目すべきパンチライン
**「花 散らせ ち ち 血 散らせ」** — 終盤に向かって加速する狂気と美しさの混在。視覚的な「赤」が、苺から血へと変容していく衝撃的なクライマックス。`
  },
  {
    entryNo: "051",
    title: "Weekend",
    analysis: `### 🌐 テーマ分析
**「一時的な死（安息）」と「社会からの断絶」**
平日の役割から解放され、カーテンを締め切った部屋でただ呼吸するだけの、贅沢で罪深い「週末という聖域（Blue sanctuary）」への逃避。

### ⚙️ 歌詞の工夫点
「役割を 脱ぎ捨てた 肉体の 器」という、自己を一時的に空っぽの容れ物にする表現。「真っ青な 空白」という比喩が、静寂と憂鬱、そして無限の自由を同時に想起させます。

### 🎤 注目すべきパンチライン
**「月曜が 私を 見つける その前に」** — 社会が自分を再び定義しに来るまでの短い猶予。有限な安らぎを慈しむ切実さが胸を打ちます。`
  }
];

async function main() {
  console.log("Starting bulk injection into TrackHonban (47-51)...");
  
  for (const item of analyses) {
    const result = await prisma.trackHonban.updateMany({
      where: { entryNo: item.entryNo },
      data: { analysis: item.analysis }
    });
    
    if (result.count > 0) {
      console.log(`✅ No.${item.entryNo} [${item.title}] updated.`);
    } else {
      console.warn(`⚠️ No.${item.entryNo} [${item.title}] NOT found in TrackHonban.`);
    }
  }
  
  const trackCount = await prisma.track.count();
  const honbanCount = await prisma.trackHonban.count();
  console.log("\n--- Final Verification ---");
  console.log(`Track (Sample) count: ${trackCount} (Expect: 6)`);
  console.log(`TrackHonban (Production) count: ${honbanCount} (Expect: 51)`);
  console.log("Bulk injection completed.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
