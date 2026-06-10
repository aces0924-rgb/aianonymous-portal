const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const track = await prisma.trackHonban.findFirst({
    where: { entryNo: '109' }
  });
  if (track) {
    console.log("=== DB LYRICS ===");
    console.log(track.lyrics);
    console.log("=================");
  } else {
    console.log("Not found in DB");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
