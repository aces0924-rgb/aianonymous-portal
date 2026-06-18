'use client';

import React, { useState } from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmShowAgain?: (dontShowAgain: boolean) => void;
  enableArtistMain?: boolean;
}

export default function HelpModal({ isOpen, onClose, onConfirmShowAgain, enableArtistMain = false }: HelpModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirmShowAgain) {
      onConfirmShowAgain(dontShowAgain);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md" onClick={onClose}></div>
      
      {/* Modal Content */}
      <div className="relative bg-surface border-2 border-[var(--color-cyan-400)]/50 rounded-[2.5rem] w-full max-w-md p-6 md:p-8 shadow-[0_0_50px_rgba(0,240,255,0.2)] overflow-hidden max-h-[90vh] flex flex-col">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-cyan-500)]/10 blur-[50px] rounded-full"></div>
        
        <div className="relative z-10 flex flex-col h-full overflow-hidden">
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <span className="w-10 h-10 rounded-full bg-[var(--color-cyan-400)]/20 flex items-center justify-center text-xl border border-[var(--color-cyan-400)]/50 text-[var(--color-cyan-400)] font-black">
              ?
            </span>
            <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tighter">
              推しリストの作り方
            </h2>
          </div>

          <div className="space-y-6 text-foreground leading-relaxed font-medium overflow-y-auto custom-scrollbar pr-2 pb-4">
            
            {/* Step 1 */}
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
              <h3 className="text-[var(--color-cyan-400)] font-black text-sm flex items-center gap-2">
                <span className="bg-[var(--color-cyan-400)] text-black px-2 py-0.5 rounded-md">STEP 1</span>
                作品をチェック！
              </h3>
              <p className="text-xs text-gray-300">
                気になった楽曲やイラストがあったら、「ハートボタン（推し候補）」を押してリストに入れよう！<br/>
                （最大10枠まで選べます）
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
              <h3 className="text-[var(--color-cyan-400)] font-black text-sm flex items-center gap-2">
                <span className="bg-[var(--color-cyan-400)] text-black px-2 py-0.5 rounded-md">STEP 2</span>
                推薦リストを作成！
              </h3>
              <p className="text-xs text-gray-300">
                推し候補を<strong className="text-white">「5つ以上」</strong>選ぶと、画面下のバーから「推薦する」ボタンが押せるようになります。
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
              <h3 className="text-[var(--color-cyan-400)] font-black text-sm flex items-center gap-2">
                <span className="bg-[var(--color-cyan-400)] text-black px-2 py-0.5 rounded-md">STEP 3</span>
                想いを込めて送信！
              </h3>
              <p className="text-xs text-gray-300">
                あなたのニックネームと、おすすめポイント（任意）を記入して送信すれば完了です！
              </p>
            </div>

            {/* 注意事項 */}
            <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20 space-y-2 mt-4">
              <p className="text-xs font-bold text-red-400 flex items-center gap-1">
                <span>⚠️</span> 注意事項
              </p>
              <ul className="text-[11px] text-gray-300 space-y-1 pl-4 list-disc marker:text-red-500">
                <li>同じ名前でのリスト作成は「3回」までとなります。</li>
                <li>過去に一度選んだ作品を、別のリストで再度選ぶことはできません。</li>
                {enableArtistMain && (
                  <li className="text-fuchsia-300">楽曲とイラストは別々にリストを作ることができます。</li>
                )}
              </ul>
            </div>
          </div>

          <div className="pt-4 space-y-4 shrink-0 mt-auto bg-surface border-t border-white/5">
            {onConfirmShowAgain && (
              <label className="flex items-center justify-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center w-5 h-5 rounded border-2 border-surface-border bg-gray-800 group-hover:border-[var(--color-cyan-400)] transition-all">
                  <input
                    type="checkbox"
                    checked={dontShowAgain}
                    onChange={(e) => setDontShowAgain(e.target.checked)}
                    className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
                  />
                  <div className={`w-2.5 h-2.5 rounded-sm bg-[var(--color-cyan-400)] transition-all ${dontShowAgain ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}></div>
                </div>
                <span className="text-xs font-bold text-gray-400 group-hover:text-white transition-colors">
                  次回から表示しない
                </span>
              </label>
            )}

            <button
              onClick={handleConfirm}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-cyan-400)] to-blue-600 text-white font-black tracking-widest hover:from-[var(--color-cyan-500)] hover:to-blue-700 transition-all active:scale-95 shadow-lg shadow-cyan-900/20"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
