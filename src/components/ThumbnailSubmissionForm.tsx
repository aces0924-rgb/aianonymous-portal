'use client';

import React, { useState, useEffect } from 'react';
import { reserveThumbnailSlot, submitThumbnail, checkArtistStatus, cancelThumbnailReservation } from '@/app/actions/thumbnailActions';

interface Track {
  id: number;
  title: string;
  entryNo: string | null;
}

interface Props {
  tracks: Track[];
  initialTrackId?: string;
  isPreview?: boolean;
  maxLimit?: number;
}

export default function ThumbnailSubmissionForm({ tracks, initialTrackId, isPreview, maxLimit = 3 }: Props) {
  const backUrl = isPreview ? '/tracks?preview=honban' : '/tracks';
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  const [artistName, setArtistName] = useState('');
  const [twitterId, setTwitterId] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isXAnonymous, setIsXAnonymous] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isReserving, setIsReserving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [hasTitleInImage, setHasTitleInImage] = useState(false);
  const [hasAgreedToSnsRule, setHasAgreedToSnsRule] = useState(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string | React.ReactNode } | null>(null);

  // 初回マウント時にアーティスト情報を復元
  useEffect(() => {
    const savedName = localStorage.getItem('artistName');
    const savedTwitterId = localStorage.getItem('twitterId');
    if (savedName) setArtistName(savedName);
    if (savedTwitterId) setTwitterId(savedTwitterId);
  }, []);

  // 入力が変わるたびにアーティスト情報を保存
  useEffect(() => {
    localStorage.setItem('artistName', artistName);
    localStorage.setItem('twitterId', twitterId);

    // 1. ブラウザを閉じる/リロードする際の警告
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isReserved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    // 2. スマホ・PC共通：ページを完全に閉じる/去る際の処理
    const handlePageHide = (event: PageTransitionEvent) => {
      // persisted が false の場合は、BFCache（一時保存）ではなく本当にページを去る時
      if (isReserved && twitterId && !event.persisted) {
        // keepalive: true を使うことで、ブラウザが閉じられても通信を完遂させる
        fetch('/api/thumbnail/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ twitterId }),
          keepalive: true
        }).catch(() => {});
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    // 3. ブラウザの「戻る」ボタンへの対策
    const handlePopState = (e: PopStateEvent) => {
      if (isReserved) {
        if (window.confirm('このまま戻ると楽曲の予約が解除されます。よろしいですか？')) {
          // OKの場合はそのまま戻らせ、ページが消えるタイミングで handlePageHide が走る
        } else {
          // キャンセルの場合、履歴を一つ戻して今の場所に留まる
          window.history.pushState(null, '', window.location.href);
        }
      }
    };

    if (isReserved) {
      window.history.pushState(null, '', window.location.href);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('popstate', handlePopState);
      
      if (isReserved && twitterId) {
        cancelThumbnailReservation(twitterId).catch(() => {});
      }
    };
  }, [isReserved, twitterId]);

  // URLからIDが渡された場合の初期選択
  useEffect(() => {
    if (initialTrackId && !selectedTrackId) {
      const id = parseInt(initialTrackId);
      if (!isNaN(id)) {
        setSelectedTrackId(id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTrackId]);

  // 楽曲選択時の処理
  const handleTrackSelect = (id: number) => {
    setSelectedTrackId(id);
    setIsReserved(false); // 楽曲を変えたら予約状態をリセット
    setMessage(null);
  };

  // 明示的な予約（ロック）実行
  const handleReserve = async () => {
    if (!selectedTrackId || !artistName || !twitterId) return;

    setIsReserving(true);
    setMessage(null);
    try {
      const result = await reserveThumbnailSlot(selectedTrackId, artistName, twitterId);
      
      if (result.success) {
        setIsReserved(true);
        setMessage({ type: 'success', text: '楽曲の投稿枠を確保しました。2時間以内にアップロードを完了させてください。' });
        
        // URLに楽曲IDを付与してリロード対策
        const url = new URL(window.location.href);
        url.searchParams.set('trackId', selectedTrackId.toString());
        window.history.pushState({}, '', url.toString());
      } else {
        setIsReserved(false);
        setMessage({ type: 'error', text: result.error || '予約に失敗しました。' });
      }
    } catch (error: any) {
      setIsReserved(false);
      setMessage({ type: 'error', text: '通信エラーが発生しました。' });
    } finally {
      setIsReserving(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('現在の予約をキャンセルして、楽曲を選び直しますか？')) return;

    try {
      setIsReserving(true);
      await cancelThumbnailReservation(twitterId);
      
      // 1曲固定になったので、解除した場合は即座に一覧へ戻る
      window.location.href = backUrl;

    } catch (error: any) {
      setMessage({ type: 'error', text: 'キャンセルの処理中にエラーが発生しました。' });
    } finally {
      setIsReserving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTrackId || !file || !artistName) return;

    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('trackId', selectedTrackId.toString());
    formData.append('artistName', artistName);
    formData.append('twitterId', twitterId);
    formData.append('isAnonymous', isAnonymous.toString());
    formData.append('isXAnonymous', isXAnonymous.toString());
    formData.append('file', file);

    try {
      const result = await submitThumbnail(formData);
      
      if (result.success) {
        setMessage({ type: 'success', text: '投稿が完了しました！まもなく完了画面に切り替わります...' });
        
        // 2秒後にリロードして、サーバー側の「登録完了」画面を表示させる
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.error || 'アップロードに失敗しました。' });
        setIsSubmitting(false);
      }
      
    } catch (error: any) {
      setMessage({ type: 'error', text: '通信エラーが発生しました。' });
      setIsSubmitting(false);
    }
  };

  // 現在のフェーズを判定
  const now = new Date();
  const phase1Start = new Date('2026-05-16T00:00:00');
  const phase2Start = new Date('2026-05-23T00:00:00');
  const phase2End = new Date('2026-05-31T00:00:00');

  const isPhase1 = now >= phase1Start && now < phase2Start;
  const isPhase2 = now >= phase2Start && now < phase2End;
  const isPreEvent = now < phase1Start;
  const isPostEvent = now >= phase2End;

  // trackId が全く特定できない場合の表示
  if (tracks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-12 bg-neutral-900/80 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-xl text-center space-y-8">
        <div className="text-6xl animate-bounce">🎵</div>
        <h2 className="text-2xl font-black text-foreground italic">No Track Selected</h2>
        <p className="text-neutral-500 leading-relaxed">
          投稿したい楽曲のページにある「投稿する」ボタンから進んでください。
        </p>
        <a href={backUrl} className="inline-block px-10 py-4 bg-white text-black font-black rounded-2xl hover:bg-[var(--color-cyan-500)] transition-all active:scale-95 shadow-[0_0_50px_rgba(255,255,255,0.1)]">
          楽曲一覧へ戻る
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 戻るボタン */}
      <a 
        href={backUrl} 
        className="inline-flex items-center gap-2 text-neutral-500 hover:text-foreground font-bold text-sm transition-colors group px-2"
      >
        <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
        <span>楽曲一覧に戻る</span>
      </a>

      <div className="p-8 bg-neutral-900/80 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-xl space-y-12">
        {/* Event Information Board */}
        <div className="bg-gradient-to-br from-[var(--color-cyan-400)]/10 via-background to-[var(--color-cyan-400)]/5 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
            <svg className="w-32 h-32 text-[var(--color-cyan-400)]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>
            </svg>
          </div>
          
          <div className="relative z-10">
            <h2 className="text-xl md:text-2xl font-black text-foreground mb-2 italic tracking-tighter">
              【早い者勝ち】アノフェス楽曲サムネイル・ジャック！
            </h2>
            <p className="text-[var(--color-cyan-400)] text-xs font-black tracking-widest uppercase mb-6 opacity-80">サムネイルジャック 応募要項</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Schedule */}
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="text-[11px] font-black text-[var(--color-cyan-400)] uppercase tracking-[0.3em]">Schedule</h4>
                  {isPreEvent && <span className="text-[9px] text-amber-500 font-black animate-pulse">● 開始前 / WAITING</span>}
                  {isPhase1 && <span className="text-[9px] text-green-400 font-black animate-pulse">● Phase 1 開催中</span>}
                  {isPhase2 && <span className="text-[9px] text-green-400 font-black animate-pulse">● Phase 2 開催中</span>}
                  {isPostEvent && <span className="text-[9px] text-red-500 font-black">● 受付終了 / CLOSED</span>}
                </div>
                
                <div className="space-y-4">
                  {/* Phase 1 Row */}
                  <div className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-500 ${
                    isPhase1 
                      ? 'bg-[var(--color-cyan-500)]/10 border-[var(--color-cyan-400)]/50 shadow-[0_0_20px_var(--color-glow)] scale-[1.02]' 
                      : 'bg-neutral-800/20 border-white/5 opacity-60'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold ${
                        isPhase1 ? 'bg-[var(--color-cyan-500)] text-black' : 'bg-neutral-800 text-neutral-400'
                      }`}>Phase 1</span>
                      <span className={`text-sm font-bold ${isPhase1 ? 'text-white' : 'text-neutral-400'}`}>
                        5/16 〜 5/22：楽曲参加者以外参加可能
                      </span>
                    </div>
                    {isPhase1 && (
                      <span className="text-[10px] font-black text-[var(--color-cyan-400)] animate-pulse tracking-tighter">ACTIVE</span>
                    )}
                  </div>

                  {/* Phase 2 Row */}
                  <div className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-500 ${
                    isPhase2 
                      ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)] scale-[1.02]' 
                      : 'bg-neutral-800/20 border-white/5 opacity-60'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold ${
                        isPhase2 ? 'bg-purple-500 text-white' : 'bg-neutral-800 text-neutral-400'
                      }`}>Phase 2</span>
                      <span className={`text-sm font-bold ${isPhase2 ? 'text-white' : 'text-neutral-400'}`}>
                        5/23 〜 5/30：全員参加可能
                      </span>
                    </div>
                    {isPhase2 && (
                      <span className="text-[10px] font-black text-purple-400 animate-pulse tracking-tighter">ACTIVE</span>
                    )}
                  </div>
                </div>
                
                <div className="pt-1">
                  <p className="text-[11px] text-amber-400 font-black flex items-start gap-3 bg-amber-500/5 p-3 rounded-xl border border-amber-500/20">
                    <span className="text-lg leading-none">⚠️</span>
                    <span>各楽曲、応募は「早い者勝ち」です。枠が埋まり次第終了となります。</span>
                  </p>
                </div>
              </div>

              {/* Right Column: Rules & Display */}
              <div className="space-y-5">
                <h4 className="text-[11px] font-black text-[var(--color-cyan-400)] uppercase tracking-[0.3em] border-b border-white/10 pb-2 flex items-center justify-between">
                  <span>Regulation</span>
                  <span className="text-[9px] opacity-60">参加ルール・掲載</span>
                </h4>
                <ul className="space-y-3 text-sm font-bold text-neutral-200 leading-relaxed">
                  <li className="flex gap-3">
                    <span className="text-[var(--color-cyan-400)]">●</span>
                    <span>
                      {maxLimit === -1 ? (
                        <>
                          応募は<span className="text-foreground font-black underline decoration-cyan-500 underline-offset-4">無制限（何曲でも可）</span>となります。
                          <span className="block text-[11px] text-neutral-400 font-medium mt-1 leading-normal">
                            ※制限なしで、お好きなだけ多くの楽曲にイラストをご投稿いただけます！
                          </span>
                        </>
                      ) : (
                        <>
                          応募は<span className="text-foreground font-black underline decoration-cyan-500 underline-offset-4">お一人様{maxLimit}曲まで</span>となります。
                          <span className="block text-[11px] text-neutral-400 font-medium mt-1 leading-normal">
                            ※より多くの楽曲に素敵なイラストがつくよう、制限を最大{maxLimit}曲までに拡張いたしました！
                          </span>
                        </>
                      )}
                    </span>
                  </li>
                  <li className="flex gap-3 text-amber-400">
                    <span className="text-amber-500 font-black">●</span>
                    <span>画像内には<span className="font-black underline decoration-amber-500 underline-offset-4">必ず楽曲タイトル名</span>を入れてください。</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--color-cyan-400)]">●</span>
                    <span>6/1より本サイトの楽曲ページに順次掲載されます。</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="text-[var(--color-cyan-400)]">●</span>
                    <span>6/6の結果発表生放送のエンディングにて3〜4秒ほど掲載されます。</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Footer Rules */}
            <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/10 px-5 py-4 rounded-xl border border-white/10 shadow-inner">
                <p className="text-xs md:text-sm text-foreground font-bold leading-relaxed flex items-center gap-3">
                  <span className="text-lg">🎨</span>
                  イラストに対する投票はありません。
                </p>
              </div>
              <div className="bg-white/10 px-5 py-4 rounded-xl border border-white/10 shadow-inner">
                <p className="text-xs md:text-sm text-foreground font-bold leading-relaxed flex items-center gap-3">
                  <span className="text-lg">📢</span>
                  SNS公開は6/6の結果発表後を推奨いたします。
                </p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-black mb-1 bg-gradient-to-r from-[var(--color-cyan-400)] to-[var(--color-cyan-600)] bg-clip-text text-transparent italic">
            サムネイル登録フォーム
          </h2>
          <p className="text-neutral-500 text-[10px] font-bold tracking-widest uppercase mb-8">Ready to Jack the Track</p>

      <form onSubmit={handleSubmit} className="space-y-12">
        {/* STEP 1: 絵師情報 */}
        <div className="space-y-6 bg-white/5 p-6 md:p-8 rounded-3xl border border-white/5">
          <h3 className="text-sm font-black text-[var(--color-cyan-400)] uppercase tracking-[0.2em] mb-4">STEP 1: あなたの情報を入力</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-widest">絵師名（表示名）</label>
              <input 
                type="text"
                required
                placeholder="お名前"
                className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-foreground focus:border-[var(--color-cyan-400)] outline-none transition-all"
                value={artistName}
                onChange={(e) => {
                  setArtistName(e.target.value);
                }}
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-neutral-500 mb-2 uppercase tracking-widest">X (Twitter) ID</label>
              <div className="relative">
                <span className="absolute left-4 top-3.5 text-neutral-500 font-bold">@</span>
                <input 
                  type="text"
                  required
                  placeholder="ID"
                  className="w-full bg-background/50 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-foreground focus:border-[var(--color-cyan-400)] outline-none transition-all"
                  value={twitterId}
                  onChange={(e) => {
                    setTwitterId(e.target.value);
                  }}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>
        </div>

        {/* STEP 2: 対象楽曲の確認 */}
        <div className={`space-y-6 transition-all ${(!artistName || !twitterId) ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
          <h3 className="text-sm font-black text-[var(--color-cyan-400)] uppercase tracking-[0.2em] mb-4">STEP 2: 対象楽曲の確認</h3>
          <div className="flex flex-col gap-4">
            {/* 楽曲情報の表示（固定） */}
            <div className="w-full bg-white/5 border-2 border-white/10 rounded-2xl px-6 py-6 flex items-center justify-between group">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-[var(--color-cyan-400)] uppercase tracking-[0.3em] mb-1">TARGET TRACK</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono font-black bg-[var(--color-cyan-500)] text-black px-3 py-1 rounded-lg shadow-[0_0_15px_var(--color-glow)]">
                    No.{tracks[0]?.entryNo || '---'}
                  </span>
                  <span className="text-xl md:text-3xl font-black text-foreground italic tracking-tighter">
                    {tracks[0]?.title}
                  </span>
                </div>
              </div>
              <div className="text-4xl opacity-10 group-hover:opacity-30 transition-opacity">🎵</div>
            </div>
            
            {!isReserved && (
              <div className="flex flex-col gap-4">
                {/* 予約失敗時のエラーメッセージ（ボタンのすぐ上） */}
                {message && message.type === 'error' && !isReserved && (
                  <div className="bg-red-500 text-white p-4 rounded-xl font-black text-sm animate-bounce shadow-lg border-2 border-red-400">
                    <span className="mr-2">❌</span> {message.text}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleReserve}
                  disabled={isReserving || !artistName || !twitterId}
                  className={`px-8 py-5 text-lg font-black rounded-2xl transition-all active:scale-95 shadow-xl ${
                    isReserving || !artistName || !twitterId
                      ? 'bg-neutral-800 text-neutral-500 border border-white/5 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-[var(--color-cyan-400)] to-[var(--color-cyan-600)] hover:from-[var(--color-cyan-400)] hover:to-[var(--color-cyan-600)] text-black shadow-[0_0_30px_var(--color-glow)]'
                  }`}
                >
                  {isReserving ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></span>
                      状況を確認中...
                    </span>
                  ) : !artistName || !twitterId ? (
                    '名前とIDを入力してください'
                  ) : (
                    'この楽曲の投稿枠を確保する'
                  )}
                </button>
              </div>
            )}
            {isReserved && (
              <div className="relative group overflow-hidden bg-green-500/10 border-2 border-green-500/50 p-6 rounded-3xl animate-in zoom-in duration-500">
                <div className="absolute top-0 right-0 p-2 text-4xl opacity-20">✅</div>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <p className="text-lg text-green-400 font-black flex items-center gap-3">
                      <span className="bg-green-400 text-black rounded-full w-6 h-6 flex items-center justify-center text-xs">✓</span>
                      楽曲「No.{tracks[0]?.entryNo} {tracks[0]?.title}」の確保に成功！
                    </p>
                    <p className="text-xs text-green-500/80 mt-2 font-bold ml-9">
                      この曲の投稿枠をロックしました。2時間以内に下のボタンからアップロードしてください。
                    </p>
                    <p className="text-[10px] text-red-400 font-black mt-2 ml-9 animate-pulse bg-red-500/10 p-2 rounded-lg inline-block border border-red-500/20">
                      ⚠️ ブラウザを閉じたり一覧に戻ると、この予約は解除されます。
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isReserving || isSubmitting}
                    className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl text-xs font-black transition-all active:scale-95 whitespace-nowrap"
                  >
                    {isReserving ? 'キャンセル中...' : '予約をキャンセルして選び直す'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* STEP 3: アップロード */}
        {isReserved && selectedTrackId && (
          <div className="space-y-10 animate-in fade-in slide-in-from-top-8 duration-700 pt-8 border-t border-white/10">
            <h3 className="text-sm font-black text-[var(--color-cyan-400)] uppercase tracking-[0.2em]">STEP 3: 公開設定とアップロード</h3>

            {/* 公開設定 */}
            <div className="space-y-6 bg-white/5 p-6 md:p-8 rounded-3xl border border-white/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox"
                      className="w-7 h-7 rounded-lg border-2 border-white/20 bg-background/50 checked:bg-[var(--color-cyan-500)] checked:border-[var(--color-cyan-400)] transition-all cursor-pointer appearance-none"
                      checked={!isAnonymous}
                      onChange={(e) => setIsAnonymous(!e.target.checked)}
                    />
                    {!isAnonymous && (
                      <svg className="absolute w-5 h-5 text-black pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-neutral-200 group-hover:text-foreground transition-colors">絵師名を公開する</span>
                    <span className="text-xs text-neutral-500 font-bold">※チェックを外すと「匿名」になります</span>
                  </div>
                </label>

                <label className="flex items-center gap-4 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox"
                      className="w-7 h-7 rounded-lg border-2 border-white/20 bg-background/50 checked:bg-[var(--color-cyan-500)] checked:border-[var(--color-cyan-400)] transition-all cursor-pointer appearance-none"
                      checked={!isXAnonymous}
                      onChange={(e) => setIsXAnonymous(!e.target.checked)}
                    />
                    {!isXAnonymous && (
                      <svg className="absolute w-5 h-5 text-black pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-black text-neutral-200 group-hover:text-foreground transition-colors">X IDを公開する</span>
                    <span className="text-xs text-neutral-500 font-bold">※チェックを外すと「匿名」になります</span>
                  </div>
                </label>
              </div>
            </div>

            {/* 画像アップロード */}
            <div className="space-y-4">
              <label className="block text-sm font-bold text-neutral-400 uppercase tracking-widest">
                サムネイル画像 (推奨 1280x720) 
                <span className="text-[var(--color-cyan-400)] ml-2">※アス比は16:9で投稿してください。</span>
              </label>
              <div className="relative border-2 border-dashed border-white/10 rounded-3xl p-12 hover:border-[var(--color-cyan-400)]/50 transition-all text-center bg-background/30 group/upload">
                <input 
                  type="file"
                  required
                  accept="image/jpeg,image/png"
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                  onChange={(e) => {
                    const inputElement = e.target;
                    const selectedFile = inputElement.files?.[0] || null;
                    
                    if (!selectedFile) {
                      setFile(null);
                      return;
                    }

                    if (selectedFile.size > 4 * 1024 * 1024) {
                      setMessage({ 
                        type: 'error', 
                        text: (
                          <div className="flex flex-col items-center gap-2">
                            <span>ファイルサイズが大きすぎます。4MB以内の画像を選択してください。</span>
                            <span className="text-xs font-normal">
                              ※スマホ等でリサイズが難しい場合は、<a href="https://www.iloveimg.com/ja/resize-image" target="_blank" rel="noopener noreferrer" className="text-[var(--color-cyan-400)] underline hover:text-[var(--color-cyan-400)] pointer-events-auto relative z-50">こちらの外部サイト</a>などを活用して縮小してください。
                            </span>
                          </div>
                        )
                      });
                      setFile(null);
                      inputElement.value = ''; // inputをクリア
                      return;
                    }

                    // 画像のアスペクト比チェック (16:9 = 約1.77)
                    // 1.5未満(正方形や縦長、4:3に近いもの等)をエラーとする
                    const img = new Image();
                    img.src = URL.createObjectURL(selectedFile);
                    
                    img.onload = () => {
                      const ratio = img.width / img.height;
                      URL.revokeObjectURL(img.src);
                      
                      if (ratio < 1.5) {
                        setMessage({ type: 'error', text: '画像が縦長または正方形に近いです。16:9の横長の画像を選択してください。' });
                        setFile(null);
                        inputElement.value = '';
                      } else {
                        setFile(selectedFile);
                        setMessage(null);
                      }
                    };

                    img.onerror = () => {
                      URL.revokeObjectURL(img.src);
                      setMessage({ type: 'error', text: '画像の読み込みに失敗しました。ファイルが破損していないか確認してください。' });
                      setFile(null);
                      inputElement.value = '';
                    };
                  }}
                />
                <div className="space-y-4">
                  <div className="text-5xl group-hover/upload:scale-110 transition-transform duration-300">🖼️</div>
                  <p className="text-lg font-black text-foreground">
                    {file ? file.name : '画像をドラッグ＆ドロップ'}
                  </p>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-tighter">JPEG / PNG (Max 4MB)</p>
                </div>
              </div>
            </div>

            {/* タイトル挿入・SNSルール確認チェックボックス */}
            <div className="bg-[var(--color-cyan-500)]/5 border border-[var(--color-cyan-400)]/20 p-6 rounded-2xl space-y-6">
              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-1 shrink-0">
                  <input 
                    type="checkbox"
                    className="w-6 h-6 rounded border-2 border-[var(--color-cyan-400)]/30 bg-background checked:bg-[var(--color-cyan-500)] transition-all cursor-pointer appearance-none"
                    checked={hasTitleInImage}
                    onChange={(e) => setHasTitleInImage(e.target.checked)}
                  />
                  {hasTitleInImage && (
                    <svg className="absolute w-4 h-4 text-black pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-foreground group-hover:text-[var(--color-cyan-400)] transition-colors italic">画像内に「楽曲タイトル」を入れましたか？</span>
                  <span className="text-xs text-neutral-500 font-bold">※本イベントの規定により、サムネイル画像内には必ず曲名を入れる必要があります。</span>
                </div>
              </label>

              <label className="flex items-start gap-4 cursor-pointer group pt-6 border-t border-[var(--color-cyan-400)]/10">
                <div className="relative flex items-center justify-center mt-1 shrink-0">
                  <input 
                    type="checkbox"
                    className="w-6 h-6 rounded border-2 border-[var(--color-cyan-400)]/30 bg-background checked:bg-[var(--color-cyan-500)] transition-all cursor-pointer appearance-none"
                    checked={hasAgreedToSnsRule}
                    onChange={(e) => setHasAgreedToSnsRule(e.target.checked)}
                  />
                  {hasAgreedToSnsRule && (
                    <svg className="absolute w-4 h-4 text-black pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-foreground group-hover:text-[var(--color-cyan-400)] transition-colors italic leading-snug">
                    6月6日の結果発表まで、担当した「楽曲」や「イラスト」のSNSへの投稿はお控えください。
                  </span>
                  <span className="text-xs text-neutral-400 font-bold mt-2 leading-relaxed">
                    ※「アノフェスに参加します！」という参加表明や、楽曲でなくイベント自体に対するファンアートの投稿などは大歓迎です！
                  </span>
                </div>
              </label>
            </div>

            {/* 送信ボタン */}
            <button 
              type="submit"
              disabled={isSubmitting || !file || !hasTitleInImage || !hasAgreedToSnsRule}
              className={`w-full py-6 rounded-2xl font-black text-2xl tracking-[0.3em] transition-all ${
                (isSubmitting || !file || !hasTitleInImage || !hasAgreedToSnsRule)
                  ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed grayscale' 
                  : 'bg-white text-black hover:bg-[var(--color-cyan-500)] active:scale-[0.98] shadow-[0_0_50px_var(--color-glow)]'
              }`}
            >
              {isSubmitting ? 'UPLOADING...' : 'CONFIRM & SUBMIT'}
            </button>
          </div>
        )}

        {/* メッセージ表示 */}
        {message && (
          <div className={`p-6 rounded-2xl text-center font-black text-base animate-in fade-in zoom-in duration-300 shadow-2xl ${
            message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}>
            {message.text}
          </div>
        )}
      </form>
        </div>
      </div>
    </div>
  );
}
