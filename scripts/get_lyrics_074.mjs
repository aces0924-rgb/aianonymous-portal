import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const track = await prisma.trackHonban.findFirst({
    where: { entryNo: '074' }
  });

  if (track) {
    console.log(`=== TRACK_START ===`);
    console.log(`NO: ${track.entryNo}`);
    console.log(`TITLE: ${track.title}`);
    console.log(`LYRICS: ${track.lyrics}`);
    console.log(`=== TRACK_END ===`);
  } else {
    console.log("Track not found.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
