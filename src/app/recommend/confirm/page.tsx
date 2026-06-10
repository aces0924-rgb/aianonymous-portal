'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getTrackTitlesByIds, registerPlaylist } from '../actions';
import { usePlayer } from '@/context/PlayerContext';
import GlobalPlayer from '@/components/GlobalPlayer';

function ConfirmPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { playTrack } = usePlayer();

  const [userName, setUserName] = useState('');
  const [xAccountId, setXAccountId] = useState('');
  const [appeal, setAppeal] = useState('');
  const [trackIds, setTrackIds] = useState<number[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const name = searchParams.get('name');
    const x = searchParams.get('x');
    const app = searchParams.get('appeal');
    const idsStr = searchParams.get('tracks');

    if (!name || !idsStr) {
      router.push('/');
      return;
    }

    setUserName(name);
    setXAccountId(x || '');
    setAppeal(app || '');
    const ids = idsStr.split(',').map(id => parseInt(id, 10));
    setTrackIds(ids);

    const fetchTracks = async () => {
      try {
        const data = await getTrackTitlesByIds(ids);
        setTracks(data);
      } catch (err) {
        console.error(err);
        setError('楽曲データの取得に失敗しました。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();
  }, [searchParams, router]);

  const handleFinalConfirm = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // 引数の順番を修正: (userName, trackIds (string), xAccountId, appeal)
      const result = await registerPlaylist(userName, trackIds.join(','), xAccountId, appeal);
      if (result.success) {
        router.push(`/selection/${result.userName}`);
      } else {
        setError(result.error || '登録に失敗しました。');
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setError('通信エラーが発生しました。');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--color-cyan-400)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground font-sans overflow-x-hidden relative pb-48">
      {/* Fixed Preview Header */}
      <div className="fixed top-0 left-0 w-full z-50 bg-amber-500 text-black py-2 text-center font-black text-sm tracking-widest shadow-[0_4px_20px_rgba(245,158,11,0.4)]">
        PREVIEW MODE - 仮確定画面
      </div>

      <div className="pt-20 max-w-6xl mx-auto px-6 space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-6xl font-black italic tracking-tighter">
            <span className="text-[var(--color-cyan-400)] drop-shadow-[0_0_15px_var(--color-glow)]">{userName}</span> 様の推薦リスト
          </h1>
          <p className="text-gray-400 font-bold tracking-widest uppercase text-sm">Preview Your Selection</p>
        </div>

        {appeal && (
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-[var(--color-cyan-400)]/20 to-[var(--color-cyan-600)]/20 blur-xl rounded-[2rem]"></div>
            <div className="relative bg-surface/50 border border-surface-border p-10 rounded-[2.5rem] italic text-center">
              <p className="text-gray-200 text-lg md:text-xl font-medium leading-relaxed italic">
                <span className="text-[var(--color-cyan-400)]/50 mr-2 text-2xl">"</span>
                {appeal}
                <span className="text-[var(--color-cyan-400)]/50 ml-2 text-2xl">"</span>
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tracks.map((track, idx) => (
            <div key={track.id} className="group relative bg-surface border border-surface-border rounded-2xl p-5 transition-all hover:border-[var(--color-cyan-400)]/50 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <span className="w-10 h-10 rounded-xl bg-[var(--color-cyan-500)]/10 flex items-center justify-center text-[var(--color-cyan-400)] font-black text-xl shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] text-[var(--color-cyan-400)]/50 font-mono font-bold">No.{track.entryNo}</p>
                  <h3 className="text-lg font-bold text-foreground truncate">
                    {track.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => playTrack(track.id, track.title, track.songUrl, track.audioUrl)}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-cyan-500)]/10 border border-[var(--color-cyan-400)]/30 text-[var(--color-cyan-400)] hover:bg-[var(--color-cyan-500)] hover:text-black transition-all active:scale-90 shrink-0"
              >
                <svg className="w-6 h-6 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {error && (
          <div className="bg-red-500/10 border-2 border-red-500/50 p-6 rounded-2xl text-red-500 text-center font-black tracking-widest animate-bounce shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            {error}
          </div>
        )}
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-surface/80 backdrop-blur-2xl border-t-2 border-surface-border p-8 z-50">
        <div className="max-w-xl mx-auto flex gap-6">
          <button
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="flex-1 py-5 rounded-2xl border-2 border-surface-border text-gray-400 font-black hover:bg-surface hover:text-foreground transition-all active:scale-95 disabled:opacity-50"
          >
            修正する
          </button>
          <button
            onClick={handleFinalConfirm}
            disabled={isSubmitting}
            className="flex-[2] py-5 rounded-2xl bg-gradient-to-r from-[var(--color-cyan-400)] to-[var(--color-cyan-600)] text-foreground font-black text-xl shadow-[0_0_50px_var(--color-glow)] hover:scale-105 hover:from-[var(--color-cyan-400)] hover:to-[var(--color-cyan-600)] active:scale-95 transition-all disabled:opacity-50"
          >
            {isSubmitting ? '登録処理中...' : 'この内容で確定する'}
          </button>
        </div>
      </div>

      <GlobalPlayer />
    </main>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center text-foreground">Loading...</div>}>
      <ConfirmPageContent />
    </Suspense>
  );
}
