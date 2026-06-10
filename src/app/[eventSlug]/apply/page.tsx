'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import TrackDetailView from '@/components/TrackDetailView';
import { submitApplication, getApplyConfig } from '@/app/actions/apply';

export default function ApplyPage({ params }: { params: { eventSlug: string } }) {
  const { eventSlug } = params;
  const [step, setStep] = useState<'input' | 'preview' | 'success'>('input');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [config, setConfig] = useState({ lyricsTab: '歌詞', analysisTab: '歌詞考察' });

  useEffect(() => {
    getApplyConfig(eventSlug).then(res => {
      if (res) setConfig(res);
    });
  }, [eventSlug]);

  const [formData, setFormData] = useState({
    title: '',
    songUrl: '',
    lyrics: '',
    analysis: '',
    artistName: '',
    xAccount: '',
    email: '',
    genre: '',
    publishConsent: false,
    agreedToTerms: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePreview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setErrorMsg('曲名は必須です。');
      return;
    }
    if (!formData.songUrl.trim()) {
      setErrorMsg('楽曲URLは必須です。');
      return;
    }
    const isYouTube = formData.songUrl.match(/(?:youtu\.be\/|youtube\.com\/)/);
    const isNico = formData.songUrl.match(/(?:nicovideo\.jp\/|nico\.ms\/)/);
    if (!isYouTube && !isNico) {
      setErrorMsg('楽曲URLはYouTubeまたはニコニコ動画のURLのみ有効です。');
      return;
    }
    if (!formData.artistName.trim()) {
      setErrorMsg('アーティスト名は必須です。');
      return;
    }
    if (!formData.agreedToTerms) {
      setErrorMsg('応募規約への同意は必須です。');
      return;
    }
    setErrorMsg('');
    setStep('preview');
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg('');
    
    try {
      const result = await submitApplication(eventSlug, formData);
      if (result.success) {
        setStep('success');
        window.scrollTo(0, 0);
      } else {
        setErrorMsg(result.error || 'エラーが発生しました。');
      }
    } catch (e: any) {
      setErrorMsg(e.message || '通信エラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'success') {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-surface/80 backdrop-blur-xl border border-surface-border rounded-3xl p-8 md:p-12 text-center shadow-2xl">
          <div className="w-24 h-24 bg-gradient-to-br from-[var(--color-cyan-400)] to-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_30px_var(--color-glow)]">
            <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-6 tracking-tighter text-foreground">応募が完了しました！</h1>
          <p className="text-foreground/70 mb-10 text-lg">
            素晴らしい楽曲のご応募ありがとうございます。<br/>
            運営にて内容を確認の上、公開作業を進めさせていただきます。
          </p>
          <Link href={`/${eventSlug}`} className="inline-block px-10 py-4 bg-surface-border hover:bg-surface-border/80 text-foreground font-black rounded-full transition-all hover:scale-105 active:scale-95">
            トップページへ戻る
          </Link>
        </div>
      </main>
    );
  }

  if (step === 'preview') {
    const previewTrack = {
      id: 9999,
      eventId: 'preview',
      timestamp: new Date().toISOString(),
      entryNo: 'PRE',
      title: formData.title,
      songUrl: formData.songUrl,
      audioUrl: formData.songUrl,
      lyrics: formData.lyrics,
      artistName: formData.artistName,
      xAccount: formData.xAccount,
      genre: formData.genre,
      analysis: formData.analysis || '※プレビューモードではこの内容が表示されます。',
      review: '',
      published: true
    };

    return (
      <div className="min-h-screen bg-background relative pb-24">
        {/* Preview Banner */}
        <div className="fixed top-0 left-0 w-full z-[100] bg-purple-600 text-white py-2 text-center text-sm font-black tracking-widest shadow-lg">
          プレビューモード（実際の画面ではこのように表示されます）
        </div>
        
        <div className="pt-10 pointer-events-none">
          <TrackDetailView 
            track={previewTrack}
            eventSlug={eventSlug}
            audioSource={formData.songUrl}
            isPreviewMode={true}
          />
        </div>

        {/* Action Bar */}
        <div className="fixed bottom-0 left-0 w-full z-[100] bg-surface/90 backdrop-blur-xl border-t border-surface-border p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-foreground/80 text-sm font-bold text-center sm:text-left">
              内容に問題がなければ「この内容で応募する」を押してください。
              {errorMsg && <p className="text-red-400 mt-1">{errorMsg}</p>}
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button 
                onClick={() => setStep('input')}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-6 py-3 md:py-4 rounded-full bg-surface-border hover:bg-surface-border/80 text-foreground font-black transition-all disabled:opacity-50"
              >
                修正する
              </button>
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-8 py-3 md:py-4 rounded-full bg-gradient-to-r from-[var(--color-cyan-400)] to-blue-600 hover:brightness-110 text-white font-black transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_var(--color-glow)]"
              >
                {isSubmitting ? '送信中...' : 'この内容で応募する'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Input Step
  return (
    <main className="min-h-screen bg-background text-foreground py-12 px-4 relative">
      <div className="fixed inset-0 pointer-events-none opacity-20" style={{
        backgroundImage: 'radial-gradient(circle at 50% 0%, var(--color-glow) 0%, transparent 60%)'
      }}></div>

      <div className="max-w-3xl mx-auto relative z-10">
        <Link href={`/${eventSlug}`} className="inline-flex items-center gap-2 text-[var(--color-cyan-400)] hover:brightness-110 mb-8 font-bold text-sm">
          <span className="text-xl">◀</span> トップページへ戻る
        </Link>
        
        <h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter">
          ENTRY FORM
        </h1>
        <p className="text-foreground/60 mb-10 text-sm md:text-base font-bold">
          楽曲応募フォーム
        </p>

        <form onSubmit={handlePreview} className="bg-surface/60 backdrop-blur-md border border-surface-border rounded-[2rem] p-6 md:p-10 space-y-8 shadow-2xl">
          {errorMsg && (
            <div className="bg-red-500/10 border-l-4 border-red-500 text-red-500 p-4 rounded-r-lg text-sm font-bold">
              {errorMsg}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-black mb-2 flex items-center gap-2">
                曲名 <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded uppercase tracking-wider">必須</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-cyan-400)] transition-colors text-foreground"
                placeholder="例: サイバーパンク・シティ"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-black mb-2 flex items-center gap-2">
                楽曲URL <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded uppercase tracking-wider">必須</span>
              </label>
              <input
                type="url"
                name="songUrl"
                value={formData.songUrl}
                onChange={handleChange}
                className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-cyan-400)] transition-colors text-foreground"
                placeholder="YouTube、またはニコニコ動画のURL"
                required
              />
              <p className="text-xs text-foreground/50 mt-2">
                ※審査および試聴用に使用します。公開可能なURLを入力してください。
              </p>
            </div>

            <div>
              <label className="block text-sm font-black mb-2 flex items-center gap-2">
                アーティスト名 <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded uppercase tracking-wider">必須</span>
              </label>
              <input
                type="text"
                name="artistName"
                value={formData.artistName}
                onChange={handleChange}
                className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-cyan-400)] transition-colors text-foreground"
                placeholder="アーティスト名"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-black mb-2 flex items-center gap-2">
                X (旧Twitter) アカウント <span className="text-[10px] bg-surface-border text-foreground/70 px-2 py-0.5 rounded uppercase tracking-wider">任意</span>
              </label>
              <input
                type="text"
                name="xAccount"
                value={formData.xAccount}
                onChange={handleChange}
                className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-cyan-400)] transition-colors text-foreground"
                placeholder="例: @your_account"
              />
            </div>

            <div>
              <label className="block text-sm font-black mb-2 flex items-center gap-2">
                連絡用メールアドレス <span className="text-[10px] bg-surface-border text-foreground/70 px-2 py-0.5 rounded uppercase tracking-wider">任意</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-cyan-400)] transition-colors text-foreground"
                placeholder="運営からの連絡を受け取れるアドレス"
              />
            </div>

            <div>
              <label className="block text-sm font-black mb-2 flex items-center gap-2">
                ジャンル <span className="text-[10px] bg-surface-border text-foreground/70 px-2 py-0.5 rounded uppercase tracking-wider">任意</span>
              </label>
              <input
                type="text"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-cyan-400)] transition-colors text-foreground"
                placeholder="例: Rock, EDM, ボカロ etc."
              />
            </div>

            <div>
              <label className="block text-sm font-black mb-2 flex items-center gap-2">
                {config.lyricsTab} <span className="text-[10px] bg-surface-border text-foreground/70 px-2 py-0.5 rounded uppercase tracking-wider">任意</span>
              </label>
              <textarea
                name="lyrics"
                value={formData.lyrics}
                onChange={handleChange}
                rows={6}
                className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-cyan-400)] transition-colors text-foreground resize-y"
                placeholder={`${config.lyricsTab}がある場合はこちらに入力してください`}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-black mb-2 flex items-center gap-2">
                {config.analysisTab} <span className="text-[10px] bg-surface-border text-foreground/70 px-2 py-0.5 rounded uppercase tracking-wider">任意</span>
              </label>
              <textarea
                name="analysis"
                value={formData.analysis}
                onChange={handleChange}
                rows={6}
                className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-cyan-400)] transition-colors text-foreground resize-y"
                placeholder={`${config.analysisTab}がある場合はこちらに入力してください`}
              ></textarea>
            </div>
            
            <div className="pt-4 border-t border-surface-border/50">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    name="agreedToTerms"
                    checked={formData.agreedToTerms}
                    onChange={handleChange}
                    className="peer appearance-none w-5 h-5 border-2 border-surface-border rounded bg-background checked:bg-[var(--color-cyan-400)] checked:border-[var(--color-cyan-400)] transition-all cursor-pointer"
                  />
                  <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div className="text-sm font-bold text-foreground/80 group-hover:text-foreground transition-colors">
                  <a href={`/${eventSlug}#guidelines`} target="_blank" rel="noreferrer" className="text-[var(--color-cyan-400)] hover:underline">応募規約</a>に同意します <span className="text-red-400">*</span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-8 text-center">
            <button 
              type="submit"
              className="w-full md:w-auto px-12 py-4 rounded-full bg-gradient-to-r from-[var(--color-cyan-400)] to-blue-600 hover:brightness-110 text-white font-black text-lg transition-all shadow-[0_0_20px_var(--color-glow)] hover:scale-105 active:scale-95 flex items-center justify-center gap-2 mx-auto"
            >
              プレビューで確認する
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
