import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.track.findMany({
    orderBy: { id: 'asc' }
  });
  console.log("Total tracks in DB:", tracks.length);
  tracks.forEach(track => {
    console.log(`ID: ${track.id}, EntryNo: [${track.entryNo}], Title: ${track.title}, Published: ${track.published}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
