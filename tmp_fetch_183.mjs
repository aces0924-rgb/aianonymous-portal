import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const track = await prisma.trackHonban.findFirst({
    where: { entryNo: '183' },
    select: {
      entryNo: true,
      title: true,
      lyrics: true
    }
  });
  
  console.log(JSON.stringify(track, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
