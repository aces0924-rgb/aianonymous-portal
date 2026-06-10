
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log("🚀 Starting cleanup: Clearing 'review' field only...");

    // 1. 本番テーブルの更新
    const honbanResult = await prisma.trackHonban.updateMany({
      data: { review: null }
    });
    console.log(`✅ track_honban: ${honbanResult.count} records cleared.`);

    // 2. 開発テーブルの更新
    const trackResult = await prisma.track.updateMany({
      data: { review: null }
    });
    console.log(`✅ track: ${trackResult.count} records cleared.`);

    console.log("✨ All 'review' data cleared successfully. 'analysis' and 'lyrics' remain intact.");
  } catch (error) {
    console.error("❌ Error during cleanup:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
