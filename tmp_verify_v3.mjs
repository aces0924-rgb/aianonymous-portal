import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const track = await prisma.track.findFirst({ select: { genre: true, title: true } });
  console.log(`Track: ${track.title}, Genre: ${track.genre}`);
}
main().catch(console.error).finally(() => prisma.$disconnect());
