import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const normalizeX = (id) => {
  if (!id) return "";
  return id.toLowerCase()
    .replace(/https?:\/\/(x|twitter)\.com\//, "")
    .replace(/[@＠]/g, "")
    .split("/")[0]
    .trim();
};

async function auditVotes() {
  try {
    const allVotes = await prisma.vote.findMany({
      orderBy: { timestamp: 'asc' }
    });

    console.log(`📋 総投票レコード数: ${allVotes.length} 件 (約 ${Math.ceil(allVotes.length / 3)} 人分の投票)\n`);

    // 1. 各アカウントごとの投票ターゲットとタイムスタンプを集計
    const voterMap = {};
    allVotes.forEach(v => {
      const rawName = v.voterName || "不明";
      const normalized = normalizeX(rawName);
      if (!normalized) return;

      if (!voterMap[normalized]) {
        voterMap[normalized] = {
          rawName,
          votes: []
        };
      }
      voterMap[normalized].votes.push({
        target: v.targetContent,
        timestamp: v.timestamp,
        responseId: v.responseId,
        createdAt: v.createdAt
      });
    });

    console.log("=== ⚠️ 異常判定①：ランダム文字列ID（サクラ・工作疑惑）の抽出 ===");
    const suspiciousPatterns = [
      /^[a-z0-9]{15}$/i,     // Xのデフォルト自動生成風ID (英数字15文字の羅列)
      /[0-9]{8,}/,            // 8桁以上の連続数字を含むID
      /^[a-z]+_[a-z0-9]+_[a-z0-9]+$/i, // bot生成にありがちなアンダースコア連結型
    ];

    const suspiciousVoters = [];

    Object.entries(voterMap).forEach(([id, data]) => {
      let isSuspicious = false;
      let reason = [];

      // パターンマッチ
      if (/^[a-z0-9]{15}$/i.test(id)) {
        isSuspicious = true;
        reason.push("IDが英数字15文字のランダム自動生成文字列に近い");
      }
      if (/[0-9]{8,}/.test(id)) {
        isSuspicious = true;
        reason.push("IDに8桁以上の連続数字が含まれる");
      }
      if (id.length >= 12 && /^[a-z0-9]+$/i.test(id) && (id.match(/[0-9]/g) || []).length >= 4 && (id.match(/[a-z]/g) || []).length >= 4) {
        // 英数字がごちゃ混ぜの長い文字列
        isSuspicious = true;
        reason.push("IDが意味を持たない英数字のランダムな羅列に見える");
      }

      if (isSuspicious) {
        suspiciousVoters.push({ id, rawName: data.rawName, reasons: reason, voteCount: data.votes.length, latest: data.votes[0]?.timestamp });
      }
    });

    suspiciousVoters.forEach(v => {
      console.log(`❌ 疑わしいアカウント: @${v.id} (登録名: ${v.rawName})`);
      console.log(`   └ 理由: ${v.reasons.join(', ')}`);
      console.log(`   └ 投票数: ${v.voteCount}票 (最新: ${v.latest})`);
    });

    console.log(`\n=== ⚠️ 異常判定②：同一グループ（同じ時間帯にまとめて送信された怪しい連続投票）===`);
    // タイムスタンプ（分単位・秒単位）でのソートを行い、30分以内の間に何人が投票しているか、異常に固まっている時間帯を検出
    const timeBuckets = {}; // { 'YYYY/MM/DD HH:MM': [] }
    allVotes.forEach(v => {
      if (!v.timestamp) return;
      // "2026/05/10 21:08:46" -> "2026/05/10 21:0" (10分単位のバケット)
      const minuteBucket = v.timestamp.substring(0, 15) + '0'; 
      if (!timeBuckets[minuteBucket]) timeBuckets[minuteBucket] = new Set();
      timeBuckets[minuteBucket].add(normalizeX(v.voterName));
    });

    Object.entries(timeBuckets)
      .map(([time, votersSet]) => ({ time, voters: Array.from(votersSet) }))
      .filter(bucket => bucket.voters.length >= 4) // 10分間に4人以上（普段のアクセス頻度からして異常なバースト）
      .forEach(bucket => {
        console.log(`⏰ 【集中投票バースト検出】 ${bucket.time}時台 (10分間) に ${bucket.voters.length} 名が連続投票しました：`);
        console.log(`   └ メンバー: ${bucket.voters.map(id => `@${id}`).join(', ')}`);
      });

  } catch (error) {
    console.error("エラー:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

auditVotes();
