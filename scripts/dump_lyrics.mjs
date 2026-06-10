import { PrismaClient } from '@prisma/client'
import fs from 'fs'
const prisma = new PrismaClient()

async function main() {
  const tracks = await prisma.trackHonban.findMany({
    where: {
      entryNo: {
        gte: '102'
      }
    },
    orderBy: { entryNo: 'asc' }
  })
  
  let output = ''
  for (const track of tracks) {
    output += `=========================================\n`
    output += `ID: ${track.entryNo} | Title: ${track.title}\n`
    output += `-----------------------------------------\n`
    output += (track.lyrics || '*** EMPTY ***') + '\n'
    output += `=========================================\n\n`
  }
  fs.writeFileSync('lyrics_dump.txt', output, 'utf8')
}

main().catch(console.error).finally(() => prisma.$disconnect())
