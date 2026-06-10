'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { SUB_PLAYLIST_OFFSET } from '@/lib/id-utils'

export type RegistrationResult = 
  | { success: true; userName: string; trackIds: string; id: number; appeal?: string | null; showCelebration?: boolean }
  | { success: false; error: 'ALREADY_EXISTS'; existingUserName: string }
  | { success: false; error: string };

export async function registerPlaylist(eventSlug: string, userName: string, trackIds: string, xAccountId?: string, appeal?: string): Promise<RegistrationResult> {
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return { success: false, error: 'Event not found' };
  const trimmedName = userName.trim();
  const trimmedXId = xAccountId?.trim();

  if (!trimmedName) {
    return { success: false, error: 'ユーザー名を入力してください。' };
  }
  if (!trimmedXId) {
    return { success: false, error: 'XアカウントIDを入力してください。' };
  }

  try {
    const idArray = trackIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    
    // Fetch entryNos for these tracks to store for visibility
    const activeTableSetting = await (prisma as any).setting.findUnique({ where: { eventId_key: { eventId: event.id, key: 'ACTIVE_TRACK_TABLE' } } })
    const activeTable = activeTableSetting?.value || "track"
    
    const trackEntries = activeTable === "track_honban"
      ? await prisma.trackHonban.findMany({
          where: { id: { in: idArray } },
          select: { id: true, entryNo: true }
        })
      : await prisma.track.findMany({
          where: { id: { in: idArray } },
          select: { id: true, entryNo: true }
        });
    
    const entryNos = idArray.map(id => trackEntries.find(t => t.id === id)?.entryNo).filter(Boolean).join(',');

    // Check if name already exists
    const mainEntry = await prisma.userPlaylist.findUnique({
      where: { userName: trimmedName }
    });

    // サブテーブルでの登録レコードも取得（重複チェック用）
    const subEntries = await (prisma as any).userPlaylistSub.findMany({
      where: { userName: trimmedName },
      select: { trackIds: true }
    });

    const totalRegistrations = (mainEntry ? 1 : 0) + subEntries.length;

    if (totalRegistrations >= 3) {
      return { success: false, error: '1人3回までしか登録できません。' };
    }

    // 過去に選んだ楽曲IDをすべて収集
    const previousTrackIds = new Set<string>();
    if (mainEntry) {
      mainEntry.trackIds.split(',').forEach(id => previousTrackIds.add(id.trim()));
    }
    subEntries.forEach((entry: any) => {
      entry.trackIds.split(',').forEach((id: string) => previousTrackIds.add(id.trim()));
    });

    // 今回選ばれた曲と重複がないかチェック
    const currentTrackIdList = trackIds.split(',').map(id => id.trim());
    const duplicateIds = currentTrackIdList.filter(id => previousTrackIds.has(id)).map(id => parseInt(id));

    if (duplicateIds.length > 0) {
      // 重複している曲のentryNoを取得
      const duplicateTracks = activeTable === "track_honban"
        ? await prisma.trackHonban.findMany({
            where: { id: { in: duplicateIds } },
            select: { entryNo: true }
          })
        : await prisma.track.findMany({
            where: { id: { in: duplicateIds } },
            select: { entryNo: true }
          });
      
      const duplicateNos = duplicateTracks.map(t => t.entryNo).join(', ');
      return { success: false, error: `過去に選んだ楽曲（${duplicateNos}）が含まれています。楽曲を変更してください。` };
    }

    let newPlaylist;

    if (mainEntry) {
      // 既にメインにある場合はサブテーブルに保存
      newPlaylist = await (prisma as any).userPlaylistSub.create({
        data: {
          userName: trimmedName,
          xAccountId: xAccountId?.trim() || null,
          appeal: appeal?.trim() || null,
          trackIds: trackIds,
          trackEntryNos: entryNos
        }
      });
    } else {
      // 新規の場合はメインテーブルに保存
      newPlaylist = await prisma.userPlaylist.create({
        data: {
          userName: trimmedName,
          xAccountId: xAccountId?.trim() || null,
          appeal: appeal?.trim() || null,
          trackIds: trackIds,
          trackEntryNos: entryNos
        }
      });
    }

    revalidatePath('/recommend');
    
    // ID 8以降の場合のみオフセットを足す（1〜7はそのまま）
    const finalId = (mainEntry && newPlaylist.id >= 8) 
      ? newPlaylist.id + SUB_PLAYLIST_OFFSET 
      : newPlaylist.id;

    // --- Celebration Check ---
    let showCelebration = false;
    try {
      const allPlaylists = await prisma.userPlaylist.findMany({ where: { eventId: event.id }, select: { id: true, trackIds: true } });
      const allSubPlaylists = await (prisma as any).userPlaylistSub.findMany({ where: { eventId: event.id }, select: { id: true, trackIds: true } });
      
      const uniqueSelectedIds = new Set<number>();
      const pastUniqueSelectedIds = new Set<number>();
      
      const isSub = !!mainEntry;
      const currentCreatedId = newPlaylist.id;

      allPlaylists.forEach(p => {
        const ids = p.trackIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        ids.forEach(id => uniqueSelectedIds.add(id));
        if (isSub || p.id !== currentCreatedId) {
          ids.forEach(id => pastUniqueSelectedIds.add(id));
        }
      });

      allSubPlaylists.forEach((p: any) => {
        const ids = p.trackIds.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
        ids.forEach(id => uniqueSelectedIds.add(id));
        if (!isSub || p.id !== currentCreatedId) {
          ids.forEach(id => pastUniqueSelectedIds.add(id));
        }
      });

      const totalTracksCount = activeTable === "track_honban"
        ? await prisma.trackHonban.count({ where: { published: true } })
        : await prisma.track.count({ where: { published: true } });

      const unselectedCount = totalTracksCount - uniqueSelectedIds.size;

      const thresholdSetting = await (prisma as any).setting.findUnique({ where: { eventId_key: { eventId: event.id, key: 'CELEBRATION_THRESHOLD' } } });
      const threshold = thresholdSetting && !isNaN(parseInt(thresholdSetting.value, 10)) ? parseInt(thresholdSetting.value, 10) : 25;

      // 今回追加された楽曲の中で、過去に一度も選ばれていないものがあるか確認
      const newlyDiscovered = idArray.some(id => !pastUniqueSelectedIds.has(id));

      if (newlyDiscovered && unselectedCount < threshold) {
        showCelebration = true;
      }
    } catch (err) {
      console.error('Error checking celebration status:', err);
    }

    return { 
      success: true, 
      userName: newPlaylist.userName, 
      trackIds: newPlaylist.trackIds, 
      id: finalId,
      appeal: newPlaylist.appeal,
      showCelebration
    };
  } catch (error: any) {
    console.error('Failed to register playlist:', error);
    return { success: false, error: '登録中にエラーが発生しました。' };
  }
}

