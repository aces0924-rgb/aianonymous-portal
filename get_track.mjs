import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const entryNo = process.argv[2];
  if (!entryNo) {
    console.error("Please provide entryNo");
    process.exit(1);
  }
  const track = await prisma.trackHonban.findFirst({
    where: { entryNo: entryNo },
    select: { id: true, entryNo: true, title: true, lyrics: true }
  });
  console.log(JSON.stringify(track, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
