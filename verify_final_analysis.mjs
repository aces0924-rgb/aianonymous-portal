import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const targetNos = ['002', '063', '064', '065', '066', '067', '068', '070', '071', '072'];
  
  console.log(`Verifying analysis for tracks: ${targetNos.join(', ')}`);

  const tracksHonban = await prisma.trackHonban.findMany({
    where: { entryNo: { in: targetNos } },
    select: { entryNo: true, title: true, analysis: true }
  });

  console.log("\n--- [VERIFICATION] TrackHonban Table ---");
  tracksHonban.sort((a, b) => a.entryNo.localeCompare(b.entryNo)).forEach(t => {
    console.log(`No.${t.entryNo}: ${t.title} | analysis=${t.analysis ? "YES" : "NO"}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
