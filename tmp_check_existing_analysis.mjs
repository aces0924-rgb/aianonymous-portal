import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const track = await prisma.trackHonban.findFirst({
    where: { analysis: { not: null } },
    select: {
      entryNo: true,
      analysis: true,
      review: true
    }
  });
  console.log(JSON.stringify(track, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
