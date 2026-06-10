import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

const normalizeX = (id) => {
  if (!id) return "";
  return id.toLowerCase()
    .replace(/https?:\/\/(x|twitter)\.com\//, "")
    .replace(/[@＠]/g, "")
    .split("/")[0]
    .trim();
};

async function main() {
  try {
    const allVotes = await prisma.vote.findMany({
      orderBy: { timestamp: 'desc' }
    });

    const voters = {};

    allVotes.forEach(v => {
      const raw = v.voterName || "";
      const normalized = normalizeX(raw);
      if (!normalized) return;

      if (!voters[normalized]) {
        voters[normalized] = {
          rawName: raw,
          count: 0,
          latestVote: v.timestamp,
          targets: []
        };
      }

      voters[normalized].count += 1;
      // 重複排除してターゲット曲名を追加
      const targetShort = v.targetContent.split(' ')[0] || v.targetContent; // "No.001" 等に短縮
      if (!voters[normalized].targets.includes(targetShort)) {
        voters[normalized].targets.push(targetShort);
      }
    });

    const sortedVoters = Object.entries(voters)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));

    let output = `| No | 投票者Xアカウント | 投票数 | 最新投票日時 | 投票ターゲット (一部) | Xプロフィールリンク | X内検索リンク |\n`;
    output += `| :--- | :--- | :---: | :--- | :--- | :--- | :--- |\n`;
    
    sortedVoters.forEach((v, index) => {
      const xUrl = `https://x.com/${v.id}`;
      const xSearchUrl = `https://x.com/search?q=from%3A${v.id}%20filter%3Anative_video%20OR%20filter%3Alinks%20OR%20exclude%3Aretweets`;
      const targetStr = v.targets.slice(0, 3).join(', ');
      output += `| ${index + 1} | \`@${v.id}\` | **${v.count}** | ${v.latestVote} | ${targetStr} | [プロフィールを開く](${xUrl}) | [最近の投稿を検索](${xSearchUrl}) |\n`;
    });

    output += `\n総投票者数: ${sortedVoters.length} 名\n`;

    fs.writeFileSync('voter_table.md', output, 'utf-8');
    console.log("voter_table.md has been successfully generated in UTF-8!");

  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
