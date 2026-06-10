const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const events = await prisma.event.findMany();
  if (events.length === 0) {
    console.log("No events found");
    return;
  }
  
  // Assume the first event is the target one, or search for anofes
  const event = events[0];
  
  const defaultHtml = `
<h2>✨ フェスコンセプト</h2>
<p>本イベントは、全楽曲を<strong>「完全制作者匿名」</strong>で公開する、実験的なオンライン音楽フェスです。</p>
<p>投稿された楽曲と歌詞は、AIがその魂を読み解き、独自の世界観を反映した<strong>「多角的な考察レビュー」</strong>や、曲の世界に没入させる<strong>「字幕付き背景動画」</strong>を生成。名前というフィルターを外し、音楽そのものの輝きを届けます。</p>
<br>
<h2>✅ 応募資格・条件</h2>
<ul>
  <li><strong>[ORIGINAL]</strong> 音楽生成AIで出力した作品であること。</li>
  <li><strong>[EXCLUSIVE]</strong> 本フェスでの公開が初出となる未公開作品であること。</li>
  <li><strong>[RIGHTS]</strong> 第三者の権利を侵害していない、あなたが責任を持って公開できる作品であること。</li>
</ul>
<br>
<h2>📦 投稿に必要なもの</h2>
<ul>
  <li><strong>楽曲データ</strong>: 高音質なWAVまたはMP3フォーマットの音声ファイル。</li>
  <li><strong>歌詞データ</strong>: 楽曲のフルサイズ歌詞（テキスト形式）。ボーカル無しの場合でも世界観を示すテキストの添付を推奨します。</li>
  <li><strong>制作者コメント</strong>: 楽曲に込めた想いや、AI生成過程でのこだわりなど（※公開時は匿名となります）。</li>
</ul>
`;

  await prisma.event.update({
    where: { id: event.id },
    data: { description: defaultHtml.trim() }
  });
  
  console.log("Successfully updated description for event:", event.slug);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
