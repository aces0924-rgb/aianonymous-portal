'use client'

import { useState } from 'react'

const processText = (text: string) => {
  if (!text) return '';
  // HTMLエスケープ処理
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  
  // URLのリンク化
  const linked = escaped.replace(
    /(https?:\/\/[^\s]+)/g, 
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-[var(--color-cyan-400)] underline hover:text-[var(--color-cyan-500)] transition-colors break-all">$1</a>'
  );
  
  // 改行の変換
  return linked.replace(/\n/g, '<br/>');
};

export default function AnalysisTabs({ analysis, review, defaultLabels = {} }: { analysis: string | null, review: string | null, defaultLabels?: any }) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'review'>(review && !analysis ? 'review' : 'analysis')

  if (!analysis && !review) return null

  return (
    <div className="space-y-0 animate-in fade-in duration-700">
      <div className="flex justify-center gap-8 md:gap-16 border-b border-white/5 pb-px">
        {analysis && (
          <button
            onClick={() => setActiveTab('analysis')}
            className={`px-4 text-lg md:text-2xl font-black tracking-tighter transition-all relative ${
              activeTab === 'analysis' ? 'text-purple-400 drop-shadow-[0_0_10px_rgba(188,19,254,0.5)]' : 'text-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-baseline gap-2 md:gap-3">
              <span className="relative pb-3">
                {defaultLabels.analysisTab || '歌詞考察'}
                {activeTab === 'analysis' && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500 shadow-[0_0_15px_#bc13fe] block"></span>
                )}
              </span>
              <span className="text-xs md:text-sm font-medium text-foreground tracking-normal pb-3">
                {defaultLabels.analysisNote || '※AIが歌詞から導き出した独自の考察です。制作者の意図や公式の解釈を示すものではありません。'}
              </span>
            </span>
          </button>
        )}
        {review && (
          <button
            onClick={() => setActiveTab('review')}
            className={`px-4 text-lg md:text-2xl font-black tracking-tighter transition-all relative ${
              activeTab === 'review' ? 'text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'text-foreground hover:text-foreground'
            }`}
          >
            <span className="relative pb-3 inline-block">
              楽曲考察
              {activeTab === 'review' && (
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 shadow-[0_0_15px_#3b82f6] block"></span>
              )}
            </span>
          </button>
        )}
      </div>

      <div className="bg-surface/40 border border-surface-border rounded-3xl pt-4 md:pt-6 p-8 md:p-12 min-h-[300px] relative backdrop-blur-sm">
        {activeTab === 'analysis' && analysis && (
          <div className="animate-in zoom-in-95 fade-in duration-500 w-full">
            <div className="prose prose-invert max-w-none prose-p:leading-[1.8] prose-headings:text-purple-400">
              <div 
                className="text-lg md:text-2xl font-medium text-foreground tracking-wide text-left"
                dangerouslySetInnerHTML={{ __html: processText(analysis) }} 
              />
            </div>
          </div>
        )}

        {activeTab === 'review' && review && (
          <div className="animate-in zoom-in-95 fade-in duration-500 w-full">
            <div className="prose prose-invert max-w-none prose-p:leading-[1.8] prose-headings:text-blue-400">
              <div 
                className="text-lg md:text-2xl font-medium text-foreground tracking-wide text-left"
                dangerouslySetInnerHTML={{ __html: processText(review) }} 
              />
            </div>
          </div>
        )}

        {(!activeTab || (activeTab === 'analysis' && !analysis) || (activeTab === 'review' && !review)) && (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-surface-border border-t-cyan-500 rounded-full animate-spin"></div>
            <p className="text-foreground font-mono">SYSTEM_WAITING...</p>
          </div>
        )}
      </div>
    </div>
  )
}
