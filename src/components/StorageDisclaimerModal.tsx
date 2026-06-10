'use client';

import React, { useState } from 'react';
import { useFavorites } from '@/context/FavoritesContext';

interface StorageDisclaimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StorageDisclaimerModal({ isOpen, onClose }: StorageDisclaimerModalProps) {
  const { markDisclaimerSeen } = useFavorites();
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (dontShowAgain) {
      markDisclaimerSeen();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-md"></div>
      
      {/* Modal Content */}
      <div className="relative bg-surface border-2 border-amber-500/50 rounded-[2.5rem] w-full max-w-md p-8 md:p-10 shadow-[0_0_50px_rgba(245,158,11,0.2)] overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-[50px] rounded-full"></div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-4">
            <span className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-2xl">
              ⚠️
            </span>
            <h2 className="text-2xl font-black text-foreground tracking-tighter italic">
              データ保存に関するご注意
            </h2>
          </div>

          <div className="space-y-4 text-foreground/80 leading-relaxed font-medium">
            <p className="text-sm">
              『気になる曲』や『推し候補』のチェック状態は、お客様の<span className="text-amber-400 font-bold underline decoration-amber-900">ブラウザ内に一時的に保存</span>されます。
            </p>
            <div className="bg-background/40 p-4 rounded-2xl border border-surface-border space-y-2">
              <p className="text-xs flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>端末を変えたりキャッシュを消去するとリストがリセットされますのでご注意ください。</span>
              </p>
              <p className="text-xs flex items-start gap-2">
                <span className="text-amber-500">•</span>
                <span>確実な管理には、ブラウザのブックマーク機能やYouTube側のGoodボタンによる管理をお勧めします。</span>
              </p>
            </div>
          </div>

          <div className="pt-4 space-y-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center w-6 h-6 rounded-lg border-2 border-surface-border bg-gray-800 group-hover:border-amber-500/50 transition-all">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="peer absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className={`w-3 h-3 rounded-sm bg-amber-500 transition-all ${dontShowAgain ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}></div>
              </div>
              <span className="text-xs font-bold text-foreground/60 group-hover:text-foreground transition-colors">
                内容を理解しました。以降は表示しない
              </span>
            </label>

            <button
              onClick={handleConfirm}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-foreground font-black tracking-widest hover:from-amber-500 hover:to-orange-500 transition-all active:scale-95 shadow-lg shadow-amber-900/20"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
