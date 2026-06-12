'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function DisclosurePage() {
  const [entryNo, setEntryNo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/disclosure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryNo, email, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || '通信エラーが発生しました。');
      } else {
        setResult(data.data);
      }
    } catch (err) {
      setError('サーバーとの通信に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-white selection:bg-[var(--color-cyan-500)]/30 flex flex-col items-center relative overflow-hidden font-sans">
      
      {/* Back Button */}
      <div className="absolute left-6 top-8 z-50">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xs font-bold tracking-widest text-neutral-500 hover:text-[var(--color-cyan-400)] transition-colors uppercase group"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="transition-transform group-hover:-translate-x-1">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[var(--color-cyan-400)]/20 via-transparent to-transparent -z-10 pointer-events-none" />

      <section className="w-full max-w-xl mx-auto pt-24 pb-12 px-6 flex flex-col items-center relative z-10">
        
        <div className="inline-block px-4 py-1 rounded-full border border-[var(--color-cyan-400)]/30 text-[var(--color-cyan-400)] text-[10px] font-bold tracking-[0.3em] uppercase mb-6">
          Creator Only
        </div>
        
        <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-neutral-300 to-neutral-600 mb-2">
          RESULT DISCLOSURE
        </h1>
        <p className="text-sm font-mono text-neutral-500 tracking-widest mb-12">
          個別結果開示システム
        </p>

        {!result ? (
          <form onSubmit={handleSubmit} className="w-full bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--color-cyan-400)] via-blue-500 to-purple-500" />
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold tracking-widest text-neutral-400 uppercase mb-2">
                  Entry No (楽曲No) <span className="text-red-400 font-bold ml-2 tracking-normal">※2桁以下は前ゼロありで3桁入力してください。</span>
                </label>
                <input 
                  type="text" 
                  value={entryNo}
                  onChange={(e) => setEntryNo(e.target.value)}
                  placeholder="例: 001"
                  required
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-foreground font-mono placeholder-neutral-600 focus:outline-none focus:border-[var(--color-cyan-400)] focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-neutral-400 uppercase mb-2">
                  Email
                </label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="登録したメールアドレス"
                  required
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-foreground font-mono placeholder-neutral-600 focus:outline-none focus:border-[var(--color-cyan-400)] focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold tracking-widest text-neutral-400 uppercase mb-2">
                  Password
                </label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="10文字のパスワード"
                  required
                  className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-foreground font-mono placeholder-neutral-600 focus:outline-none focus:border-[var(--color-cyan-400)] focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-lg flex items-start gap-2">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-4 bg-white text-black hover:bg-[var(--color-cyan-500)] hover:text-black font-black italic tracking-widest text-sm py-4 rounded-xl transition-all disabled: disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <span className="relative z-10">{loading ? 'AUTHENTICATING...' : 'SHOW RESULT'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="w-full bg-neutral-900/60 backdrop-blur-2xl border border-[var(--color-cyan-400)]/30 rounded-3xl p-8 md:p-12 shadow-[0_0_20px_var(--color-glow)] relative overflow-hidden text-center animate-in fade-in zoom-in duration-700">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[var(--color-cyan-400)]/40 via-transparent to-transparent -z-10" />
            
            <p className="text-[var(--color-cyan-400)] font-mono text-xs tracking-[0.3em] uppercase mb-6">
              No.{result.entryNo}
            </p>
            
            <h2 className="text-2xl md:text-3xl font-black mb-1">{result.title}</h2>
            <p className="text-neutral-400 text-sm font-medium mb-12">{result.artistName}</p>
            
            <div className="grid grid-cols-2 gap-4 md:gap-8 relative z-10">
              <div className="bg-background/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center">
                <span className="text-neutral-500 text-[10px] font-bold tracking-widest uppercase mb-2">Final Rank</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl md:text-7xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500 leading-normal pb-2 pr-2">
                    {result.rank}
                  </span>
                  <span className="text-neutral-500 font-bold text-lg md:text-xl">位</span>
                </div>
              </div>
              
              <div className="bg-background/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center">
                <span className="text-neutral-500 text-[10px] font-bold tracking-widest uppercase mb-2">Total Votes</span>
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl md:text-7xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-[var(--color-cyan-400)] to-[var(--color-cyan-600)] leading-normal pb-2 pr-2">
                    {result.totalVotes}
                  </span>
                  <span className="text-[var(--color-cyan-400)] font-bold text-lg md:text-xl">票</span>
                </div>
              </div>
            </div>

            <div className="mt-10 flex flex-col items-center gap-3 relative z-10">
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`No.${result.entryNo}\n${result.artistName}さんの楽曲「${result.title}」の最終結果は${result.rank}位（${result.totalVotes}票）でした！\n\n👇まだ結果未確認のクリエイターはこちらからアクセス\nhttps://aianonymous.vercel.app/disclosure\n\n※楽曲参加者かつ事前のアンケートに回答いただいた方が対象です。\n\n#アノフェス`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-background hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-500 text-foreground px-6 py-3 rounded-full text-sm font-bold transition-all shadow-lg"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                結果をXでポストする
              </a>
              <p className="text-[10px] text-neutral-400 font-medium">
                ※結果をポストするかどうかは任意です。
              </p>
            </div>

            <button 
              onClick={() => setResult(null)}
              className="mt-10 text-xs font-bold tracking-widest text-neutral-500 hover:text-foreground uppercase transition-colors"
            >
              ← Back to Login
            </button>
          </div>
        )}
      </section>

      <footer className="w-full py-12 text-center border-t border-white/5 text-neutral-600 mt-auto">
        <p className="text-[10px] font-mono tracking-[0.3em] uppercase">
          SECURE DISCLOSURE SYSTEM
        </p>
      </footer>
    </main>
  );
}
