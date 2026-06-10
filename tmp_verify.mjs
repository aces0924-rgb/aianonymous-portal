import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const track = await prisma.track.findUnique({
    where: { timestamp: '2026/04/05 16:46:59' }
  });
  console.log(JSON.stringify(track, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
