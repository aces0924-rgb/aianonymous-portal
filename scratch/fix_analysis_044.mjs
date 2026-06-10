import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const newAnalysis = `### 🌐 テーマ分析
**「視線による世界の切り取り」と「額縁という境界線」**
無限に広がる景色の中から、自分だけの「額縁（フレーム）」に収まる瞬間を探し求める、観察者の純粋な探求心を描いています。

### ⚙️ 歌詞の工夫点
「カメラを覗く」「ファインダー」といった具体的なモチーフを、人生や夢に対する「答えのない問い」の暗喩として昇華させています。歌詞中の「．．．．．」という表記が、シャッターを切る瞬間の静寂や、思考の余韻を効果的に演出しています。

### 🎤 注目すべきパンチライン
**「この額縁に合う風景は どこにあるのかな」** — 既存の枠組みに世界を当てはめるのか、それとも世界に合わせて自分を広げるのか。クリエイターが抱く普遍的な葛藤と憧憬を象徴しています。`;

async function main() {
  console.log("Updating analysis for No.044 (夢の額縁)...");
  
  const result = await prisma.trackHonban.updateMany({
    where: { entryNo: "044" },
    data: { analysis: newAnalysis }
  });
  
  if (result.count > 0) {
    console.log("✅ No.044 updated successfully.");
  } else {
    console.warn("⚠️ No.044 NOT found in TrackHonban.");
  }
  
  const trackCount = await prisma.track.count();
  console.log(`\nVerification: Track (Sample) count: ${trackCount} (Frozen at 6)`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
