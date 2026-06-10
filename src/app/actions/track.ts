'use server';

import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';

/**
 * 楽曲番号（entryNo）からIDを検索し、詳細ページへリダイレクトする
 */
export async function jumpToTrackAction(formData: FormData) {
  const entryNoRaw = (formData.get('entryNo') as string || '').trim();
  const activeTable = formData.get('activeTable') as string || 'track';

  if (!entryNoRaw) return;

  // 複数のパターンを試行
  const patterns = [
    entryNoRaw,                   // そのまま (例: "1")
    entryNoRaw.padStart(3, '0'),  // 3桁ゼロ埋め (例: "001")
    parseInt(entryNoRaw, 10).toString() // 数値化して戻したもの (例: "01" -> "1")
  ];
  
  // 重複を削除
  const uniquePatterns = [...new Set(patterns)];

  console.log(`[Jump Action] Searching for patterns: ${JSON.stringify(uniquePatterns)} in table: "${activeTable}"`);

  // データベースから検索
  let track = null;
  for (const pattern of uniquePatterns) {
    track = activeTable === 'track_honban'
      ? await prisma.trackHonban.findFirst({ where: { entryNo: pattern }, select: { id: true } })
      : await prisma.track.findFirst({ where: { entryNo: pattern }, select: { id: true } });
    
    if (track) {
      console.log(`[Jump Action] Found track with pattern "${pattern}":`, track);
      break;
    }
  }

  if (track) {
    const isHonbanPreview = activeTable === 'track_honban';
    const query = isHonbanPreview ? '?preview=honban' : '';
    const destination = `/tracks/${track.id}${query}`;
    console.log(`[Jump Action] Redirecting to: ${destination}`);
    redirect(destination);
  } else {
    console.log(`[Jump Action] No track found for any pattern. Redirecting to home.`);
    redirect('/');
  }
}
