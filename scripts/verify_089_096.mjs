import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: { entryNo: { gte: '089' } },
    orderBy: { entryNo: 'asc' }
  });

  tracks.forEach(t => {
    console.log(`NO: ${t.entryNo} TITLE: ${t.title}`);
    console.log(`LENGTH: ${t.analysis.length}`);
    console.log(`CONTENT_PREVIEW: ${t.analysis.substring(0, 100)}...`);
    console.log('---');
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
