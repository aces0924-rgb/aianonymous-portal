'use client'
import { useState } from 'react'
import { syncHonbanToSample } from '@/app/admin/actions'

export default function SyncHonbanToSampleButton() {
  const [isPending, setIsPending] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  const handleSync = async () => {
    if (!confirm('本番用の楽曲データを準備中（サンプル）テーブルにすべて上書きコピーします。よろしいですか？')) return

    setIsPending(true)
    setStatus('同期中...')

    try {
      const result = await syncHonbanToSample()
      if (result.success) {
        setStatus(`✅ 同期完了: ${result.count}件`)
      } else {
        setStatus(`❌ エラー: ${result.error}`)
      }
    } catch (err) {
      setStatus('❌ エラーが発生しました')
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleSync}
        disabled={isPending}
        className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-500 font-bold shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 disabled:"
      >
        <span>🔄</span> 本番データを準備中テーブルにコピーする
      </button>
      {status && (
        <p className={`text-[10px] text-center font-bold ${status.includes('✅') ? 'text-green-600' : 'text-red-600'}`}>
          {status}
        </p>
      )}
    </div>
  )
}
