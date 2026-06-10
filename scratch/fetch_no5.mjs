import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const track = await prisma.track.findFirst({ where: { entryNo: "005" } });
  console.log(JSON.stringify(track, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