export async function getPlaylistByUserName(eventSlug: string, userName: string) {
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return null;
  return await prisma.userPlaylist.findUnique({
    where: { userName }
  });
}

export async function getTrackTitlesByIds(eventSlug: string, ids: number[]) {
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return [];
  const activeTableSetting = await (prisma as any).setting.findUnique({ where: { eventId_key: { eventId: event.id, key: 'ACTIVE_TRACK_TABLE' } } })
  const activeTable = activeTableSetting?.value || "track"

  const tracks = activeTable === "track_honban"
    ? await prisma.trackHonban.findMany({
        where: { id: { in: ids } },
        select: { id: true, title: true, songUrl: true, audioUrl: true, entryNo: true }
      })
    : await prisma.track.findMany({
        where: { id: { in: ids } },
        select: { id: true, title: true, songUrl: true, audioUrl: true, entryNo: true }
      });
  
  // Sort tracks to match the order of IDs passed
  const sortedTracks = ids.map(id => tracks.find((t: any) => t.id === id)).filter(Boolean);
  console.log('Fetched Tracks for Preview:', sortedTracks.map(t => ({ id: t.id, title: t.title, songUrl: t.songUrl })));
  return sortedTracks;
}

export async function getRegistrationCount(eventSlug: string, userName: string): Promise<number> {
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return 0;
  const trimmedName = userName.trim();
  if (!trimmedName) return 0;
  
  try {
    const mainEntry = await prisma.userPlaylist.findUnique({
      where: { userName: trimmedName }
    });
    const subEntriesCount = await (prisma as any).userPlaylistSub.count({
      where: { userName: trimmedName }
    });
    return (mainEntry ? 1 : 0) + subEntriesCount;
  } catch (error) {
    console.error('Failed to get registration count:', error);
    return 0;
  }
}

