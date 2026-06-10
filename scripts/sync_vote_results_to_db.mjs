import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncVoteResults() {
  try {
    const excludeSelf = false; // 自投票も含めて集計する

    console.log("=== 投票集計マネージャーの同期を開始 ===");

    // 全投票データと本番用トラックデータを取得
    const [allVotes, allTracks] = await Promise.all([
      prisma.vote.findMany({ orderBy: { timestamp: 'asc' } }),
      prisma.trackHonban.findMany()
    ]);

    // X IDを正規化する関数
    const normalizeX = (id) => {
      if (!id) return "";
      return id.toLowerCase()
        .replace(/https?:\/\/(x|twitter)\.com\//, "")
        .replace(/[@＠]/g, "")
        .split("/")[0]
        .trim();
    };

    // 曲情報マップの作成 (EntryNo または Title で引けるようにする)
    const trackInfoMap = {};
    allTracks.forEach(t => {
      const normalizedId = normalizeX(t.xAccount);
      const info = { creatorId: normalizedId, track: t };
      if (t.entryNo) trackInfoMap[t.entryNo.trim()] = info;
      if (t.title) trackInfoMap[t.title.trim()] = info;
    });

    // 集計用オブジェクト
    const totals = {}; // key: trackId

    allTracks.forEach(t => {
      totals[t.id] = {
        trackId: t.id,
        entryNo: t.entryNo,
        xAccount: t.xAccount,
        artistName: t.artistName,
        title: t.title,
        totalVotes: 0,
        selfVotes: 0,
        rank: 211 // 0票の場合はデフォルトで211位
      };
    });

    // 投票データの集計
    allVotes.forEach(vote => {
      const song = vote.targetContent;
      
      const normalizedVoter = normalizeX(vote.voterName);
      const entryMatch = song.match(/No\.(\d+)/);
      const entryKey = entryMatch ? entryMatch[1] : null;
      
      const trackInfo = trackInfoMap[entryKey] || trackInfoMap[song];
      if (!trackInfo) return; // 該当する楽曲が見つからなければスキップ

      const tId = trackInfo.track.id;
      const creatorId = trackInfo.creatorId;

      let isSelf = false;
      if (normalizedVoter && creatorId && normalizedVoter === creatorId) {
        isSelf = true;
      }

      // 自身の投票
      if (isSelf) {
        totals[tId].selfVotes += 1;
        if (excludeSelf) return; // 除外設定なら有効票にはカウントしない
      }

      totals[tId].totalVotes += 1;
    });

    // ランキングの計算 (得票数の多い順にソート)
    const rankingArray = Object.values(totals)
      .sort((a, b) => b.totalVotes - a.totalVotes);

    let currentRank = 1;
    let previousScore = null;
    let tiedCount = 0;

    rankingArray.forEach((item, index) => {
      if (item.totalVotes === 0) {
        item.rank = 211; // 0票は強制的に211位
        return;
      }

      if (previousScore === null) {
        item.rank = currentRank;
        previousScore = item.totalVotes;
        tiedCount = 1;
      } else if (item.totalVotes === previousScore) {
        item.rank = currentRank;
        tiedCount += 1;
      } else {
        currentRank += tiedCount;
        item.rank = currentRank;
        previousScore = item.totalVotes;
        tiedCount = 1;
      }
    });

    // データベースへの保存・更新
    console.log("データベースへ結果を保存中...");
    
    // 一括処理のためのトランザクションを作成
    const upsertPromises = rankingArray.map(item => 
      prisma.voteResult.upsert({
        where: { trackId: item.trackId },
        update: {
          entryNo: item.entryNo,
          xAccount: item.xAccount,
          artistName: item.artistName,
          title: item.title,
          totalVotes: item.totalVotes,
          selfVotes: item.selfVotes,
          rank: item.rank
        },
        create: {
          trackId: item.trackId,
          entryNo: item.entryNo,
          xAccount: item.xAccount,
          artistName: item.artistName,
          title: item.title,
          totalVotes: item.totalVotes,
          selfVotes: item.selfVotes,
          rank: item.rank
        }
      })
    );

    await prisma.$transaction(upsertPromises);

    console.log(`✅ 計 ${rankingArray.length} 曲の集計結果をVoteResultテーブルに同期しました！`);
    
    // 確認用のログ出力
    const top5 = rankingArray.slice(0, 5);
    console.log("\n--- TOP 5 ---");
    top5.forEach(t => console.log(`${t.rank}位: ${t.totalVotes}票 [No.${t.entryNo}] ${t.title} (${t.artistName})`));
    
    const zeroVotes = rankingArray.filter(r => r.totalVotes === 0).length;
    console.log(`\n0票（211位）の楽曲: ${zeroVotes} 曲`);

  } catch (error) {
    console.error("エラー:", error);
  } finally {
    await prisma.$disconnect();
  }
}

syncVoteResults();
