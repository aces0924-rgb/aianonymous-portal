import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const track = await prisma.trackHonban.findFirst({
    where: { entryNo: "001" },
    select: {
      analysis: true,
      review: true
    }
  });
  if (track) {
    console.log("ANALYSIS START");
    console.log(track.analysis);
    console.log("ANALYSIS END");
    console.log("REVIEW START");
    console.log(track.review);
    console.log("REVIEW END");
  } else {
    console.log("No track found for 001");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
