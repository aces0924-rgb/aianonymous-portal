import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    orderBy: {
      entryNo: 'asc'
    }
  });

  // Filter in JS because entryNo is a string and might have leading zeros or different formats
  const startNo = 128;
  const targetTracks = tracks.filter(t => {
    const no = parseInt(t.entryNo);
    return !isNaN(no) && no >= startNo;
  });

  console.log(`Found ${targetTracks.length} tracks starting from ${startNo}`);
  console.log(JSON.stringify(targetTracks, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
