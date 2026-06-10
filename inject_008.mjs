import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const entryNo = "008";
  const analysis = `### 🌐 テーマ分析
**「凡庸さという名の聖域」**
劇的な事件も、歌にできるような大きな痛みもない「何者でもない自分」の青春を、淡く、しかし確かな体温を持つ色彩（匿名の青）として描き出しています。他者の華やかな物語に埋もれ、主役になれなかった日々に宿る静かな真実味を肯定する、内省的で優しい物語がテーマの核心です。

### ⚙️ 歌詞の工夫点
「教師に嫌われることも 好かれることもなかった」「歌にならないからこそ 嘘も少なかったのかもしれない」といった、消去法的な自己分析によって浮かび上がる「空白のリアリティ」が秀逸です。何かが「あった」ことの証明ではなく、目立たない存在であったからこそ守られていた「純粋さ」に価値を見出す逆転の発想が、匿名フェスという舞台にふさわしい哲学を感じさせます。

### 🎤 注目すべきパンチライン
**「あの日々を僕は今 そっと抱えて歌っている」**
誰の記憶にも残らない、劇にならないほど平坦だった日々を、あえて「歌」へと昇華させる決意の一節。かつて何者でもないことを恐れていた少年が、その「何者でもなかった時間」を自分だけの愛しい財産として抱きしめる姿が、聴き手の孤独を静かに癒やしてくれます。`;

  const updated = await prisma.trackHonban.update({
    where: { id: 13 },
    data: { analysis: analysis }
  });
  
  console.log(`Analysis injected successfully for No.${entryNo} [${updated.title}]`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
