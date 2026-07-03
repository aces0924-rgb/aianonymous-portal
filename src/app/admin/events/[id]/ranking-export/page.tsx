'use client'

import React, { useState, use, useEffect } from 'react'
import Link from 'next/link'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { fetchRankingData, RankingItem } from './actions'

export default function RankingExportPage({ params }: { params: Promise<{ id: string }> }) {
  // `use` を使って params を解決する
  const resolvedParams = use(params)
  const eventId = resolvedParams.id
  
  const [targetType, setTargetType] = useState<'music' | 'illustration'>('illustration')
  const [excludeSelf, setExcludeSelf] = useState(false)
  const [topN, setTopN] = useState(3)
  const [totalM, setTotalM] = useState(30)
  
  const [isFetching, setIsFetching] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [progressLog, setProgressLog] = useState<string[]>([])

  const addLog = (msg: string) => setProgressLog(prev => [...prev, msg])

  const handleDownload = async () => {
    if (topN > totalM) {
      alert("上位固定枠(N) は 総枠数(M) 以下にしてください。")
      return
    }

    setIsFetching(true)
    setProgressLog([])
    addLog('📊 データベースから集計情報を取得しています...')
    
    try {
      const data = await fetchRankingData(eventId, targetType, excludeSelf)
      addLog(`✅ 集計完了: メイン ${data.totalMain}件 / サブ ${data.totalSub}件`)
      
      const { actualRanking, unselected } = data
      
      // -- ランダム抽出＆タイ考慮ロジック --
      // 上位固定枠 (実際の順位が N 以下 の作品すべて)
      const topNList = actualRanking.filter(item => (item._real_rank || 999) <= topN)
      const actualN = topNList.length
      
      // 残りのリスト (N位より下 + 0票未選択)
      const restList = [
        ...actualRanking.filter(item => (item._real_rank || 999) > topN),
        ...unselected
      ]
      
      // ランダム抽出 (M - actual_n 件)
      const neededRandomCount = totalM - actualN
      let randomSelected: RankingItem[] = []
      
      if (neededRandomCount > 0) {
        if (restList.length > neededRandomCount) {
          // Fisher-Yates シャッフルして先頭から取得
          const shuffled = [...restList].sort(() => 0.5 - Math.random())
          randomSelected = shuffled.slice(0, neededRandomCount)
        } else {
          randomSelected = [...restList]
        }
      }
      
      // ランダム抽出枠に通し番号（actual_n + 1 から）を付与
      randomSelected = randomSelected.map((item, i) => ({
        ...item,
        _real_rank: actualN + i + 1
      }))
      
      const finalTargetList = [...topNList, ...randomSelected]
      
      addLog(`🚀 ダウンロード処理を開始します (全 ${finalTargetList.length} 件)`)
      setIsDownloading(true)
      setIsFetching(false)

      const zip = new JSZip()
      let successCount = 0

      for (let i = 0; i < finalTargetList.length; i++) {
        const item = finalTargetList[i]
        const rank = item._real_rank
        const artistName = item.artist || "匿名"
        // ファイル名に使えない文字を置換
        const safeArtist = artistName.replace(/[\\/*?:"<>|]/g, '_')
        
        const imageUrl = item.imageUrl
        if (!imageUrl) {
          addLog(`⚠️ [${rank}位] ${safeArtist} - 画像URLがありません。スキップします。`)
          continue
        }

        const ext = imageUrl.toLowerCase().includes('.png') ? '.png' : 
                    imageUrl.toLowerCase().includes('.gif') ? '.gif' : '.jpg'
        
        const filename = `${rank}_${safeArtist}${ext}`
        
        try {
          // プロキシ経由で画像を取得
          const response = await fetch(`/api/proxy-image?url=${encodeURIComponent(imageUrl)}`)
          if (!response.ok) throw new Error(response.statusText)
          
          const blob = await response.blob()
          zip.file(filename, blob)
          successCount++
          addLog(`✅ [${rank}位] ${filename} を取得しました。`)
        } catch (err: any) {
          addLog(`❌ [${rank}位] ${filename} の取得失敗: ${err.message}`)
        }
      }

      addLog(`📦 ZIPファイルを生成しています...`)
      const content = await zip.generateAsync({ type: "blob" })
      saveAs(content, `ranking_${targetType}_${eventId}.zip`)
      
      addLog(`🎉 ダウンロードが完了しました！(成功: ${successCount}件)`)

    } catch (err: any) {
      addLog(`🚨 エラーが発生しました: ${err.message}`)
    } finally {
      setIsFetching(false)
      setIsDownloading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-4 mb-2">
          <Link href={`/admin/events/${eventId}/settings`} className="text-blue-600 hover:underline inline-block font-bold">
            ← イベント設定に戻る
          </Link>
        </div>
        
        <h1 className="text-3xl font-black">📊 推しリスト集計・ダウンロード</h1>
        
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-emerald-500 space-y-6">
          <h2 className="text-xl font-bold">集計・ダウンロード設定</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg border">
            <div>
              <label className="block text-sm font-bold mb-2">集計対象</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="music" checked={targetType === 'music'} onChange={() => setTargetType('music')} />
                  <span>音楽</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" value="illustration" checked={targetType === 'illustration'} onChange={() => setTargetType('illustration')} />
                  <span>イラスト</span>
                </label>
              </div>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer font-bold text-sm">
                <input type="checkbox" checked={excludeSelf} onChange={(e) => setExcludeSelf(e.target.checked)} className="w-4 h-4" />
                自推薦分（自分の作品を自分のリストに入れた分）を差し引く
              </label>
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${targetType === 'illustration' ? 'bg-blue-50 border-blue-200' : 'bg-gray-100 opacity-50'}`}>
            <h3 className="font-bold text-blue-800 mb-4">【イラスト限定】ランダム順位・一括ダウンロード</h3>
            <div className="flex flex-wrap gap-6 items-center">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">上位固定枠(N)</label>
                <input 
                  type="number" min="1" max="100" 
                  value={topN} onChange={(e) => setTopN(parseInt(e.target.value) || 1)}
                  className="border p-2 rounded w-24"
                  disabled={targetType !== 'illustration'}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">総枠数(M)</label>
                <input 
                  type="number" min="1" max="300" 
                  value={totalM} onChange={(e) => setTotalM(parseInt(e.target.value) || 1)}
                  className="border p-2 rounded w-24"
                  disabled={targetType !== 'illustration'}
                />
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-3">※上位固定枠は、同率タイの場合もすべて含まれます。<br/>※上位枠が確定した後、残りの枠数分をランダムに抽出し連番を付与します。</p>
          </div>

          <button 
            onClick={handleDownload} 
            disabled={isFetching || isDownloading || targetType !== 'illustration'}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-lg transition text-lg"
          >
            {isFetching ? "集計中..." : isDownloading ? "画像をダウンロード＆ZIP圧縮中..." : "画像一括ダウンロード（ZIP）を実行"}
          </button>
        </div>

        {progressLog.length > 0 && (
          <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs overflow-y-auto max-h-96 shadow-inner">
            <h3 className="text-white font-bold mb-2 sticky top-0 bg-gray-900 pb-2">実行ログ</h3>
            <ul className="space-y-1">
              {progressLog.map((log, idx) => (
                <li key={idx}>{log}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
