import { PrismaClient } from '@prisma/client';
import fs from 'fs';
const prisma = new PrismaClient();

async function prepare() {
  // 1. 成功例の取得
  const pastTracks = await prisma.trackHonban.findMany({
    where: { entryNo: { in: ['073', '074', '075', '076', '077'] } },
    orderBy: { entryNo: 'asc' }
  });
  let pastOutput = "=== PAST SUCCESS SAMPLES ===\n";
  for (const t of pastTracks) {
    pastOutput += `\nNo.${t.entryNo}: ${t.title}\n${t.analysis}\n------------------\n`;
  }
  fs.writeFileSync('PAST_SAMPLES.txt', pastOutput, 'utf-8');

  // 2. 本物の歌詞（78-83）の再取得
  const targetTracks = await prisma.trackHonban.findMany({
    where: { entryNo: { in: ['078', '079', '080', '081', '082', '083'] } },
    orderBy: { entryNo: 'asc' }
  });
  let lyricsOutput = "=== TRUE LYRICS (78-83) ===\n";
  for (const t of targetTracks) {
    lyricsOutput += `\nNo.${t.entryNo}: ${t.title}\n${t.lyrics}\n==================\n`;
  }
  fs.writeFileSync('TARGET_LYRICS.txt', lyricsOutput, 'utf-8');
}

prepare().catch(console.error).finally(() => prisma.$disconnect());
