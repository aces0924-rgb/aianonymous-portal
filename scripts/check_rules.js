const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const rules = await prisma.rule.findMany();
  console.log(rules);
}
main().finally(() => prisma.$disconnect());
