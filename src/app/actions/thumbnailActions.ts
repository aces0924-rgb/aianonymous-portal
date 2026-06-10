'use server';

import prisma from '@/lib/prisma';
import { uploadFileToDrive } from '@/lib/googleDrive';
import { revalidatePath } from 'next/cache';

const LOCK_TIMEOUT_MINUTES = 120;
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID!;

/**
 * データベースのSettingテーブルから最大投稿制限数を取得する（デフォルトは3）
 */
async function getMaxThumbnailLimit(): Promise<number> {
  try {
    const limitSetting = await prisma.setting.findUnique({
      where: { key: 'MAX_THUMBNAIL_LIMIT' }
    });
    if (limitSetting && limitSetting.value) {
      const parsed = parseInt(limitSetting.value, 10);
      if (!isNaN(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to fetch MAX_THUMBNAIL_LIMIT setting:', e);
  }
  return 3; // フォールバックデフォルト値
}

/**
 * 楽曲の投稿枠を予約（ロック）する
 */
export async function reserveThumbnailSlot(trackId: number, artistName: string, twitterIdInput: string) {
  try {
    const now = new Date();
    const lockThreshold = new Date(now.getTime() - LOCK_TIMEOUT_MINUTES * 60 * 1000);

    // Twitter IDの正規化（小文字化、トリム、@除去）
    const twitterId = twitterIdInput.toLowerCase().trim().replace(/^@/, '');
    
    if (!artistName || !twitterId) {
      return { success: false, error: '名前とX IDを先に入力してください。' };
    }

    // 同一ユーザーの他曲への投稿状況をチェック
    const existingSubmissions = await prisma.trackThumbnail.findMany({
      where: { twitterId: twitterId }
    });

    const maxLimit = await getMaxThumbnailLimit();

    const activeSubmissions = existingSubmissions.filter(
      sub => sub.status === 'APPROVED' || sub.status === 'PENDING'
    );

    if (maxLimit !== -1 && activeSubmissions.length >= maxLimit) {
      return { success: false, error: `すでに${maxLimit}曲分のサムネイルをご投稿いただいております。お一人様${maxLimit}曲までとなっております。アノフェスへのご参加ありがとうございます！` };
    }

    for (const sub of existingSubmissions) {
      // 他の楽曲を現在ロック中の場合、古いロックを削除して「乗り換え」を許可する
      if (sub.status === 'LOCK' && sub.trackId !== trackId && sub.lockedAt && sub.lockedAt > lockThreshold) {
        await prisma.trackThumbnail.delete({
          where: { id: sub.id }
        });
      }
    }

    // 楽曲情報を取得
    const track = await prisma.trackHonban.findUnique({
      where: { id: trackId },
      select: { title: true, entryNo: true }
    });
    const trackTitle = track?.title || 'Unknown';
    const entryNo = track?.entryNo || '---';

    // 既存のレコードを確認
    const existing = await prisma.trackThumbnail.findUnique({
      where: { trackId },
    });

    if (existing) {
      // すでに確定済みまたは承認待ちならエラー
      if (existing.status === 'APPROVED' || existing.status === 'PENDING') {
        return { success: false, error: 'この楽曲のサムネイルはすでに他の方によって登録済みか、承認待ちの状態です。' };
      }

      // ロック中かつ期限内の場合
      if (existing.status === 'LOCK' && existing.lockedAt && existing.lockedAt > lockThreshold) {
        // 自分のロック（名前とIDが一致）なら更新して通す
        if (existing.artistName === artistName && existing.twitterId === twitterId) {
          await prisma.trackThumbnail.update({
            where: { trackId },
            data: { 
              lockedAt: now,
              entryNo,     // 最新情報を保存
              trackTitle   // 最新情報を保存
            },
          });
          return { success: true };
        }
        
        // 他人のロック（名前またはIDが入力されている）ならブロック
        if (existing.artistName || existing.twitterId) {
          return { success: false, error: '現在、他のユーザーがこの楽曲の枠を確保して作業中です。予約者が作業を中断した場合、再度確保可能になります。' };
        }
      }

      // ロック期限切れ、または他人の古いロックなら上書き
      await prisma.trackThumbnail.update({
        where: { trackId },
        data: {
          status: 'LOCK',
          lockedAt: now,
          artistName,
          twitterId,
          entryNo,     // 保存
          trackTitle   // 保存
        },
      });
    } else {
      // 新規ロック作成
      await prisma.trackThumbnail.create({
        data: {
          trackId,
          status: 'LOCK',
          lockedAt: now,
          artistName,
          twitterId,
          entryNo,     // 保存
          trackTitle   // 保存
        },
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Reserve Error:', error);
    return { success: false, error: '通信エラーが発生しました。時間を置いて再度お試しください。' };
  }
}

/**
 * 投稿者の現在のステータスを確認する（UIでのリアルタイムチェック用）
 */
export async function checkArtistStatus(twitterIdInput: string) {
  const twitterId = twitterIdInput.toLowerCase().trim().replace(/^@/, '');
  if (!twitterId) return { canSubmit: true };

  // 該当ユーザーの全レコードを取得してJS側で判定
  const allSubmissions = await prisma.trackThumbnail.findMany({
    where: { twitterId: twitterId },
    include: { trackHonban: true }
  });

  const maxLimit = await getMaxThumbnailLimit();
  const activeSubmissions = allSubmissions.filter(s => s.status === 'PENDING' || s.status === 'APPROVED');

  if (maxLimit !== -1 && activeSubmissions.length >= maxLimit) {
    return { 
      canSubmit: false, 
      message: `すでに${maxLimit}曲分のサムネイルをご投稿いただいております。お一人様${maxLimit}曲までとなります。`,
      status: 'PENDING'
    };
  }

  return { canSubmit: true };
}

/**
 * 予約（枠の確保）をキャンセルする
 */
export async function cancelThumbnailReservation(twitterIdInput: string) {
  const twitterId = twitterIdInput.toLowerCase().trim().replace(/^@/, '');
  if (!twitterId) return;

  // そのユーザーの現在の LOCK 状態のレコードを削除
  await prisma.trackThumbnail.deleteMany({
    where: {
      twitterId: twitterId,
      status: 'LOCK'
    }
  });
}

/**
 * サムネイルを投稿する
 */
export async function submitThumbnail(formData: FormData) {
  try {
    const trackId = parseInt(formData.get('trackId') as string);
    const artistName = formData.get('artistName') as string;
    const twitterId = (formData.get('twitterId') as string).toLowerCase().trim().replace(/^@/, '');
    const isAnonymous = formData.get('isAnonymous') === 'true';
    const isXAnonymous = formData.get('isXAnonymous') === 'true';
    const file = formData.get('file') as File;

    if (!file || !trackId) return { success: false, error: '不足している項目があります。' };

    // 念のためロックを再確認
    const existing = await prisma.trackThumbnail.findUnique({
      where: { trackId },
    });
    if (!existing || existing.status !== 'LOCK') {
      return { success: false, error: 'セッションがタイムアウトしたか、他の予約が入りました。最初からやり直してください。' };
    }

    // ★重要: 現在のロックの所有者が自分かどうかを確認（別の人に奪われた枠を奪い返さないための防波堤）
    if (existing.twitterId !== twitterId) {
      return { success: false, error: '2時間以上経過したためロックが解除され、別の方がこの楽曲の枠を取得しました。最初からやり直してください。' };
    }

    const maxLimit = await getMaxThumbnailLimit();

    // 同一ユーザー（Twitter ID）の重複投稿チェック（動的上限）
    const alreadySubmittedCount = await prisma.trackThumbnail.count({
      where: {
        twitterId: twitterId,
        status: { in: ['APPROVED', 'PENDING'] }
      },
    });

    if (maxLimit !== -1 && alreadySubmittedCount >= maxLimit) {
      return { success: false, error: `すでに${maxLimit}曲分のサムネイルをご投稿いただいております。お一人様${maxLimit}曲までとなっております。` };
    }

    // ファイルをバッファに変換
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 曲情報を取得してファイル名に使用
    const track = await prisma.trackHonban.findUnique({
      where: { id: trackId },
      select: { title: true, entryNo: true }
    });
    const entryNo = track?.entryNo || String(trackId);
    const trackTitle = track?.title || 'Unknown';
    const extension = file.name.split('.').pop() || 'jpg';

    // Googleドライブにアップロード（形式: NoXXX_曲名.拡張子）
    const fileName = `No${entryNo}_${trackTitle}.${extension}`;
    const driveFileId = await uploadFileToDrive(buffer, fileName, DRIVE_FOLDER_ID, file.type);

    // DBを更新して確定
    await prisma.trackThumbnail.update({
      where: { trackId },
      data: {
        status: 'PENDING',
        artistName,
        twitterId,
        isAnonymous,
        isXAnonymous,
        driveFileId,
        lockedAt: null,
        entryNo,     // 投稿時にも確実に最新をセット
        trackTitle,  // 投稿時にも確実に最新をセット
      },
    });

    revalidatePath('/schedule');
    return { success: true };
  } catch (error: any) {
    console.error('Upload Error:', error);
    const errorDetail = error.message || String(error);
    return { success: false, error: `アップロード中にエラーが発生しました。詳細: ${errorDetail}` };
  }
}

/**
 * プレミア公開用のサムネイルをアップロードする（日付ごとに指定ファイル名で保存）
 */
export async function uploadPremiereThumbnail(day: number, formData: FormData) {
  try {
    const file = formData.get('file') as File;
    if (!file) return { success: false, error: 'ファイルが見つかりません。' };

    // 早い者勝ち判定: すでに登録済み（thumbnailDriveIdがある）かチェック
    const scheduleItem = await prisma.premiereSchedule.findUnique({
      where: { day }
    });

    if (!scheduleItem) {
      return { success: false, error: 'スケジュール日程が見つかりません。' };
    }

    if (scheduleItem.thumbnailDriveId) {
      return { success: false, error: 'この日程のプレミア公開サムネイルはすでに別の方によって登録済みです。（早い者勝ち）' };
    }

    // 締め切り判定: 放送開始3時間前を過ぎていないかチェック
    const now = new Date();
    const dateLimit = new Date(scheduleItem.date.getTime() - 3 * 60 * 60 * 1000);
    if (now >= dateLimit) {
      return { success: false, error: 'この日程のサムネイル応募は、放送開始3時間前を過ぎたため締め切られました。' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const extension = file.name.split('.').pop() || 'png';
    // ○○DAYS_プレミアサムネのフォーマット (dayが1桁の場合は2桁にゼロ埋め)
    const dayStr = String(day).padStart(2, '0');
    const fileName = `${dayStr}DAYS_プレミアサムネ.${extension}`;

    // Googleドライブにアップロード
    const driveFileId = await uploadFileToDrive(buffer, fileName, DRIVE_FOLDER_ID, file.type);

    // データベースの該当プレミアスケジュールにドライブIDを保存
    await prisma.premiereSchedule.update({
      where: { day },
      data: {
        thumbnailDriveId: driveFileId
      }
    });

    revalidatePath('/schedule');
    return { success: true, driveFileId };
  } catch (error: any) {
    console.error('Premiere Thumbnail Upload Error:', error);
    return { success: false, error: error.message || 'アップロード中にエラーが発生しました。' };
  }
}
