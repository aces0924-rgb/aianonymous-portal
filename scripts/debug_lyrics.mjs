import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: {
      entryNo: {
        in: ['097', '098', '099', '100', '101']
      }
    },
    orderBy: { entryNo: 'asc' }
  })
  
  for (const track of tracks) {
    console.log(`=========================================`)
    console.log(`ID: ${track.entryNo} | Title: ${track.title}`)
    console.log(`-----------------------------------------`)
    console.log(track.lyrics || '*** EMPTY ***')
    console.log(`=========================================\n`)
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())
