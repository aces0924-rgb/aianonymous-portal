'use client'

import { useRouter, useParams } from 'next/navigation'

interface RandomTrackButtonProps {
  trackIds: number[]
  label?: string
  preview?: string
  className?: string
  variant?: 'hero' | 'compact'
  style?: React.CSSProperties
}

export default function RandomTrackButton({ 
  trackIds, 
  label = "ランダム", 
  preview,
  activeTable,
  className = "",
  variant = 'compact',
  style
}: RandomTrackButtonProps & { activeTable?: string }) {
  const router = useRouter()
  const params = useParams()
  const eventSlug = params?.eventSlug as string || ''

  const handleRandomClick = () => {
    if (trackIds.length === 0) return
    
    // セッションストレージから履歴を取得
    const historyKey = 'random_track_history'
    const historyJson = sessionStorage.getItem(historyKey)
    let history: number[] = historyJson ? JSON.parse(historyJson) : []
    
    // まだ履歴にない曲を候補にする
    let candidates = trackIds.filter(id => !history.includes(id))
    
    // 候補がなくなった、または履歴が全曲の半分を超えたら古い履歴を消すかリセット
    if (candidates.length === 0 || history.length >= trackIds.length * 0.5) {
      history = []
      candidates = trackIds
    }
    
    const randomIndex = Math.floor(Math.random() * candidates.length)
    const randomId = candidates[randomIndex]
    
    // 履歴を更新して保存
    history.push(randomId)
    sessionStorage.setItem(historyKey, JSON.stringify(history))
    
    // プレビューモード（手動パラメータ指定）中のみクエリを引き継ぐ
    const query = preview === 'honban' ? '?preview=honban' : ''
    const prefix = eventSlug ? `/${eventSlug}` : ''
      
    router.push(`${prefix}/tracks/${randomId}${query}`)
  }

  const baseStyles = "rounded-full font-black transition-all whitespace-nowrap flex items-center justify-center"
  
  const variantStyles = variant === 'hero' 
    ? `w-full md:w-[420px] h-16 md:h-24 px-8 md:px-12 ${style ? '' : 'bg-white hover:bg-gray-100 text-foreground'} text-xl md:text-2xl shadow-xl hover:shadow-2xl hover:scale-105 justify-center gap-4 [text-shadow:none]`
    : "px-3 md:px-6 py-2 md:py-3 bg-purple-400/10 hover:bg-purple-400/20 text-white text-xs md:text-sm gap-2 backdrop-blur-sm"

  return (
    <button
      onClick={handleRandomClick}
      className={`${baseStyles} ${variantStyles} ${className}`}
      title={label}
      style={style}
    >
      <div className="shrink-0">
        {variant === 'hero' ? (
          <svg className={`w-8 h-8 md:w-10 md:h-10 ${style ? 'text-current' : 'text-[var(--color-cyan-400)]'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/>
          </svg>
        ) : (
          <svg className="w-4 h-4 md:w-5 md:h-5 text-purple-400 drop-shadow-[0_0_5px_rgba(188,19,254,0.4)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H22"/><path d="m18 2 4 4-4 4"/><path d="M2 6h1.9c1.5 0 2.9.9 3.6 2.2"/><path d="M22 18h-5.9c-1.3 0-2.6-.7-3.3-1.8l-.5-.8"/><path d="m18 14 4 4-4 4"/>
          </svg>
        )}
      </div>
      <span className={variant === 'compact' ? "hidden md:inline" : "tracking-tighter font-black ml-4"}>{label}</span>
    </button>
  )
}
