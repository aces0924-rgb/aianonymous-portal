import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function exportLyrics() {
  const exportDir = 'G:\\マイドライブ\\AI-anonymousFES\\動画作成\\歌詞'
  
  if (!fs.existsSync(exportDir)) {
    fs.mkdirSync(exportDir)
  }

  try {
    const tracks = await prisma.trackHonban.findMany({
      where: {
        entryNo: {
          gte: '102'
        }
      },
      orderBy: { entryNo: 'asc' }
    })

    console.log(`Found ${tracks.length} tracks. Starting export...`)

    for (const track of tracks) {
      const entryNo = track.entryNo || track.id.toString().padStart(3, '0')
      // ファイル名に使えない記号を置換
      const safeTitle = track.title.replace(/[\\/:*?"<>|]/g, '_')
      const fileName = `${entryNo}_${safeTitle}.txt`
      const filePath = path.join(exportDir, fileName)
      
      const content = track.lyrics || '(歌詞なし)'
      
      fs.writeFileSync(filePath, content, 'utf8')
      console.log(`Exported: ${fileName}`)
    }

    console.log(`\nSuccess! All lyrics exported to: ${exportDir}`)
  } catch (error) {
    console.error('Export failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

exportLyrics()
