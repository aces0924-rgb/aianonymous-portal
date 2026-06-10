
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const t = await prisma.trackHonban.findFirst({
    where: { entryNo: '001' },
    select: { analysis: true }
  });
  if (t && t.analysis) {
    console.log("--- Current Format for No.001 ---");
    console.log(t.analysis);
    console.log("---------------------------------");
  } else {
    console.log("No.001 analysis not found.");
  }
  await prisma.$disconnect();
}
main();
