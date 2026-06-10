import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.track.update({
    where: { timestamp: '2026/04/05 16:46:59' },
    data: { genre: 'ELECTRONIC / CYBERPUNK' }
  });
  console.log('Successfully updated genre for:', result.title);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
