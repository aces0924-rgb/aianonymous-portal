import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

async function main() {
  const tracks = await prisma.track.findMany();
  console.log(JSON.stringify(tracks, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
