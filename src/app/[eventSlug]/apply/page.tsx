'use client'

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import TrackDetailView from '@/components/TrackDetailView';
import { submitApplication, getApplyConfig, resolveSunoUrl } from '@/app/actions/apply';
import toast from 'react-hot-toast';

export default function ApplyPage({ params }: { params: Promise<{ eventSlug: string }> }) {
  const resolvedParams = React.use(params);
  const eventSlug = resolvedParams.eventSlug;
  const [step, setStep] = useState<'input' | 'preview' | 'success'>('input');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [config, setConfig] = useState({ lyricsTab: '歌詞', analysisTab: '歌詞考察', analysisNote: '', applicationFormType: 'standard', enableArtistMain: false, defaultMusicAnalysis: '', defaultIllustrationAnalysis: '' });
  const [entryType, setEntryType] = useState<'music' | 'illustration'>('music');

  // Upload State
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [srtFile, setSrtFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    getApplyConfig(eventSlug).then(res => {
      if (res) {
        setConfig(res as any);
        setFormData(prev => {
          if (!prev.analysis) {
            return { ...prev, analysis: (res as any).defaultMusicAnalysis || '' };
          }
          return prev;
        });
      }
    });
  }, [eventSlug]);

  // entryType が切り替わったときにテンプレートを適用（ユーザーが編集していない場合のみ）
  useEffect(() => {
    setFormData(prev => {
      if (!prev.analysis || prev.analysis === config.defaultMusicAnalysis || prev.analysis === config.defaultIllustrationAnalysis) {
        return { ...prev, analysis: entryType === 'music' ? config.defaultMusicAnalysis : config.defaultIllustrationAnalysis };
      }
      return prev;
    });
  }, [entryType, config.defaultMusicAnalysis, config.defaultIllustrationAnalysis]);

  const [formData, setFormData] = useState({
    title: '',
    songUrl: '',
    lyrics: '',
    analysis: '',
    artistName: '',
    xAccount: '',
    email: '',
    genre: '',
    password: '',
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

  const handlePreview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (entryType === 'music' && !formData.title.trim()) {
      setErrorMsg('曲名は必須です。');
      return;
    }
    if (!formData.songUrl.trim()) {
      setErrorMsg('楽曲URLは必須です。');
      return;
    }

    if (config.applicationFormType === 'anonymous') {
      if (!formData.xAccount.trim()) {
        setErrorMsg('X (旧Twitter) アカウントは必須です。');
        return;
      }
      if (!formData.email.trim()) {
        setErrorMsg('連絡用メールアドレスは必須です。');
        return;
      }
      if (!formData.password.trim() || formData.password.length !== 10) {
        setErrorMsg('パスワードは10桁で入力してください。');
        return;
      }
      if (!formData.lyrics.trim()) {
        setErrorMsg('歌詞は必須です。（インストの場合は「インスト曲」と記載）');
        return;
      }
      if (!musicFile) {
        setErrorMsg('音楽ファイルのアップロードは必須です。');
        return;
      }
    } else {
      // Standard validation
      const isYouTube = formData.songUrl.match(/(?:youtu\.be\/|youtube\.com\/)/);
      const isNico = formData.songUrl.match(/(?:nicovideo\.jp\/|nico\.ms\/)/);
      const isSuno = formData.songUrl.match(/suno\.com\//);
      if (entryType === 'music' && !isYouTube && !isNico && !isSuno) {
        setErrorMsg('楽曲URLはYouTube、ニコニコ動画、またはSunoのURLのみ有効です。');
        return;
      }
      if (entryType === 'illustration' && !formData.songUrl.match(/^https?:\/\//)) {
        setErrorMsg('正しい画像URLを入力してください。');
        return;
      }
      if (!formData.artistName.trim()) {
        setErrorMsg('アーティスト名は必須です。');
        return;
      }
    }

    if (config.applicationFormType === 'anonymous' && !formData.agreedToTerms) {
      setErrorMsg('応募規約への同意は必須です。');
      return;
    }
    
    // Resolve Suno /s/ shortlinks
    let finalSongUrl = formData.songUrl;
    if (finalSongUrl.includes('suno.com/s/')) {
      setIsSubmitting(true);
      toast.loading('Sunoの短縮URLを展開しています...', { id: 'resolve-suno' });
      try {
        finalSongUrl = await resolveSunoUrl(finalSongUrl);
        setFormData(prev => ({ ...prev, songUrl: finalSongUrl }));
        toast.success('URLを展開しました', { id: 'resolve-suno' });
      } catch (e) {
        toast.dismiss('resolve-suno');
      }
      setIsSubmitting(false);
    }
    
    setErrorMsg('');
    setStep('preview');
    window.scrollTo(0, 0);
  };

  const uploadFileDirectly = async (file: File) => {
    try {
      const res = await fetch('/api/upload/resumable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, mimeType: file.type })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const sessionUri = data.sessionUri;

      return new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', sessionUri, true);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setUploadProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          if (xhr.status === 200 || xhr.status === 201) {
            // Google Drive res usually contains the file info, but not always with id if we don't request it in fields. 
            // However, we just need the file URL or we can extract the ID if available.
            // Let's assume the ID is returned or we store the session URL? Actually, we should return a Drive ID or success token.
            let fileId = 'unknown_id';
            if(xhr.responseText) {
               try {
                 const response = JSON.parse(xhr.responseText);
                 if (response.id) fileId = response.id;
               } catch(e) {}
            }
            resolve(fileId);
          } else {
            reject(new Error('アップロードに失敗しました: ' + xhr.statusText));
          }
        };
        xhr.onerror = () => reject(new Error('ネットワークエラーが発生しました。'));
        xhr.send(file);
      });
    } catch (e: any) {
      throw new Error(e.message || 'アップロード処理中にエラーが発生しました。');
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setIsUploading(true);
    setErrorMsg('');
    setUploadProgress(0);
    
    let toastId = toast.loading('送信処理を開始しています...', { id: 'submit-toast' });
    
    try {
      let musicFileUrl = '';
      let srtFileUrl = '';

      if (config.applicationFormType === 'anonymous') {
        if (musicFile) {
          toast.loading(`音声ファイルをGoogle Driveへアップロード中...`, { id: toastId });
          musicFileUrl = await uploadFileDirectly(musicFile);
        }
        if (srtFile) {
          toast.loading(`字幕ファイルをGoogle Driveへアップロード中...`, { id: toastId });
          srtFileUrl = await uploadFileDirectly(srtFile);
        }
      }

      toast.loading('データベースへ楽曲情報を登録中...', { id: toastId });
      const payload = {
        ...formData,
        title: entryType === 'illustration' ? (formData.title || 'イラスト作品') : formData.title,
        musicFileUrl,
        srtFileUrl
      };

      const result = await submitApplication(eventSlug, payload);
      if (result.success) {
        toast.success('応募が完了しました！', { id: toastId });
        setStep('success');
        window.scrollTo(0, 0);
      } else {
        const errMsg = result.error || 'エラーが発生しました。';
        setErrorMsg(errMsg);
        toast.error(`エラー: ${errMsg}`, { id: toastId, duration: 8000 });
      }
    } catch (e: any) {
      const errMsg = e.message || '通信エラーが発生しました。';
      setErrorMsg(errMsg);
      toast.error(`エラー: ${errMsg}`, { id: toastId, duration: 8000 });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
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
          <p className="text-foreground mb-10 text-lg">
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
      title: entryType === 'illustration' ? (formData.title || 'イラスト作品') : formData.title,
      songUrl: formData.songUrl,
      audioUrl: formData.songUrl,
      lyrics: formData.lyrics,
      artistName: formData.artistName || '匿名',
      xAccount: formData.xAccount,
      genre: formData.genre,
      analysis: formData.analysis || '※プレビューモードではこの内容が表示されます。',
      review: '',
      published: true
    };

    return (
      <div className="min-h-screen bg-background relative pb-24">
        <div className="fixed top-0 left-0 w-full z-[100] bg-purple-600 text-white py-2 text-center text-sm font-black tracking-widest shadow-lg">
          プレビューモード（実際の画面ではこのように表示されます）
        </div>
        
        <div className="pt-10 pointer-events-none">
          {errorMsg && (
            <div className="max-w-4xl mx-auto mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 pointer-events-auto">
              <svg className="w-6 h-6 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-500 font-bold">{errorMsg}</p>
            </div>
          )}
          <TrackDetailView 
            track={previewTrack as any}
            eventSlug={eventSlug}
            audioSource={formData.songUrl}
            isPreviewMode={true}
            defaultLabels={{ ...config, lyricsTab: entryType === 'illustration' ? 'このイラストについて' : config.lyricsTab }}
            defaultFeatures={{ applicationFormType: config.applicationFormType, enableArtistMain: config.enableArtistMain }}
          />
        </div>

        <div className="fixed bottom-0 left-0 w-full z-[100] bg-surface/90 backdrop-blur-xl border-t border-surface-border p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm">
              <p className="font-bold text-[var(--color-cyan-400)] mb-1">プレビュー確認中</p>
              <p className="text-foreground text-xs hidden sm:block">内容に問題がなければ「この内容で応募する」を押してください。</p>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => setStep('input')}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-6 py-3 bg-surface-border hover:bg-surface-border/80 text-foreground font-bold rounded-xl transition-colors disabled:"
              >
                修正する
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none px-8 py-3 bg-[var(--color-cyan-500)] hover:bg-[var(--color-cyan-400)] text-background font-black rounded-xl transition-all shadow-[0_0_20px_var(--color-glow)] hover:shadow-[0_0_30px_var(--color-glow)] disabled: flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-background" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isUploading ? `アップロード中 (${uploadProgress}%)...` : '送信中...'}
                  </>
                ) : (
                  'この内容で応募する'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isAnonymousMode = config.applicationFormType === 'anonymous';

  return (
    <main className="min-h-screen bg-background text-foreground py-12 md:py-20 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href={`/${eventSlug}`} className="inline-flex items-center text-[var(--color-cyan-500)] hover:text-[var(--color-cyan-400)] font-bold mb-8 transition-colors">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l-7-7m-7 7h18" />
          </svg>
          トップページに戻る
        </Link>

        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter text-foreground">
            {isAnonymousMode ? '匿名楽曲エントリー' : (config.enableArtistMain ? 'アーティストエントリー' : '楽曲エントリー')}
          </h1>
          <p className="text-foreground text-lg">
            {isAnonymousMode 
              ? '以下のフォームから匿名フェス用の情報を登録してください。'
              : (config.enableArtistMain ? '以下のフォームからアーティスト情報と作品を登録してください。' : '以下のフォームから楽曲情報を登録してください。')}
          </p>
        </div>

        {errorMsg && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <svg className="w-6 h-6 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-500 font-bold">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handlePreview} className="space-y-8">
          
          {!isAnonymousMode && (
            <div className="flex bg-surface border border-surface-border p-1 rounded-2xl w-full max-w-sm mx-auto shadow-inner">
              <button
                type="button"
                onClick={() => setEntryType('music')}
                className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${entryType === 'music' ? 'bg-[var(--color-cyan-500)] text-background shadow-lg' : 'text-foreground hover:text-foreground'}`}
              >
                楽曲アーティスト
              </button>
              <button
                type="button"
                onClick={() => setEntryType('illustration')}
                className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${entryType === 'illustration' ? 'bg-fuchsia-500 text-background shadow-lg' : 'text-foreground hover:text-foreground'}`}
              >
                イラストアーティスト
              </button>
            </div>
          )}

          <div className="bg-surface border border-surface-border p-6 md:p-8 rounded-3xl space-y-6 shadow-xl">
            
            {/* 共通項目: 曲名 */}
            {entryType === 'music' && (
              <div>
                <label className="block text-sm font-bold mb-2">
                  曲名 <span className="text-[var(--color-cyan-500)] ml-1">必須</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-[var(--color-cyan-500)] focus:border-transparent transition-all outline-none"
                  placeholder="例: サイバーパンク・シティ"
                  required
                />
              </div>
            )}

            {/* URL */}
            <div>
              <label className="block text-sm font-bold mb-2">
                {isAnonymousMode ? 'Suno楽曲URL' : (entryType === 'music' ? '楽曲URL (YouTube または ニコニコ動画 または Suno)' : 'イラストの画像URL (Gyazoやpbs.twimg等)')} <span className="text-[var(--color-cyan-500)] ml-1">必須</span>
              </label>
              <input
                type="url"
                name="songUrl"
                value={formData.songUrl}
                onChange={handleChange}
                className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-[var(--color-cyan-500)] focus:border-transparent transition-all outline-none"
                placeholder={isAnonymousMode ? "例: https://suno.com/song/..." : (entryType === 'music' ? "例: https://youtu.be/..." : "例: https://pbs.twimg.com/media/...jpg")}
                required
              />
              {!isAnonymousMode && entryType === 'illustration' && (
                <div className="mt-3 text-xs text-foreground bg-surface-border/30 border border-surface-border p-4 rounded-xl space-y-2 leading-relaxed">
                  <p className="font-black text-[var(--color-cyan-400)] flex items-center gap-2"><span className="text-base">💡</span> 画像URLの取得方法</p>
                  <div className="space-y-1.5 pl-1">
                    <p><span className="font-bold text-white">【PCの場合】</span><br/>X (Twitter) の画像ページを開いて画像を右クリック → <span className="font-bold text-white underline decoration-cyan-500 underline-offset-2">「画像のアドレスをコピー」</span></p>
                    <p><span className="font-bold text-white">【スマホの場合】</span><br/>直接画像URLが取れない場合は、ポストのURLをコピーして以下のツール等で画像URLを取得してください。</p>
                    <p><a href="https://tool-place.net/tools/x_media_getter/" target="_blank" rel="noopener noreferrer" className="inline-block mt-1 text-[var(--color-cyan-400)] underline hover:text-[var(--color-cyan-500)] font-bold">X (Twitter) 画像URL取得ツールを開く ↗</a></p>
                  </div>
                </div>
              )}
            </div>

            {/* アーティスト名 */}
            <div>
              <label className="block text-sm font-bold mb-2">
                アーティスト名 {isAnonymousMode ? <span className="text-foreground ml-1">任意（未入力時は最後まで匿名扱い）</span> : <span className="text-[var(--color-cyan-500)] ml-1">必須</span>}
              </label>
              <input
                type="text"
                name="artistName"
                value={formData.artistName}
                onChange={handleChange}
                className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-[var(--color-cyan-500)] focus:border-transparent transition-all outline-none"
                placeholder={isAnonymousMode ? "未入力の場合は匿名" : "例: AI-Creator"}
                required={!isAnonymousMode}
              />
            </div>

            {/* 匿名モード専用項目 */}
            {isAnonymousMode && (
              <>
                <div>
                  <label className="block text-sm font-bold mb-2">
                    X (旧Twitter) アカウント <span className="text-[var(--color-cyan-500)] ml-1">必須</span>
                  </label>
                  <input
                    type="text"
                    name="xAccount"
                    value={formData.xAccount}
                    onChange={handleChange}
                    className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-[var(--color-cyan-500)] focus:border-transparent transition-all outline-none font-mono"
                    placeholder="例: @your_account"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    連絡用メールアドレス <span className="text-[var(--color-cyan-500)] ml-1">必須</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-[var(--color-cyan-500)] focus:border-transparent transition-all outline-none"
                    placeholder="例: example@gmail.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-2">
                    パスワード (10桁) <span className="text-[var(--color-cyan-500)] ml-1">必須</span>
                    <p className="text-xs text-foreground font-normal mt-1">※投票や結果開示などに使用します</p>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    maxLength={10}
                    minLength={10}
                    className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-[var(--color-cyan-500)] focus:border-transparent transition-all outline-none font-mono tracking-widest"
                    placeholder="10桁のパスワードを入力"
                    required
                  />
                </div>
              </>
            )}

            {/* 通常モード専用のXとジャンル */}
            {!isAnonymousMode && (
              <>
                <div>
                  <label className="block text-sm font-bold mb-2">
                    X (Twitter) アカウント <span className="text-foreground ml-1">任意</span>
                  </label>
                  <input
                    type="text"
                    name="xAccount"
                    value={formData.xAccount}
                    onChange={handleChange}
                    className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-[var(--color-cyan-500)] focus:border-transparent transition-all outline-none"
                    placeholder="例: @your_account"
                  />
                </div>

                {entryType === 'music' && (
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      ジャンル <span className="text-foreground ml-1">任意</span>
                    </label>
                    <input
                      type="text"
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-[var(--color-cyan-500)] focus:border-transparent transition-all outline-none"
                      placeholder="例: サイバーパンク / EDM"
                    />
                  </div>
                )}
              </>
            )}

            {/* 歌詞 / イラスト説明 */}
            <div>
              <label className="block text-sm font-bold mb-2">
                {entryType === 'illustration' ? 'このイラストについて' : config.lyricsTab} {isAnonymousMode ? <span className="text-[var(--color-cyan-500)] ml-1">必須</span> : <span className="text-foreground ml-1">任意</span>}
                {(isAnonymousMode && entryType === 'music') && <p className="text-xs text-foreground font-normal mt-1">※インストの場合は「インスト曲」と記載してください</p>}
              </label>
              <textarea
                name="lyrics"
                value={formData.lyrics}
                onChange={handleChange}
                rows={6}
                className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-[var(--color-cyan-500)] focus:border-transparent transition-all outline-none resize-y"
                placeholder={
                  entryType === 'illustration' 
                    ? "イラストのキャプションや設定などを入力..." 
                    : (isAnonymousMode ? `${config.lyricsTab}を入力（インストの場合は「インスト曲」と記載）` : `${config.lyricsTab}を入力...`)
                }
                required={isAnonymousMode}
              />
            </div>

            {/* ファイルアップロード (匿名モードのみ) */}
            {isAnonymousMode && (
              <div className="space-y-6 pt-4 border-t border-surface-border">
                <div>
                  <label className="block text-sm font-bold mb-2">
                    音楽ファイルアップロード <span className="text-[var(--color-cyan-500)] ml-1">必須</span>
                    <p className="text-xs text-foreground font-normal mt-1">※ .mp3, .wav, .mp4 のいずれかの形式</p>
                  </label>
                  <input
                    type="file"
                    accept=".mp3,.wav,.mp4,audio/mpeg,audio/wav,video/mp4"
                    onChange={(e) => setMusicFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[var(--color-cyan-500)]/10 file:text-[var(--color-cyan-400)] hover:file:bg-[var(--color-cyan-500)]/20 cursor-pointer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">
                    字幕SRTファイル <span className="text-foreground ml-1">任意</span>
                  </label>
                  <input
                    type="file"
                    accept=".srt"
                    onChange={(e) => setSrtFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-foreground file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-surface-border file:text-foreground hover:file:bg-surface-border/80 cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* 通常モード専用の考察 */}
            {!isAnonymousMode && (
              <div>
                <label className="block text-sm font-bold mb-2">
                  {config.analysisTab} <span className="text-foreground ml-1">任意</span>
                </label>
                <textarea
                  name="analysis"
                  value={formData.analysis}
                  onChange={handleChange}
                  rows={8}
                  className="w-full bg-background border border-surface-border rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-[var(--color-cyan-500)] focus:border-transparent transition-all outline-none resize-y"
                  placeholder={`${config.analysisTab}について自由に記述してください。`}
                />
              </div>
            )}
            
            {/* チェックボックス類 (匿名モードのみ) */}
            {isAnonymousMode && (
              <div className="pt-4 border-t border-surface-border space-y-4">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-1">
                    <input
                      type="checkbox"
                      name="publishConsent"
                      checked={formData.publishConsent}
                      onChange={handleChange}
                      className="peer appearance-none w-5 h-5 border-2 border-surface-border rounded bg-background checked:bg-[var(--color-cyan-500)] checked:border-[var(--color-cyan-500)] transition-colors cursor-pointer"
                    />
                    <svg className="absolute w-3 h-3 text-background opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-foreground group-hover:text-[var(--color-cyan-400)] transition-colors">
                      ニコニコ動画等への転載・公開に同意する
                    </p>
                    <p className="text-foreground mt-1">
                      ご応募いただいた楽曲は、運営のYouTubeチャンネルやニコニコ動画のプレイリスト等で紹介される場合があります。
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-1">
                    <input
                      type="checkbox"
                      name="agreedToTerms"
                      checked={formData.agreedToTerms}
                      onChange={handleChange}
                      className="peer appearance-none w-5 h-5 border-2 border-surface-border rounded bg-background checked:bg-[var(--color-cyan-500)] checked:border-[var(--color-cyan-500)] transition-colors cursor-pointer"
                      required
                    />
                    <svg className="absolute w-3 h-3 text-background opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div className="text-sm">
                    <p className="font-bold text-foreground group-hover:text-[var(--color-cyan-400)] transition-colors">
                      応募規約に同意する <span className="text-[var(--color-cyan-500)] ml-1">必須</span>
                    </p>
                  </div>
                </label>
              </div>
            )}
          </div>

          <div className="text-center pt-4 pb-12">
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-12 py-4 bg-[var(--color-cyan-500)] hover:bg-[var(--color-cyan-400)] text-background font-black text-lg rounded-full transition-all shadow-[0_0_20px_var(--color-glow)] hover:shadow-[0_0_30px_var(--color-glow)] hover:scale-105 active:scale-95"
            >
              入力内容の確認へ進む
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
