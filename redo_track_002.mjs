import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const entryNo = "002";
const title = "夕暮時";
const lyrics = `自転車　押しながら　なんども数える足音
空のグラデーションと夕日
時間差　待ちながら　なんどもおし寄せる波音
海のシチュエーションと風鈴

めくるめく日々の中で
あたたかくのぼせた　その腕
胸のすみっこのほうから　押しよせる

さよなら
さよなら
さよなら
ありがとう　さよなら

自転車　こぎながら　雨の降りそうなにおいだ

雲のグラデーションと天気
不思議ね　触れな　ながら　あのころのまま動かないよ
夜のシチュエーションと空気

めくるめく日々のなかで
ここちよく　湯冷めした　その指
胸의すみっこから　押し寄せる

さよなら
さよなら
さよなら
ありがとう　さよなら

ああ　なんどでも心を打つ　
あの言葉　触れさせて

さよなら
さよなら
さよなら
ありがとう　さよなら`;

const analysis = `### 🌐 テーマ分析
この楽曲の核心は、**「夕暮れ時の海岸線で交わされる、静かで切ない別れと感謝」**にあります。
自転車を押す足音、夕日のグラデーション、波音、風鈴といったノスタルジックな情景描写を背景に、「さよなら」という言葉を繰り返しながらも、その奥にある「ありがとう」という温かな想いが描かれています。

### ⚙️ 歌詞の工夫点
* **温度の対比による情景描写**: 前半の「あたたかくのぼせた その腕」と後半の「ここちよく 湯冷めした その指」という表現の対比が、時間の経過と心の整理がついていく過程、そして物理的な距離感の変化を鮮やかに象徴しています。
* **リフレインの重なり**: 繰り返される「さよなら」の後に置かれる「ありがとう さよなら」の一節が、悲しみだけではない、相手への敬意と自身の前向きな諦念を表現しています。

### 🎤 注目すべきパンチライン
> **「不思議ね　触れな　ながら　あのころのまま動かないよ / 夜のシチュエーションと空気」**

（解説）
時が経ち、環境（シチュエーション）が変わっても、心の中にある「あの瞬間」の記憶だけは、まるで止まったままのように鮮明に居続ける。思い出の不変的な価値を優しく肯定する、核心的なフレーズです。`;

async function redoTrack002() {
  console.log(`🚀 Overwriting No.${entryNo} with latest "夕暮時" data...`);

  try {
    const result = await prisma.trackHonban.updateMany({
      where: { entryNo: entryNo },
      data: {
        title: title,
        lyrics: lyrics,
        analysis: analysis
      }
    });
    
    if (result.count > 0) {
      console.log(`✅ Success: Fixed No.002 (Title, Lyrics, and Analysis updated).`);
    } else {
      console.warn(`⚠️  Warning: Track No.002 not found in TrackHonban.`);
    }
  } catch (err) {
    console.error(`❌ Error updating No.002:`, err);
  }

  console.log("\n✨ Redo process finished!");
}

redoTrack002()
  .finally(() => prisma.$disconnect());
