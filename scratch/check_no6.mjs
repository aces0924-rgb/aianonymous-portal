import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const track = await prisma.track.findFirst({ where: { entryNo: "6" } });
  if (track) {
    console.log(`Found No.${track.id} (${track.entryNo}): ${track.title}`);
    console.log(`Published: ${track.published}`);
  } else {
    console.log("No.6 not found in DB.");
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