export async function getMaxIllustLimit(eventSlug: string): Promise<number> {
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return 3;
  try {
    const limitSetting = await prisma.setting.findUnique({ where: { eventId_key: { eventId: event.id, key: 'MAX_ILLUST_RECOMMEND_LIMIT' } } });
    if (limitSetting && limitSetting.value) {
      const parsed = parseInt(limitSetting.value, 10);
      if (!isNaN(parsed)) return parsed;
    }
  } catch (err) {
    console.error('Failed to get MAX_ILLUST_RECOMMEND_LIMIT:', err);
  }
  return 3; // default changed to 3 times
}

export async function getEnableIllustRecommend(eventSlug: string): Promise<boolean> {
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return false;
  try {
    const setting = await prisma.setting.findUnique({ where: { eventId_key: { eventId: event.id, key: 'ENABLE_ILLUST_RECOMMEND' } } });
    return setting?.value === 'true'; // default false
  } catch (err) {
    return false;
  }
}

export async function getIllustrationRegistrationCount(eventSlug: string, userName: string): Promise<number> {
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return 0;
  const trimmedName = userName.trim();
  if (!trimmedName) return 0;
  
  try {
    const entries = await prisma.userIllustrationPlaylist.findMany({
      where: { userName: trimmedName }
    });
    return entries.length;
  } catch (error) {
    console.error('Failed to get illustration registration count:', error);
    return 0;
  }
}

export async function registerIllustrationPlaylist(eventSlug: string, userName: string, trackIds: string, xAccountId?: string, appeal?: string): Promise<RegistrationResult> {
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return { success: false, error: 'Event not found' };
  const trimmedName = userName.trim();
  const trimmedXId = xAccountId?.trim();

  if (!trimmedName) {
    return { success: false, error: 'ユーザー名を入力してください。' };
  }
  if (!trimmedXId) {
    return { success: false, error: 'XアカウントIDを入力してください。' };
  }

  try {
    const idArray = trackIds.split(',').map(id => parseInt(id)).filter(id => !isNaN(id));
    
    // Check dynamic limit
    const maxLimit = await getMaxIllustLimit(eventSlug);
    const currentCount = await getIllustrationRegistrationCount(eventSlug, trimmedName);
    
    if (maxLimit !== -1 && currentCount >= maxLimit) {
      return { success: false, error: `推しイラストは合計${maxLimit}回まで登録可能です。現在${currentCount}回登録済みのため上限を超えています。` };
    }

    // Fetch entryNos
    const activeTableSetting = await prisma.setting.findUnique({ where: { eventId_key: { eventId: event.id, key: 'ACTIVE_TRACK_TABLE' } } });
    const activeTable = activeTableSetting?.value || "track";
    
    const trackEntries = activeTable === "track_honban"
      ? await prisma.trackHonban.findMany({
          where: { id: { in: idArray } },
          select: { id: true, entryNo: true }
        })
      : await prisma.track.findMany({
          where: { id: { in: idArray } },
          select: { id: true, entryNo: true }
        });
    
    const entryNos = idArray.map(id => trackEntries.find(t => t.id === id)?.entryNo).filter(Boolean).join(',');

    // Check for duplicates
    const previousEntries = await prisma.userIllustrationPlaylist.findMany({
      where: { userName: trimmedName }
    });

    const previousTrackIds = new Set<string>();
    previousEntries.forEach(entry => {
      entry.trackIds.split(',').forEach(id => previousTrackIds.add(id.trim()));
    });

    const currentTrackIdList = trackIds.split(',').map(id => id.trim());
    const duplicateIds = currentTrackIdList.filter(id => previousTrackIds.has(id)).map(id => parseInt(id));

    if (duplicateIds.length > 0) {
      const duplicateTracks = activeTable === "track_honban"
        ? await prisma.trackHonban.findMany({
            where: { id: { in: duplicateIds } },
            select: { entryNo: true }
          })
        : await prisma.track.findMany({
            where: { id: { in: duplicateIds } },
            select: { entryNo: true }
          });
      
      const duplicateNos = duplicateTracks.map(t => t.entryNo).join(', ');
      return { success: false, error: `過去に選んだ楽曲（${duplicateNos}）が含まれています。楽曲を変更してください。` };
    }

    const newPlaylist = await prisma.userIllustrationPlaylist.create({
      data: {
        userName: trimmedName,
        xAccountId: trimmedXId,
        appeal: appeal?.trim() || null,
        trackIds: trackIds,
        trackEntryNos: entryNos
      }
    });

    revalidatePath('/recommend');
    revalidatePath('/selections');
    revalidatePath('/selections/illustrations');

    return { 
      success: true, 
      userName: newPlaylist.userName, 
      trackIds: newPlaylist.trackIds, 
      id: newPlaylist.id,
      appeal: newPlaylist.appeal
    };
  } catch (error: any) {
    console.error('Failed to register illustration playlist:', error);
    return { success: false, error: '登録中にエラーが発生しました。' };
  }
}

