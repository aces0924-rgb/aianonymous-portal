'use server'

import prisma from '@/lib/prisma'

export type RankingItem = {
  no: number;
  title: string;
  artist: string;
  mainCount: number;
  subCount: number;
  totalCount: number;
  mainNet: number;
  subNet: number;
  totalNet: number;
  voteCount: number;
  thumbStatus: string;
  imageUrl?: string | null;
  _real_rank?: number;
}

export async function fetchRankingData(eventId: string, targetType: 'music' | 'illustration', excludeSelf: boolean) {
  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) throw new Error("Event not found");

  let trackFilter: any = { eventId };
  if (targetType === 'illustration') {
    trackFilter.title = 'イラスト作品';
  }

  const [mainPlaylists, subPlaylists, illPlaylists, votes] = await Promise.all([
    prisma.userPlaylist.findMany({ where: { eventId } }),
    prisma.userPlaylistSub.findMany({ where: { eventId } }),
    prisma.userIllustrationPlaylist.findMany({ where: { eventId } }),
    prisma.vote.findMany({ where: { eventId }, select: { targetContent: true } })
  ]);

  let tracks = await prisma.trackHonban.findMany({ 
    where: { ...trackFilter, published: true } 
  });

  if (tracks.length === 0) {
    tracks = await prisma.track.findMany({ where: trackFilter }) as any;
  }

  const thumbnails = await prisma.trackThumbnail.findMany({ 
    where: { eventId } 
  });

  const normalizeX = (id: string | null) => {
    if (!id) return null;
    return id.replace(/^@/, '').toLowerCase().trim();
  };

  const countMap: Record<string, { main: number, sub: number, mainNet: number, subNet: number }> = {};
  let totalMain = 0;
  let totalSub = 0;

  const trackInfoMap: Record<string, any> = {};
  tracks.forEach(t => {
    if (t.entryNo) {
      trackInfoMap[String(t.entryNo)] = t;
    }
  });

  const countPlaylists = (lists: any[], isMain: boolean) => {
    lists.forEach(pl => {
      let entryNos: string[] = [];
      if (pl.trackEntryNos) {
        entryNos = pl.trackEntryNos.split(',').map((s: string) => s.trim()).filter((s: string) => s);
      }
      const plX = normalizeX(pl.xAccountId);

      entryNos.forEach(noStr => {
        if (!countMap[noStr]) {
          countMap[noStr] = { main: 0, sub: 0, mainNet: 0, subNet: 0 };
        }
        
        let isSelf = false;
        const track = trackInfoMap[noStr];
        if (track) {
          const trackX = normalizeX(track.xAccount);
          if (plX && trackX && plX === trackX) {
            isSelf = true;
          }
        }

        if (isMain) {
          countMap[noStr].main += 1;
          totalMain++;
          if (!isSelf) countMap[noStr].mainNet += 1;
        } else {
          countMap[noStr].sub += 1;
          totalSub++;
          if (!isSelf) countMap[noStr].subNet += 1;
        }
      });
    });
  };

  if (targetType === 'illustration') {
    // イラストの場合は専用リストと通常リストの両方をマージしてカウントする
    countPlaylists(illPlaylists, true);
    countPlaylists(mainPlaylists, true);
    countPlaylists(subPlaylists, false);
  } else {
    // 音楽の場合は通常リストのみ
    countPlaylists(mainPlaylists, true);
    countPlaylists(subPlaylists, false);
  }

  const voteCountMap: Record<string, number> = {};
  votes.forEach(v => {
    const target = v.targetContent || "";
    const m = target.match(/^No\.(\d+)_/);
    if (m) {
      const entryNo = String(parseInt(m[1], 10));
      voteCountMap[entryNo] = (voteCountMap[entryNo] || 0) + 1;
    }
  });

  const thumbStatusMap: Record<string, string> = {};
  thumbnails.forEach(th => {
    if (th.entryNo) {
      thumbStatusMap[String(th.entryNo)] = th.status;
    }
  });

  const ranking: RankingItem[] = [];
  const unselected: RankingItem[] = [];

  Object.keys(countMap).forEach(entryNo => {
    const counts = countMap[entryNo];
    const info = trackInfoMap[entryNo] || {};
    
    let imageUrl = info.songUrl || null;
    if (imageUrl) {
        if (imageUrl.includes('drive.google.com/open?id=')) {
            imageUrl = imageUrl.replace('open?id=', 'uc?id=');
        } else if (imageUrl.includes('drive.google.com/file/d/')) {
            const fileId = imageUrl.split('/d/')[1]?.split('/')[0];
            if (fileId) imageUrl = `https://drive.google.com/uc?id=${fileId}`;
        }
    }

    ranking.push({
      no: parseInt(entryNo, 10) || 0,
      title: info.title || "不明",
      artist: info.artistName || "不明",
      mainCount: counts.main,
      subCount: counts.sub,
      totalCount: counts.main + counts.sub,
      mainNet: counts.mainNet,
      subNet: counts.subNet,
      totalNet: counts.mainNet + counts.subNet,
      voteCount: voteCountMap[entryNo] || 0,
      thumbStatus: thumbStatusMap[entryNo] === "APPROVED" ? "登録済" : "未登録",
      imageUrl: imageUrl
    });
  });

  tracks.forEach(t => {
    const entryNo = String(t.entryNo);
    if (!countMap[entryNo]) {
        let imageUrl = t.songUrl || null;
        if (imageUrl) {
            if (imageUrl.includes('drive.google.com/open?id=')) {
                imageUrl = imageUrl.replace('open?id=', 'uc?id=');
            } else if (imageUrl.includes('drive.google.com/file/d/')) {
                const fileId = imageUrl.split('/d/')[1]?.split('/')[0];
                if (fileId) imageUrl = `https://drive.google.com/uc?id=${fileId}`;
            }
        }
        unselected.push({
            no: parseInt(entryNo, 10) || 0,
            title: t.title || "不明",
            artist: t.artistName || "不明",
            mainCount: 0,
            subCount: 0,
            totalCount: 0,
            mainNet: 0,
            subNet: 0,
            totalNet: 0,
            voteCount: voteCountMap[entryNo] || 0,
            thumbStatus: thumbStatusMap[entryNo] === "APPROVED" ? "登録済" : "未登録",
            imageUrl: imageUrl
        });
    }
  });

  const sortedRanking = ranking.sort((a, b) => {
    const aTotal = excludeSelf ? a.totalNet : a.totalCount;
    const bTotal = excludeSelf ? b.totalNet : b.totalCount;
    if (bTotal !== aTotal) return bTotal - aTotal;
    const aMain = excludeSelf ? a.mainNet : a.mainCount;
    const bMain = excludeSelf ? b.mainNet : b.mainCount;
    return bMain - aMain;
  });

  const actualRanking: RankingItem[] = [];
  const additionalUnselected: RankingItem[] = [];
  
  let currentRank = 1;
  let previousScore: string | null = null;

  sortedRanking.forEach((item, i) => {
    const total_c = excludeSelf ? item.totalNet : item.totalCount;
    const main_c = excludeSelf ? item.mainNet : item.mainCount;

    if (total_c === 0) {
      additionalUnselected.push(item);
      return;
    }

    const currentScore = `${total_c}_${main_c}`;
    if (previousScore === null) {
      previousScore = currentScore;
    } else if (currentScore !== previousScore) {
      currentRank = i + 1;
      previousScore = currentScore;
    }
    
    item._real_rank = currentRank;
    actualRanking.push(item);
  });

  const finalUnselected = [...unselected, ...additionalUnselected].sort((a, b) => a.no - b.no);

  return {
    actualRanking,
    unselected: finalUnselected,
    totalMain,
    totalSub
  };
}
