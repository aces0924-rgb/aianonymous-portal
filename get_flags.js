const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const event = await prisma.event.findFirst({ where: { slug: 'aisummer2026' }});
  console.log(event.featureFlags);
}
main().finally(async () => { await prisma.$disconnect(); });
