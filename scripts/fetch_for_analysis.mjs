import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: {
      entryNo: {
        gte: '097'
      }
    },
    orderBy: { entryNo: 'asc' }
  })
  
  tracks.forEach(track => {
    console.log(`--- No.${track.entryNo} : ${track.title} ---`)
    console.log(track.lyrics)
    console.log('\n')
  })
}

main().catch(console.error).finally(() => prisma.$disconnect())