export async function getAllPlaylistsByUserName(eventSlug: string, userName: string) {
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return [];
  try {
    const main = await prisma.userPlaylist.findMany({
      where: { userName },
      orderBy: { createdAt: 'asc' }
    });
    const sub = await (prisma as any).userPlaylistSub.findMany({
      where: { userName },
      orderBy: { createdAt: 'asc' }
    });
    // ID 8以降のみオフセットを適用（1〜7は救済措置としてそのまま）
    const subWithOffset = sub.map((p: any) => ({ 
      ...p, 
      id: p.id >= 8 ? p.id + SUB_PLAYLIST_OFFSET : p.id 
    }));
    // メインを先頭にして結合し、作成日時順に整理
    return [...main, ...subWithOffset].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  } catch (error) {
    console.error('Failed to fetch all playlists by user name:', error);
    return [];
  }
}

export async function getPlaylistById(id: number) {
  try {
    if (id >= SUB_PLAYLIST_OFFSET) {
      // 1,000,000以上なら、問答無用でサブテーブルを探す（新規登録分）
      return await (prisma as any).userPlaylistSub.findUnique({
        where: { id: id - SUB_PLAYLIST_OFFSET }
      });
    }

    // 1,000,000未満の場合：
    // 1. まず本家テーブルを探す
    const main = await prisma.userPlaylist.findUnique({
      where: { id }
    });
    if (main) return main;

    // 2. 本家になければ、サブテーブルを探す（既存のID 1〜7などの救済用）
    return await (prisma as any).userPlaylistSub.findUnique({
      where: { id }
    });
  } catch (error) {
    console.error('Failed to fetch playlist by ID:', error);
    return null;
  }
}

export async function getIllustrationPlaylistById(id: number) {
  try {
    return await prisma.userIllustrationPlaylist.findUnique({
      where: { id }
    });
  } catch (error) {
    console.error('Failed to get illustration playlist by id:', error);
    return null;
  }
}

export async function getAllIllustrationPlaylistsByUserName(eventSlug: string, userName: string) {
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return [];
  try {
    return await prisma.userIllustrationPlaylist.findMany({
      where: { userName },
      orderBy: { createdAt: 'asc' }
    });
  } catch (error) {
    console.error('Failed to fetch all illustration playlists by user name:', error);
    return [];
  }
}
