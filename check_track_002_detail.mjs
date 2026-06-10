import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const track = await prisma.trackHonban.findFirst({
    where: { entryNo: '002' }
  });
  
  if (!track) {
    console.log("No track found for No.002");
    return;
  }

  console.log("--- [CURRENT DB STATE: No.002] ---");
  console.log(`ID: ${track.id}`);
  console.log(`Title: ${track.title}`);
  console.log(`Lyrics Preview: ${track.lyrics ? track.lyrics.substring(0, 100) + "..." : "NONE"}`);
  console.log(`Current Analysis:\n${track.analysis}`);
  console.log("----------------------------------");
}

main().catch(console.error).finally(() => prisma.$disconnect());
