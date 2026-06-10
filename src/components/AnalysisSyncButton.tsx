'use client'

import { useState } from 'react'

interface AnalysisSyncButtonProps {
  action: (formData: FormData) => Promise<{ success: boolean; count?: number; error?: string }>
}

export default function AnalysisSyncButton({ action }: AnalysisSyncButtonProps) {
  const [isSyncing, setIsSyncing] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSyncing) return

    const confirmSync = window.confirm('Google Driveフォルダのテキストファイルから「楽曲考察」のみを同期します。よろしいですか？')
    if (!confirmSync) return

    setIsSyncing(true)
    const formData = new FormData(event.currentTarget)

    try {
      const result = await action(formData)
      if (result.success) {
        alert(`✅ 同期完了: ${result.count} 件の楽曲考察を更新しました。`)
      } else {
        alert(`❌ エラーが発生しました: ${result.error}`)
      }
    } catch (err: any) {
      alert(`❌ 通信エラーが発生しました: ${err.message}`)
    } finally {
      setIsSyncing(false)
    }
  }

  // 規約上の懸念により、楽曲考察同期機能を一時停止中
  return (
    <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-xl text-gray-500 text-sm font-bold text-center">
      ⚠️ 楽曲考察同期機能は現在停止されています
    </div>
  );
  /* 以前の同期フォーム
  return (
    <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-[var(--color-cyan-400)]">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4 bg-purple-50 p-4 rounded-xl border border-purple-100">
          <label htmlFor="startIdAnalysis" className="text-sm font-bold text-purple-800 whitespace-nowrap">
            考察更新スタートNo:
          </label>
          <input 
            type="number" 
            id="startIdAnalysis"
            name="startId" 
            defaultValue={1}
            className="w-24 border border-purple-200 p-2 rounded text-black font-bold focus:ring-2 focus:ring-purple-500 outline-none"
            disabled={isSyncing}
          />
          <span className="text-[10px] text-purple-600 leading-tight">
            ※Google Driveフォルダ内のテキストファイルを反映します（歌詞考察は保護されます）。
          </span>
        </div>
        <button 
          type="submit" 
          disabled={isSyncing}
          className={`p-3 rounded-lg w-full font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${
            isSyncing 
            ? 'bg-purple-400 cursor-not-allowed text-white/80' 
            : 'bg-purple-600 text-white hover:bg-purple-500'
          }`}
        >
          {isSyncing ? (
            <>
              <span className="animate-spin text-xl">⏳</span>
              <span>同期中... しばらくお待ちください</span>
            </>
          ) : (
            <>
              <span>📝</span> 楽曲考察のみを同期・更新する
            </>
          )}
        </button>
      </div>
    </form>
  )
  */
}
