import React from 'react';
import Link from 'next/link';

export default function AwardsPage() {
  return (
    <main className="min-h-screen bg-background text-white selection:bg-yellow-500/30 overflow-x-hidden flex flex-col items-center relative">
      {/* Back Button */}
      <div className="absolute left-6 top-8 z-50">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-[10px] font-bold tracking-widest text-neutral-500 hover:text-yellow-500 transition-colors uppercase group"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="transition-transform group-hover:-translate-x-1">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>
      </div>

      {/* ヒーローセクション */}
      <section className="w-full pt-16 pb-8 flex flex-col items-center text-center relative overflow-visible">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-500/10 via-transparent to-transparent -z-10" />
        
        <div className="inline-block px-4 py-1 rounded-full border border-yellow-500/30 text-yellow-500 text-xs font-bold tracking-[0.3em] uppercase mb-4">
          Music Festival Finale
        </div>
        
        <div className="relative overflow-visible">
          <h1 className="inline-block text-5xl md:text-7xl lg:text-8xl font-black italic tracking-tighter leading-[1.1] py-8 px-4 text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-800 drop-shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            AWARDS 2026
          </h1>
        </div>
        
        <p className="text-lg md:text-2xl font-medium text-neutral-400 tracking-[0.2em] mt-4">
          栄光の瞬間まで、あと少し。
        </p>
      </section>

      {/* COMING SOON ビジュアル */}
      <section className="max-w-7xl w-full px-6 pb-12 flex-1 flex items-center">
        <div className="grid md:grid-cols-3 gap-6 w-full">
          <ComingSoonCard 
            title="AI分析部門" 
            awardName="AIリリック・アワード" 
            description="AIの心を最も揺さぶった、言葉の力。"
            placeholder="NOW TALLYING..."
            gradient="from-[var(--color-cyan-600)]/20 to-[var(--color-cyan-400)]/10"
            accent="text-blue-400"
          />
          <ComingSoonCard 
            title="キュレーター部門" 
            awardName="ベスト・キュレーター賞" 
            description="みんなの「好き」を広めた、影の立役者たち。"
            placeholder="SELECTION IN PROGRESS"
            gradient="from-purple-600/20 to-pink-500/10"
            accent="text-purple-400"
          />
          <ComingSoonCard 
            title="総合投票部門 (メイン)" 
            awardName="ユーザー・チョイス TOP10" 
            description="あなたの「好き」に、言い訳は要らなかった。"
            placeholder="VOTES BEING COUNTED"
            gradient="from-yellow-600/20 to-orange-500/10"
            accent="text-yellow-400"
          />
        </div>
      </section>

      {/* フッター */}
      <footer className="w-full py-12 text-center border-t border-white/5 text-neutral-600">
        <p className="text-xs font-mono tracking-[0.3em] uppercase">
          AWARDS 2026 • THE FUTURE OF MUSIC
        </p>
        <p className="text-[10px] mt-2 tracking-widest">
          PENGUIN-HOODIE PROTECTOR OVERSEES FINAL VERIFICATION.
        </p>
      </footer>
    </main>
  );
}

function ComingSoonCard({ title, awardName, description, placeholder, gradient, accent }: any) {
  return (
    <div className="group relative h-[450px] rounded-3xl border border-white/10 bg-neutral-900/40 backdrop-blur-xl overflow-hidden flex flex-col transition-all duration-500">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-20`} />
      <div className="relative p-8 h-full flex flex-col text-center">
        <div className="space-y-2">
          <h2 className={`text-sm font-bold tracking-widest ${accent} uppercase`}>{title}</h2>
          <h3 className="text-2xl font-black">{awardName}</h3>
          <p className="text-sm text-neutral-400 font-light mt-4">{description}</p>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <div className="relative">
            <div className="absolute -inset-8 bg-yellow-500/10 rounded-full blur-2xl animate-pulse" />
            <span className="text-6xl filter grayscale group-hover:grayscale-0 transition-all duration-700">🦉</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-black tracking-[0.15em] text-foreground/90">COMING SOON</p>
            <p className="text-[10px] font-bold text-yellow-500/60 tracking-widest uppercase">結果発表までお待ちください</p>
          </div>
        </div>
        <div className="pt-6 border-t border-white/5">
          <p className="text-xs font-mono tracking-widest text-neutral-500 uppercase">{placeholder}</p>
        </div>
      </div>
    </div>
  );
}
