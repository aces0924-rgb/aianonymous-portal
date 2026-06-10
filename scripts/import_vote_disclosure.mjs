import { PrismaClient } from '@prisma/client';
import Papa from 'papaparse';

const prisma = new PrismaClient();

const CSV_URL = 'https://docs.google.com/spreadsheets/d/1wOWAe7xIgKN6_OzBRgfbmWUDuv8cOQf0BqSL-r1TGss/export?format=csv&gid=39738524';

async function main() {
  console.log('Fetching CSV from Google Spreadsheet...');
  const res = await fetch(CSV_URL);
  if (!res.ok) {
    throw new Error(`Failed to fetch CSV: ${res.status} ${res.statusText}`);
  }
  const csvData = await res.text();

  console.log('Parsing CSV data...');
  const parsed = Papa.parse(csvData, {
    header: true,
    skipEmptyLines: true,
  });

  const records = parsed.data;
  console.log(`Found ${records.length} records.`);

  console.log('Clearing existing VoteDisclosure records...');
  await prisma.voteDisclosure.deleteMany({});

  console.log('Inserting new records...');
  let count = 0;
  for (const row of records) {
    const timestamp = row['タイムスタンプ']?.trim();
    const email = row['メールアドレス']?.trim();
    const xAccount = row['■ X（旧Twitter）アカウント名']?.trim();
    
    // entryNoの0埋め（3桁）
    const rawEntryNo = row['■ 自身の楽曲No. ※必須']?.trim();
    let entryNo = null;
    if (rawEntryNo) {
      const parsedNo = parseInt(rawEntryNo, 10);
      if (!isNaN(parsedNo)) {
        entryNo = String(parsedNo).padStart(3, '0');
      } else {
        entryNo = rawEntryNo; // 数値化できない場合はそのまま
      }
    }

    const wantsDisclosureStr = row['■ 投票結果の個別開示を希望しますか？']?.trim() || '';
    const wantsDisclosure = wantsDisclosureStr.includes('希望する（OK）');
    
    const password = row['■ 個別開示用の登録パスワード（10文字・半角英数字） ※必須']?.trim();

    // 必須データがない行はスキップ
    if (!entryNo) {
        continue;
    }

    await prisma.voteDisclosure.create({
      data: {
        timestamp: timestamp || null,
        email: email || null,
        xAccount: xAccount || null,
        entryNo: entryNo,
        wantsDisclosure: wantsDisclosure,
        password: password || null,
      }
    });
    count++;
  }

  console.log(`Successfully synced ${count} VoteDisclosure records.`);
}

main()
  .catch(e => {
    console.error('Error during sync:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
