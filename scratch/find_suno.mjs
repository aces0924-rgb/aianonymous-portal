import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const tracks = await prisma.track.findMany({
    where: { OR: [ { songUrl: { contains: '/s/' } }, { audioUrl: { contains: '/s/' } } ] }
  });
  console.log("Suno short Links:");
  tracks.forEach(t => console.log(t.id, t.songUrl, t.audioUrl));
  await prisma.$disconnect();
}
main();
