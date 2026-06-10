import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const entryNo = "014";
  const analysis = `### 🌐 テーマ分析
**「淘汰の理と音の祈り」**
広大な宇宙や、悠久の時を繰り返す「円環（サイクル）」を背景に、微力ながらも自らの音を刻もうとする表現者の生と死、そして無限の可能性を追求する物語です。残酷な現実と美しい理想郷の間で揺れ動きながら、それでも己の音を探し続ける実存的な探求がテーマの核心です。

### ⚙️ 歌詞の工夫点
「進化も退化も 生き残った者の結果論」というドライな進化論的・科学的視点と、「七色の虹を渡る夢」という純粋な幻想的イメージが共存している点が非常にユニークです。「風が白い麦わら帽子を飛ばしたとき」といった日本的なノスタルジーを感じさせる具体的な情景描写が、抽象的な「淘汰の歴史」という概念に手触りを与え、楽曲の臨場感と切なさを高めています。

### 🎤 注目すべきパンチライン
**「限界のその先の現実を見てもなお 離せない音があるのなら」**
才能の有無や外部の評価、そして自然淘汰の摂理さえも超えた先にある、表現者の根源的な「存在理由」を問う一節です。極限状態に達してもなお手放すことのできない「音」があるならば、それこそがその人の「真実」であり「命そのもの」なのだと突きつける、重厚で慈愛に満ちたメッセージです。`;

  const updated = await prisma.trackHonban.update({
    where: { id: 7 },
    data: { analysis: analysis }
  });
  
  console.log(`Analysis injected successfully for No.${entryNo} [${updated.title}]`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
