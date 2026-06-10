const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const event = await prisma.event.findFirst();
  console.log(event.themeConfig);
}
main().finally(() => prisma.$disconnect());
