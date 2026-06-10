import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const nos = ['002', '007'];
  for (const no of nos) {
    const track = await prisma.trackHonban.findUnique({
      where: { entryNo: no }
    });
    if (track) {
      console.log(`=== No.${no} [${track.title}] ===`);
      console.log(`LYRICS:\n${track.lyrics}\n`);
      console.log(`ANALYSIS:\n${track.analysis}\n`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
