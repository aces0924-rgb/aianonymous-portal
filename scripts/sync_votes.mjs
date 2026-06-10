import { PrismaClient } from '@prisma/client';
import Papa from 'papaparse';

const prisma = new PrismaClient();

const CSV_URL = 'https://docs.google.com/spreadsheets/d/1bGk_VEXOiqSYWEfxteAiymZGqtqi-7EsY-H9f9LSI3w/export?format=csv&gid=1100675445';

async function syncVotes() {
  try {
    console.log('Fetching CSV data...');
    const response = await fetch(CSV_URL);
    const csvData = await response.text();

    const parsed = Papa.parse(csvData, {
      header: true,
      skipEmptyLines: true
    });

    console.log(`Found ${parsed.data.length} responses. Processing...`);

    // 全入れ替え（最新の状態に同期）
    await prisma.vote.deleteMany({});

    let totalVotes = 0;

    for (const row of parsed.data) {
      // 削除フラグのチェック
      if (row['削除'] === '×') {
        console.log(`Skipping deleted response: ${row['タイムスタンプ']} - ${row['X（旧Twitter）アカウント ID']}`);
        continue;
      }

      const timestamp = row['タイムスタンプ'];
      const voterName = row['X（旧Twitter）アカウント ID'] || 'Anonymous';
      const votesString = row['投票する楽曲を【3曲】選択してください'];

      if (votesString) {
        // カンマで分割してトリミング
        const votes = votesString.split(',').map(v => v.trim()).filter(v => v !== '');

        for (const voteContent of votes) {
          await prisma.vote.create({
            data: {
              responseId: `${timestamp}_${voterName}`,
              timestamp,
              voterName,
              targetContent: voteContent,
            }
          });
          totalVotes++;
        }
      }
    }

    console.log(`Successfully synced ${totalVotes} votes to the DB!`);

  } catch (error) {
    console.error('Error syncing votes:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncVotes();
