import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding portal data...')

  const event = await prisma.event.upsert({
    where: { slug: 'anonymous-fes' },
    update: {},
    create: {
      slug: 'anonymous-fes',
      title: '第1回 AI-anonymous MUSIC FES',
      description: '完全制作者匿名の生成AI音楽祭',
      themeConfig: JSON.stringify({ primaryColor: '#00f0ff' }),
      featureFlags: JSON.stringify({ enableThumbnails: true, showRanking: true }),
      labelConfig: JSON.stringify({ lyricsTab: '歌詞考察' })
    }
  })

  console.log('Created event:', event)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
