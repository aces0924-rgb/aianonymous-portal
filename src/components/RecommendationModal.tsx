'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { registerPlaylist, getTrackTitlesByIds, getRegistrationCount, getIllustrationRegistrationCount, registerIllustrationPlaylist, getMaxIllustLimit, getEnableIllustRecommend } from '@/app/recommendActions';
import { encodeSelectionId } from '@/lib/id-utils';

interface RecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedIds: number[];
}

export default function RecommendationModal({ isOpen, onClose, selectedIds }: RecommendationModalProps) {
  const [recommendType, setRecommendType] = useState<'song' | 'illustration' | null>(null);
  const [userName, setUserName] = useState('');
  const [xAccountId, setXAccountId] = useState('');
  const [appeal, setAppeal] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [regCount, setRegCount] = useState<number | null>(null);
  const [illustRegCount, setIllustRegCount] = useState<number | null>(null);
  const [maxIllustLimit, setMaxIllustLimit] = useState<number>(3);
  const [isIllustEnabled, setIsIllustEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [trackTitles, setTrackTitles] = useState<{id: number, title: string}[]>([]);
  const [isLoadingTitles, setIsLoadingTitles] = useState(false);
  const router = useRouter();
  const params = useParams();
  const eventSlug = params?.eventSlug as string || '';

  // Load limits on mount
  useEffect(() => {
    if(eventSlug) getMaxIllustLimit(eventSlug).then(limit => setMaxIllustLimit(limit));
    if(eventSlug) getEnableIllustRecommend(eventSlug).then(enabled => setIsIllustEnabled(enabled));
  }, [eventSlug]);

  useEffect(() => {
    if (isOpen && selectedIds.length > 0) {
      const fetchTitles = async () => {
        setIsLoadingTitles(true);
        try {
          const titles = await getTrackTitlesByIds(eventSlug, selectedIds);
          setTrackTitles(titles as any);
        } catch (err) {
          console.error('Failed to fetch track titles:', err);
        } finally {
          setIsLoadingTitles(false);
        }
      };
      fetchTitles();
    }
  }, [isOpen, selectedIds, eventSlug]);

  // 名前入力時に登録件数を取得（デバウンス処理）
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (userName.trim()) {
        const count = await getRegistrationCount(eventSlug, userName);
        const illustCount = await getIllustrationRegistrationCount(eventSlug, userName);
        setRegCount(count);
        setIllustRegCount(illustCount);
      } else {
        setRegCount(null);
        setIllustRegCount(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [userName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !xAccountId.trim() || isSubmitting || !recommendType) return;

    if (recommendType === 'song' && regCount !== null && regCount >= 3) return;
    if (recommendType === 'illustration' && illustRegCount !== null && maxIllustLimit !== -1 && illustRegCount >= maxIllustLimit) return;

    const confirmMessage = recommendType === 'song'
      ? (regCount === 0 || regCount === null
          ? 'この内容で推しリストを登録します。よろしいですか？\n\n【重要】アワードの選出は楽曲の初回登録（1回目）のみが対象となります。\n※登録後の変更はできません。'
          : 'この内容で推しリストを登録します。よろしいですか？\n※登録後の変更はできません。')
      : 'この内容でイラストの推しリストを登録します。よろしいですか？\n※登録後の変更はできません。';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      let result;
      if (recommendType === 'song') {
        result = await registerPlaylist(eventSlug, userName.trim(), selectedIds.join(','), xAccountId.trim(), appeal.trim());
      } else {
        result = await registerIllustrationPlaylist(eventSlug, userName.trim(), selectedIds.join(','), xAccountId.trim(), appeal.trim());
      }
      
      if (result.success) {
        if ('showCelebration' in result && result.showCelebration) {
          alert('🎉 おめでとうございます！新しい曲が発掘されました🎊');
        }
        
        if (recommendType === 'song') {
          const encodedId = encodeSelectionId(result.id);
          router.push(`/${eventSlug}/selection/${encodedId}`);
        } else {
          // TODO: イラスト専用のビューページへ遷移させる。現時点では一覧へ。
          router.push(`/${eventSlug}/selections/illustrations`);
        }
        onClose();
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

  const remainingSongCount = regCount !== null ? Math.max(0, 3 - regCount) : 3;
  const remainingIllustCount = illustRegCount !== null ? (maxIllustLimit === -1 ? '無制限' : Math.max(0, maxIllustLimit - illustRegCount)) : maxIllustLimit;
  const canSubmitCurrentMode = recommendType === 'song' 
    ? (userName.trim() ? remainingSongCount > 0 : true)
    : recommendType === 'illustration'
      ? (userName.trim() ? (maxIllustLimit === -1 || (illustRegCount !== null && remainingIllustCount > 0)) : true)
      : false;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-md"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-surface border-2 border-[var(--color-cyan-400)]/50 rounded-[2.5rem] w-full max-w-md p-6 md:p-10 shadow-[0_0_50px_var(--color-glow)] overflow-y-auto max-h-[90vh] custom-scrollbar">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-cyan-500)]/10 blur-[50px] rounded-full"></div>
        
        <div className="relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-foreground tracking-tighter">推薦者名を登録</h2>
            <p className="text-foreground/60 text-sm font-light mt-2">
              以下の選択項目で「推しリスト」を作成します。
            </p>
            {recommendType === 'song' && (
              <span className="text-sm md:text-base inline-block mt-2 font-black text-white bg-red-600/20 py-2 px-3 rounded border border-red-500/30 animate-pulse">
                ※アワードの選出は楽曲の初回登録のみが対象となります。
              </span>
            )}
          </div>

          {/* Selected Tracks List */}
          <div className="bg-surface/50 border border-surface-border rounded-2xl p-4 max-h-48 overflow-y-auto custom-scrollbar">
            {isLoadingTitles ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-[var(--color-cyan-400)] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <ul className="space-y-2">
                {trackTitles.map((track, idx) => (
                  <li key={track.id} className="flex gap-3 text-sm">
                    <span className="text-[var(--color-cyan-400)] font-black">{idx + 1}.</span>
                    <span className="text-foreground font-bold truncate">{track.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {/* 推薦タイプのトグル (移動後) */}
              <div className="bg-surface/40 border border-surface-border rounded-2xl p-5 space-y-4 shadow-inner">
                {isIllustEnabled && (
                  <div className="text-center space-y-3">
                    <p className="text-xs font-black tracking-widest uppercase text-foreground/60">リストの種類を選択</p>
                    <div className="flex bg-surface rounded-full p-1 max-w-xs mx-auto border border-surface-border">
                      <button
                        type="button"
                        onClick={() => { setRecommendType('song'); setError(null); }}
                        className={`flex-1 py-2 rounded-full text-sm font-black transition-all ${recommendType === 'song' ? 'bg-[var(--color-cyan-500)] text-black shadow-[0_0_15px_var(--color-glow)]' : 'text-gray-500 hover:text-white'}`}
                      >
                        🎵 楽曲
                      </button>
                      <button
                        type="button"
                        onClick={() => { setRecommendType('illustration'); setError(null); }}
                        className={`flex-1 py-2 rounded-full text-sm font-black transition-all ${recommendType === 'illustration' ? 'bg-purple-500 text-black shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'text-gray-500 hover:text-white'}`}
                      >
                        🎨 イラスト
                      </button>
                    </div>
                  </div>
                )}

                <div className="text-red-400 font-bold leading-relaxed text-xs text-center px-2 min-h-[40px] flex items-center justify-center">
                  {recommendType === 'song' ? (
                    <span>
                      同じ名前での登録は3回までとなります。登録したリストは後から変更できません。<br />
                      <span className="text-[10px] opacity-80">※過去に選んだ楽曲を再度選ぶことはできません。</span>
                    </span>
                  ) : recommendType === 'illustration' ? (
                    <span>
                      同じ名前でのイラスト登録は{maxIllustLimit === -1 ? '無制限' : `${maxIllustLimit}回`}までとなります。登録したリストは後から変更できません。<br />
                      <span className="text-[10px] opacity-80">※過去に選んだイラストを再度選ぶことはできません。</span>
                    </span>
                  ) : (
                    <span className="text-foreground/60">
                      まずは登録するリストの種類を選んでください。
                    </span>
                  )}
                </div>
              </div>

              {/* Username Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-end px-2">
                  <label htmlFor="name" className={`text-xs font-black tracking-[0.3em] uppercase ${recommendType === 'song' ? 'text-[var(--color-cyan-400)]' : recommendType === 'illustration' ? 'text-purple-500' : 'text-gray-500'}`}>Username</label>
                  {userName.trim() && recommendType && (
                    <span className={`text-[10px] font-bold ${canSubmitCurrentMode ? 'text-foreground/60' : 'text-red-500'}`}>
                      {recommendType === 'song' ? (
                        <>残り登録可能数: <span className="text-sm ml-1">{remainingSongCount}</span> / 3</>
                      ) : (
                        <>残り登録可能曲数: <span className="text-sm ml-1">{remainingIllustCount}</span></>
                      )}
                    </span>
                  )}
                </div>
                <input
                  id="name"
                  type="text"
                  value={userName}
                  onChange={(e) => {
                    setUserName(e.target.value);
                    setError(null);
                  }}
                  disabled={isSubmitting || !recommendType}
                  placeholder={recommendType ? "あなたの名前を入力..." : "リストの種類を選択してください"}
                  autoFocus
                  className={`w-full bg-surface border-2 ${error || (userName.trim() && !canSubmitCurrentMode) ? 'border-red-500/50' : 'border-surface-border'} rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-${recommendType === 'song' ? 'cyan' : recommendType === 'illustration' ? 'purple' : 'gray'}-500 transition-all placeholder:text-gray-600 font-bold disabled:opacity-50 disabled:cursor-not-allowed`}
                  required
                />
                {userName.trim() && !canSubmitCurrentMode && recommendType && (
                  <p className="text-red-500 text-[10px] font-bold px-2 animate-pulse">
                    {recommendType === 'song' ? 'この名前での登録上限（3回）に達しています。' : 'イラストの登録上限を超えています。'}
                  </p>
                )}
              </div>

              {/* X Account ID Input */}
              <div className="space-y-2">
                <label htmlFor="x-id" className={`block text-xs font-black tracking-[0.3em] uppercase ml-2 ${recommendType === 'song' ? 'text-[var(--color-cyan-400)]' : recommendType === 'illustration' ? 'text-purple-500' : 'text-gray-500'}`}>X Account ID</label>
                <input
                  id="x-id"
                  type="text"
                  value={xAccountId}
                  onChange={(e) => {
                    setXAccountId(e.target.value);
                    setError(null);
                  }}
                  disabled={isSubmitting || !recommendType}
                  placeholder={recommendType ? "@zyonetsunko" : ""}
                  className={`w-full bg-surface border-2 border-surface-border rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-${recommendType === 'song' ? 'cyan' : recommendType === 'illustration' ? 'purple' : 'gray'}-500 transition-all placeholder:text-gray-600 font-bold disabled:opacity-50 disabled:cursor-not-allowed`}
                  required
                />
              </div>

              {/* Appeal Point Input */}
              <div className="space-y-2">
                <label htmlFor="appeal" className={`block text-xs font-black tracking-[0.3em] uppercase ml-2 ${recommendType === 'song' ? 'text-[var(--color-cyan-400)]' : recommendType === 'illustration' ? 'text-purple-500' : 'text-gray-500'}`}>Appeal Point (Optional)</label>
                <textarea
                  id="appeal"
                  value={appeal}
                  onChange={(e) => setAppeal(e.target.value)}
                  disabled={isSubmitting || !recommendType}
                  placeholder={recommendType === 'song' ? 'このリストの見どころや、楽曲への想いを入力してください...' : recommendType === 'illustration' ? '選んだイラストの好きなところや、おすすめポイントを入力してください...' : ''}
                  className={`w-full bg-surface border-2 border-surface-border rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-${recommendType === 'song' ? 'cyan' : recommendType === 'illustration' ? 'purple' : 'gray'}-500 transition-all placeholder:text-gray-600 font-bold min-h-[100px] resize-none disabled:opacity-50 disabled:cursor-not-allowed`}
                />
              </div>
              
              {error && <p className="text-red-400 text-xs font-black ml-2 animate-bounce">{error}</p>}
            </div>
            
            <div className="flex gap-4 pb-8 md:pb-0">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-4 rounded-2xl border-2 border-surface-border text-foreground/60 font-black hover:bg-surface transition-all disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !recommendType || (userName.trim() !== '' && !canSubmitCurrentMode)}
                className={`flex-[2] py-4 rounded-2xl ${recommendType === 'song' ? 'bg-[var(--color-cyan-500)] hover:bg-[var(--color-cyan-500)] shadow-[0_0_20px_var(--color-glow)]' : recommendType === 'illustration' ? 'bg-purple-600 hover:bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]' : 'bg-gray-600'} text-white font-black transition-all active:scale-95 disabled:opacity-50 disabled:bg-gray-800 disabled:shadow-none`}
              >
                {isSubmitting ? '登録中...' : 'リストを生成する'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
