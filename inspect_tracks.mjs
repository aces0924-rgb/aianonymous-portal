import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    take: 3,
    select: { entryNo: true, title: true, analysis: true }
  });

  console.log("=== FIRST 3 TRACKS ===");
  console.log(JSON.stringify(tracks, null, 2));

  // 全体の件数も確認
  const count = await prisma.trackHonban.count();
  console.log("Total Count:", count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
