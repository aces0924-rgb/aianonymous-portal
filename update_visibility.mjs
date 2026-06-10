import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // First, set all to private
  await prisma.premiereSchedule.updateMany({
    data: { isPublic: false }
  });

  // Set Day 0 and Day 16 to public
  await prisma.premiereSchedule.updateMany({
    where: {
      day: { in: [0, 16] }
    },
    data: { isPublic: true }
  });

  console.log('Visibility settings updated:');
  console.log('- Day 0 & Day 16: Public');
  console.log('- All other days: Hidden');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
