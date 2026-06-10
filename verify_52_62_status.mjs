import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // JS does not have zfill, so use padStart:
  const targetNosFormatted = Array.from({ length: 11 }, (_, i) => (52 + i).toString().padStart(3, '0'));

  console.log(`Checking tracks: ${targetNosFormatted.join(', ')}`);

  const tracksHonban = await prisma.trackHonban.findMany({
    where: { entryNo: { in: targetNosFormatted } },
    select: { entryNo: true, title: true, analysis: true, published: true }
  });

  console.log("\n--- [RESULT] TrackHonban Table ---");
  if (tracksHonban.length === 0) {
    console.log("No records found in TrackHonban for No. 52-62.");
  } else {
    tracksHonban.sort((a, b) => a.entryNo.localeCompare(b.entryNo)).forEach(t => {
      console.log(`No.${t.entryNo}: ${t.title} | analysis=${t.analysis ? "YES" : "NO"} | published=${t.published}`);
    });
  }

  const tracksSample = await prisma.track.findMany({
    where: { entryNo: { in: targetNosFormatted } },
    select: { entryNo: true, title: true, analysis: true }
  });

  console.log("\n--- [RESULT] Track (Sample) Table ---");
  if (tracksSample.length === 0) {
    console.log("No records found in Track for No. 52-62.");
  } else {
    tracksSample.sort((a, b) => a.entryNo.localeCompare(b.entryNo)).forEach(t => {
      console.log(`No.${t.entryNo}: ${t.title} | analysis=${t.analysis ? "YES" : "NO"}`);
    });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
