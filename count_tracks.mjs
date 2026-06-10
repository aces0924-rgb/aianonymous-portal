import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.track.count();
  console.log(`CURRENT_TRACK_COUNT: ${count}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
