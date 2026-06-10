import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  console.log('🌱 Seeding creators choice data...');
  await prisma.award.createMany({
    data: [
      { category: 'CREATORS_CHOICE', rank: 1, title: 'ペンティメント', extraInfo: '95', isPublished: true, order: 1 },
      { category: 'CREATORS_CHOICE', rank: 2, title: 'Transit', extraInfo: '75', isPublished: true, order: 2 },
      { category: 'CREATORS_CHOICE', rank: 3, title: '君はエージーアイ', extraInfo: '60', isPublished: true, order: 3 }
    ]
  });
  console.log('✅ Seeded creators choice');
}

seed()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
