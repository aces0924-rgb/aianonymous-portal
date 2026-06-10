const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf8');
  envConfig.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim().replace(/^"|"$/g, '');
      process.env[key.trim()] = value;
    }
  });
}

const prisma = new PrismaClient();

async function main() {
  try {
    // プレイリスト、本投票、曲情報、サムネイル状況を並列取得
    const [mainPlaylists, subPlaylists, allVotes, tracks, thumbnails] = await Promise.all([
      prisma.userPlaylist.findMany({ select: { trackEntryNos: true, userName: true, xAccountId: true } }),
      prisma.userPlaylistSub.findMany({ select: { trackEntryNos: true, userName: true, xAccountId: true } }),
      prisma.vote.findMany({ select: { targetContent: true, voterName: true } }),
      prisma.trackHonban.findMany({ 
        where: { published: true },
        select: { entryNo: true, title: true, artistName: true, xAccount: true } 
      }),
      prisma.trackThumbnail.findMany({ select: { entryNo: true, status: true } })
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

    // 曲情報から制作者情報を引くマップ
    const trackInfoMap = {};
    tracks.forEach(t => {
      if (t.entryNo) {
        const normalizedX = t.xAccount ? normalizeX(t.xAccount) : "";
        trackInfoMap[t.entryNo] = { 
          title: t.title, 
          artist: t.artistName || "匿名",
          creatorId: normalizedX
        };
      }
    });

    const countMap = {}; // { no: { main: 0, sub: 0, mainNet: 0, subNet: 0 } }

    const isSelfRecommend = (playlist, trackCreatorId) => {
      const plId = normalizeX(playlist.xAccountId || playlist.userName);
      return plId && trackCreatorId && plId === trackCreatorId;
    };

    // メインの集計
    mainPlaylists.forEach(p => {
      if (!p.trackEntryNos) return;
      p.trackEntryNos.split(',').map(s => s.trim()).filter(Boolean).forEach(no => {
        if (!countMap[no]) countMap[no] = { main: 0, sub: 0, mainNet: 0, subNet: 0 };
        countMap[no].main++;
        if (!isSelfRecommend(p, trackInfoMap[no]?.creatorId)) {
          countMap[no].mainNet++;
        }
      });
    });

    // サブの集計
    subPlaylists.forEach(p => {
      if (!p.trackEntryNos) return;
      p.trackEntryNos.split(',').map(s => s.trim()).filter(Boolean).forEach(no => {
        if (!countMap[no]) countMap[no] = { main: 0, sub: 0, mainNet: 0, subNet: 0 };
        countMap[no].sub++;
        if (!isSelfRecommend(p, trackInfoMap[no]?.creatorId)) {
          countMap[no].subNet++;
        }
      });
    });

    // サムネイル状況マップ
    const thumbStatusMap = {};
    thumbnails.forEach(th => {
      if (th.entryNo) thumbStatusMap[th.entryNo] = th.status;
    });

    // 本投票（Vote）の集計 (自投票を除外した実質有効投票数を算出)
    const voteCountMap = {}; // { entryNo: 投票数 }
    allVotes.forEach(v => {
      const song = v.targetContent;
      const entryMatch = song.match(/No\.(\d+)/);
      const entryKey = entryMatch ? entryMatch[1] : null;
      if (!entryKey) return;

      // 自投票の判定
      let isSelf = false;
      const normalizedVoter = normalizeX(v.voterName);
      const creatorId = trackInfoMap[entryKey]?.creatorId;
      if (normalizedVoter && creatorId && normalizedVoter === creatorId) {
        isSelf = true;
      }
      
      // 自投票は除外して実際の票数として集計
      if (isSelf) return;

      if (!voteCountMap[entryKey]) voteCountMap[entryKey] = 0;
      voteCountMap[entryKey]++;
    });

    // ランキング作成（推しリスト合計順）
    const ranking = Object.entries(countMap)
      .filter(([no]) => trackInfoMap[no]) // 非公開(published: false)の楽曲を除外
      .map(([no, counts]) => {
        const info = trackInfoMap[no] || { title: "不明な楽曲", artist: "-" };
        return {
          no,
          mainCount: counts.main,
          subCount: counts.sub,
          mainNet: counts.mainNet,
          subNet: counts.subNet,
          totalCount: counts.main + counts.sub,
          totalNet: counts.mainNet + counts.subNet,
          voteCount: voteCountMap[no] || 0, // 本投票数を横にくっつける！
          thumbStatus: thumbStatusMap[no] || "未登録",
          title: info.title,
          artist: info.artist
        };
      })
      .sort((a, b) => b.totalCount - a.totalCount);

    // 未選曲（推しリスト0票）の抽出
    const unselected = [];
    tracks.forEach(t => {
      if (t.entryNo && !countMap[t.entryNo]) {
        unselected.push({
          no: t.entryNo,
          title: t.title,
          artist: t.artistName || "匿名",
          voteCount: voteCountMap[t.entryNo] || 0, // 推しリストは0票だが、本投票は入っているかもしれない！
          thumbStatus: thumbStatusMap[t.entryNo] || "未登録"
        });
      }
    });
    // 曲番号の昇順でソート
    unselected.sort((a, b) => a.no.localeCompare(b.no));

    console.log(JSON.stringify({
      totalMain: mainPlaylists.length,
      totalSub: subPlaylists.length,
      ranking: ranking,
      unselected: unselected
    }));
  } catch (error) {
    console.log(JSON.stringify({ error: error.message }));
  } finally {
    await prisma.$disconnect();
  }
}

main();
