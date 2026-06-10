import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.track.findMany({
    where: {
      entryNo: {
        in: ['89', '90', '91', '92', '93', '94', '95', '96']
      }
    },
    orderBy: {
      id: 'asc'
    }
  });

  if (tracks.length === 0) {
    console.log("No tracks found in 'track' table either.");
  } else {
    tracks.forEach(track => {
      console.log(`--- No.${track.entryNo} [${track.title}] ---`);
      console.log(`ID: ${track.id}`);
      console.log(`Timestamp: ${track.timestamp}`);
      console.log(`Lyrics:\n${track.lyrics}\n`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
