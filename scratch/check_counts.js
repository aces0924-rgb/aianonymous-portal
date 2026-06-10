const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const trackCount = await prisma.track.count();
  const honbanCount = await prisma.trackHonban.count();
  console.log('--- DATABASE STATUS ---');
  console.log(`Track (Sample) table count: ${trackCount}`);
  console.log(`TrackHonban (Production) table count: ${honbanCount}`);
  console.log('------------------------');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
