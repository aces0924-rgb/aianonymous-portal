
import React from 'react'
import { encodeSelectionId } from '@/lib/id-utils'

interface Award {
  id: number
  category: string
  rank: number
  title: string
  note: string | null
  description: string | null
  extraInfo: string | null
  trackId: string | null
  order: number
}

interface AwardResultProps {
  awards: Award[]
  isPreview?: boolean
  playlists?: { id: number, userName: string }[]
}

export default function AwardResult({ awards, isPreview, playlists }: AwardResultProps) {
  // カテゴリごとにグループ化
  const categories: Record<string, string> = {
    "AI_LYRIC": "AI分析部門（AIリリック・アワード）",
    "CURATOR": "キュレーター部門",
    "USER_CHOICE": "総合投票部門（ユーザー・チョイス TOP10）",
    "CREATORS_CHOICE": "クリエイターチョイス（スピンオフ部門）"
  }

  const groupedAwards = awards.reduce((acc, award) => {
    if (!acc[award.category]) acc[award.category] = []
    acc[award.category].push(award)
    return acc
  }, {} as Record<string, Award[]>)

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-12 space-y-24">
      {isPreview && (
        <div className="fixed top-4 right-4 z-50 bg-red-600 text-white px-4 py-2 rounded-full text-xs font-bold animate-pulse shadow-lg">
          PREVIEW MODE: ALL DATA VISIBLE
        </div>
      )}

      {/* アンカーナビゲーション */}
      <nav className="flex flex-wrap justify-center gap-2 md:gap-4 pb-8 sticky top-4 z-40">
        {Object.entries(categories).map(([key, label]) => (
          <a
            key={key}
            href={`#category-${key}`}
            className="px-6 py-3 rounded-full bg-neutral-800 border-2 border-neutral-700 text-sm md:text-base font-black text-white hover:bg-yellow-500 hover:text-black hover:border-yellow-500 transition-all shadow-xl flex items-center gap-2 group"
          >
            <span>{label.split('（')[0]}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="group-hover:translate-y-1 transition-transform">
              <path d="M12 5v14M19 12l-7 7-7-7"/>
            </svg>
          </a>
        ))}
      </nav>

      {Object.entries(categories).map(([key, label]) => (
        <section id={`category-${key}`} key={key} className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000 scroll-mt-24">
          <div className="flex items-center gap-4 border-b border-yellow-500/20 pb-4">
            <h2 className="text-xl md:text-2xl font-black text-yellow-500 tracking-wider">
              {label}
            </h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-yellow-500/20 to-transparent" />
          </div>

          <div className="grid gap-4">
            {(groupedAwards[key] || []).sort((a, b) => a.order - b.order).map((award) => (
              <div 
                key={award.id}
                className="relative group overflow-hidden rounded-xl border border-white/5 bg-white/5 backdrop-blur-sm p-6 md:p-8 flex items-center gap-6 md:gap-12 transition-all hover:bg-white/10 hover:border-yellow-500/30"
              >
                {/* Rank Number */}
                <div className="flex-none">
                  <span className={`text-4xl md:text-6xl font-black italic italic-font ${award.rank <= 3 && key !== 'CURATOR' ? 'text-yellow-500' : 'text-neutral-700'}`}>
                    {key === 'CURATOR' ? '-' : award.rank}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <h3 className="text-xl md:text-2xl font-black tracking-tight text-foreground group-hover:text-yellow-200 transition-colors">
                      {award.title}
                    </h3>
                    {award.note && (
                      <span className="text-[10px] md:text-xs text-neutral-500 font-medium px-2 py-0.5 rounded border border-neutral-800">
                        {award.note}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm md:text-base text-neutral-400 leading-relaxed max-w-3xl">
                    {award.description}
                  </p>
                  
                  {award.extraInfo && (
                    <p className="text-[10px] md:text-xs text-yellow-500/60 font-mono tracking-widest mt-4">
                      {award.extraInfo}
                    </p>
                  )}
                  
                  <div className="mt-4 flex flex-wrap gap-2">
                    {award.trackId && (
                      <a 
                        href={`/tracks/${award.trackId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-yellow-500 hover:text-black text-xs font-bold transition-colors"
                      >
                        ▶ 楽曲詳細へ
                      </a>
                    )}
                    
                    {key === 'CURATOR' && playlists && (() => {
                      const playlist = playlists.find(p => p.userName === award.title || p.userName === award.note)
                      if (!playlist) return null
                      
                      return (
                        <a 
                          href={`/selection/${encodeSelectionId(playlist.id)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 hover:bg-blue-500 hover:text-white text-xs font-bold transition-colors"
                        >
                          ▶ 推しリストを見る
                        </a>
                      )
                    })()}
                  </div>
                </div>

                {/* Decorative Icon */}
                <div className="hidden md:flex flex-none opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-2xl">🏆</span>
                </div>

                {/* Accent Line */}
                <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
            
            {(!groupedAwards[key] || groupedAwards[key].length === 0) && (
              <div className="py-12 text-center text-neutral-600 italic text-sm">
                この部門のデータは現在集計中、または未登録です。
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  )
}
