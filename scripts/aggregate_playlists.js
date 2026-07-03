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
  const args = process.argv.slice(2);
  const eventId = args[0] || null;
  const type = args[1] || 'music'; // 'music' or 'illustration'

  try {
    let eventFilter = {};
    if (eventId) {
      eventFilter = { eventId };
    }

    // 1. イベントのモードを確認してテーブルを決定する
    // デフォルトは UserPlaylist と UserPlaylistSub を見る
    let useIllustrationPlaylistTable = false;
    if (eventId && type === 'illustration') {
      const event = await prisma.event.findUnique({ where: { id: eventId } });
      if (event) {
        const featureFlags = JSON.parse(event.featureFlags || '{}');
        // アーティストモード（enableArtistMainがtrue）かつ illustration の場合は専用テーブルを見る
        // ただし、イベント自体が「イラスト専用モード（applicationFormType = illustration）」の場合は音楽と同じUserPlaylistに入るのでfalseのままにする
        if (featureFlags.enableArtistMain && featureFlags.applicationFormType !== 'illustration') {
          useIllustrationPlaylistTable = true;
        }
        // それ以外（イラスト専用モードなど）は、同じく UserPlaylist を見るので false のまま
      }
    }

    // イラスト集計の場合は、イラスト作品のみ（タイトルが'イラスト作品'）に絞る
    let trackFilter = { ...eventFilter };
    if (type === 'illustration') {
      trackFilter.title = 'イラスト作品';
    }

    let mainPlaylists = [];
    let subPlaylists = [];

    if (useIllustrationPlaylistTable) {
      // アーティストモードにおけるイラストリスト
      mainPlaylists = await prisma.userIllustrationPlaylist.findMany({ 
        where: eventFilter,
        select: { trackEntryNos: true, userName: true, xAccountId: true } 
      });
      // イラストの場合はサブリストはない仕様
    } else {
      // 音楽、またはイラスト専用モードでのリスト
      mainPlaylists = await prisma.userPlaylist.findMany({ 
        where: eventFilter,
        select: { trackEntryNos: true, userName: true, xAccountId: true } 
      });
      // サブリストも取得
      subPlaylists = await prisma.userPlaylistSub.findMany({ 
        where: eventFilter,
        select: { trackEntryNos: true, userName: true, xAccountId: true } 
      });
    }

    // 作品情報の取得 (TrackHonban)
    let tracks = await prisma.trackHonban.findMany({ 
      where: { ...trackFilter, published: true },
      select: { entryNo: true, title: true, artistName: true, xAccount: true, songUrl: true } 
    });

    // 開発中のテストなど、TrackHonbanが空の場合はTrackテーブル（応募データ）をフォールバックとして使用する
    if (tracks.length === 0) {
      tracks = await prisma.track.findMany({ 
        where: trackFilter,
        select: { entryNo: true, title: true, artistName: true, xAccount: true, songUrl: true } 
      });
    }

    // 投票・サムネ状況の取得
    const allVotes = await prisma.vote.findMany({ 
      where: eventFilter,
      select: { targetContent: true } 
    });
    
    const thumbnails = await prisma.trackThumbnail.findMany({ 
      where: eventFilter,
      select: { entryNo: true, status: true } 
    });

    const normalizeX = (id) => {
      if (!id) return "";
      return id.toLowerCase()
        .replace(/https?:\/\/(x|twitter)\.com\//, "")
        .replace(/[@＠]/g, "")
        .split("/")[0]
        .trim();
    };

    const trackInfoMap = {};
    tracks.forEach(t => {
      if (t.entryNo) {
        const normalizedX = t.xAccount ? normalizeX(t.xAccount) : "";
        trackInfoMap[t.entryNo] = { 
          title: t.title, 
          artist: t.artistName || "匿名",
          creatorId: normalizedX,
          imageUrl: t.songUrl
        };
      }
    });

    const countMap = {}; 

    const isSelfRecommend = (playlist, trackCreatorId) => {
      const plId = normalizeX(playlist.xAccountId || playlist.userName);
      return plId && trackCreatorId && plId === trackCreatorId;
    };

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

    const thumbStatusMap = {};
    thumbnails.forEach(th => {
      if (th.entryNo) thumbStatusMap[th.entryNo] = th.status;
    });

    const voteCountMap = {}; 
    allVotes.forEach(v => {
      const song = v.targetContent;
      const entryMatch = song && typeof song === 'string' ? song.match(/No\.(\d+)/) : null;
      const entryKey = entryMatch ? entryMatch[1] : null;
      if (!entryKey) return;

      if (!voteCountMap[entryKey]) voteCountMap[entryKey] = 0;
      voteCountMap[entryKey]++;
    });

    const ranking = Object.entries(countMap)
      .filter(([no]) => trackInfoMap[no]) 
      .map(([no, counts]) => {
        const info = trackInfoMap[no] || { title: "不明な作品", artist: "-" };
        return {
          no,
          mainCount: counts.main,
          subCount: counts.sub,
          mainNet: counts.mainNet,
          subNet: counts.subNet,
          totalCount: counts.main + counts.sub,
          totalNet: counts.mainNet + counts.subNet,
          voteCount: voteCountMap[no] || 0,
          thumbStatus: thumbStatusMap[no] || "未登録",
          title: info.title,
          artist: info.artist,
          imageUrl: info.imageUrl
        };
      })
      .sort((a, b) => b.totalCount - a.totalCount);

    const unselected = [];
    tracks.forEach(t => {
      if (t.entryNo && !countMap[t.entryNo]) {
        unselected.push({
          no: t.entryNo,
          title: t.title,
          artist: t.artistName || "匿名",
          voteCount: voteCountMap[t.entryNo] || 0,
          thumbStatus: thumbStatusMap[t.entryNo] || "未登録",
          imageUrl: t.songUrl
        });
      }
    });
    unselected.sort((a, b) => a.no.localeCompare(b.no));

    console.log(JSON.stringify({
      totalMain: mainPlaylists.length,
      totalSub: subPlaylists.length,
      ranking: ranking,
      unselected: unselected,
      debugTracksCount: tracks.length,
      debugTrackInfoKeys: Object.keys(trackInfoMap).length
    }));
  } catch (error) {
    console.log(JSON.stringify({ error: error.message }));
  } finally {
    await prisma.$disconnect();
  }
}

main();
