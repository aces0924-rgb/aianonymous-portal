const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const event = await prisma.event.findFirst();
  const theme = JSON.parse(event.themeConfig || '{}');
  console.log('mainColor in DB:', theme.mainColor);
}
main().finally(() => prisma.$disconnect());
