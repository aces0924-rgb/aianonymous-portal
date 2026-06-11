import React from 'react';
import prisma from '@/lib/prisma';
import ThumbnailSubmissionForm from '@/components/ThumbnailSubmissionForm';

export const dynamic = 'force-dynamic';

export default async function SubmitThumbnailPage({
  searchParams
}: {
  searchParams: Promise<{ trackId?: string; preview?: string }>
}) {
  const { trackId, preview } = await searchParams;
  const isPreview = preview === 'honban';

  const now = new Date();
  const lockThreshold = new Date(now.getTime() - 120 * 60 * 1000);

  // trackId がない場合は、案内を表示
  if (!trackId) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center justify-center space-y-6">
        <h1 className="text-2xl font-black italic">No Track Selected</h1>
        <p className="text-neutral-500">楽曲詳細ページから「投稿する」ボタンを押して進んでください。</p>
        <a href={isPreview ? "/tracks?preview=honban" : "/tracks"} className="px-6 py-3 bg-white text-black font-black rounded-xl hover:bg-[var(--color-cyan-500)] transition-all">
          楽曲一覧へ戻る
        </a>
      </div>
    );
  }

  // 指定された楽曲のみ取得
  const targetTrack = await prisma.trackHonban.findUnique({
    where: { id: parseInt(trackId) },
    select: { id: true, title: true, entryNo: true, eventId: true }
  });

  if (!targetTrack) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center justify-center space-y-6">
        <h1 className="text-2xl font-black italic">Track Not Found</h1>
        <p className="text-neutral-500">指定された楽曲が見つかりません。</p>
        <a href={isPreview ? "/tracks?preview=honban" : "/tracks"} className="px-6 py-3 bg-white text-black font-black rounded-xl hover:bg-[var(--color-cyan-500)] transition-all">
          楽曲一覧へ戻る
        </a>
      </div>
    );
  }

  // すでに登録済み（承認待ち・承認済み）かチェック
  const existingSubmission = await prisma.trackThumbnail.findFirst({
    where: { 
      trackId: targetTrack.id,
      status: { in: ['PENDING', 'APPROVED'] }
    }
  });

  if (existingSubmission) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-700">
        <div className="text-8xl mb-6 drop-shadow-[0_0_35px_rgba(34,197,94,0.6)] animate-bounce">✅</div>
        <h1 className="text-4xl md:text-6xl font-black italic text-[var(--color-cyan-400)] tracking-tighter drop-shadow-[0_0_20px_var(--color-glow)]">
          Registration Complete
        </h1>
        <div className="text-center space-y-4 max-w-3xl">
          <p className="text-2xl md:text-3xl text-foreground font-black leading-snug">
            楽曲「{targetTrack.title}」の登録は完了しています。
          </p>
          <p className="text-neutral-200 text-base md:text-xl font-bold leading-relaxed">
            ご投稿ありがとうございました！6月1日の公開までお待ちください。
          </p>
          <p className="text-amber-400 text-sm md:text-lg pt-4 leading-relaxed font-black border-t border-white/10 mt-4">
            ※画像の不備があった場合は運営より登録いただいたXアカウントへ連絡させていただく場合がございます。
          </p>
        </div>
        <div className="pt-6">
          <a href={isPreview ? "/tracks?preview=honban" : "/tracks"} className="px-12 py-5 text-lg md:text-xl bg-white text-black font-black rounded-2xl hover:bg-[var(--color-cyan-500)] transition-all active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.15)]">
            楽曲一覧へ戻る
          </a>
        </div>
      </div>
    );
  }

  // 制限数をDBから取得（動的化）
  const limitSetting = await prisma.setting.findUnique({
    where: { eventId_key: { eventId: targetTrack.eventId, key: 'MAX_THUMBNAIL_LIMIT' } }
  });
  const maxThumbnailLimit = limitSetting && !isNaN(parseInt(limitSetting.value, 10))
    ? parseInt(limitSetting.value, 10)
    : 3;

  const formattedTracks = [{
    id: targetTrack.id,
    title: targetTrack.title,
    entryNo: targetTrack.entryNo,
  }];

  return (
    <main className="min-h-screen bg-background pt-12 pb-20 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <ThumbnailSubmissionForm 
          tracks={formattedTracks} 
          initialTrackId={trackId} 
          isPreview={isPreview}
          maxLimit={maxThumbnailLimit}
        />
      </div>
    </main>
  );
}
