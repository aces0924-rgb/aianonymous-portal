import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function getExternalVoters() {
  try {
    const [allVotes, allTracks] = await Promise.all([
      prisma.vote.findMany(),
      prisma.trackHonban.findMany()
    ]);

    const normalizeX = (id) => {
      if (!id) return "";
      return id.toLowerCase()
        .replace(/https?:\/\/(x|twitter)\.com\//, "")
        .replace(/[@＠]/g, "") // 全角＠と半角@を除去
        .split("/")[0]
        .trim();
    };

    // クリエイターのIDセットを作成
    const creatorIds = new Set(allTracks.map(t => normalizeX(t.xAccount)).filter(id => id !== ""));

    // 外部投票者の集計
    const externalVoters = {}; // { normalizedId: { originalNames: Set, count: 0 } }

    allVotes.forEach(vote => {
      const originalName = (vote.voterName || "Anonymous").trim();
      const normalized = normalizeX(originalName);

      if (normalized && !creatorIds.has(normalized)) {
        if (!externalVoters[normalized]) {
          externalVoters[normalized] = { originalNames: new Set(), count: 0 };
        }
        
        // 大文字小文字の違いのみの重複を避けるため、既存の表記と照合
        const currentNames = Array.from(externalVoters[normalized].originalNames);
        if (currentNames.length === 0) {
          externalVoters[normalized].originalNames.add(originalName);
        } else {
          // すでに登録されている名前がある場合、大文字が含まれる綺麗な表記を優先する
          const existing = currentNames[0];
          const hasUppercase = /[A-Z]/.test(originalName);
          const existingHasUppercase = /[A-Z]/.test(existing);
          if (hasUppercase && !existingHasUppercase) {
            externalVoters[normalized].originalNames.clear();
            externalVoters[normalized].originalNames.add(originalName);
          }
        }
        externalVoters[normalized].count += 1;
      }
    });

    console.log(`\n=========================================`);
    console.log(`👤 外部投票者一覧 (クリエイター以外)`);
    console.log(`=========================================`);
    
    const sortedVoters = Object.entries(externalVoters)
      .sort((a, b) => b[1].count - a[1].count); // 投票数順

    if (sortedVoters.length === 0) {
      console.log("外部投票者は見つかりませんでした。");
    } else {
      sortedVoters.forEach(([norm, data], i) => {
        const representativeName = Array.from(data.originalNames)[0] || norm;
        console.log(`${(i + 1).toString().padStart(3, ' ')}. ${representativeName.padEnd(20)} (${data.count}件の投票)`);
      });
      console.log(`\n合計: ${sortedVoters.length} 名の外部投票者がいます。`);
    }

    console.log("=========================================");

  } catch (error) {
    console.error("エラー:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

getExternalVoters();
