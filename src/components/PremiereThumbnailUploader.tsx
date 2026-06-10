'use client';

import React, { useState } from 'react';
import { uploadPremiereThumbnail } from '@/app/actions/thumbnailActions';

interface PremiereThumbnailUploaderProps {
  day: number;
  size?: 'normal' | 'large';
}

export default function PremiereThumbnailUploader({ day, size = 'normal' }: PremiereThumbnailUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    // 画像ファイルチェック
    if (!file.type.startsWith('image/')) {
      alert('画像ファイルを選択してください。');
      return;
    }

    const confirmUpload = window.confirm(
      `Day ${String(day).padStart(2, '0')} 用のプレミア公開サムネイルをアップロードします。\n\nファイル名: ${String(day).padStart(2, '0')}DAYS_プレミアサムネ\n\nよろしいですか？`
    );
    if (!confirmUpload) {
      e.target.value = '';
      return;
    }

    setIsUploading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadPremiereThumbnail(day, formData);

      if (result.success) {
        setStatus('success');
        alert(`Day ${String(day).padStart(2, '0')} のプレミア公開サムネイルをアップロードしました！`);
      } else {
        setStatus('error');
        setErrorMessage(result.error || 'アップロードに失敗しました。');
        alert(result.error || 'アップロードに失敗しました。');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage('通信エラーが発生しました。');
      alert('通信エラーが発生しました。');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  // ボタンのクラス名（通常サイズとFeaturedのデカボタンサイズに対応）
  const baseClasses = "w-full rounded-2xl border transition-all text-center font-black tracking-widest cursor-pointer select-none relative overflow-hidden flex items-center justify-center gap-2";
  const sizeClasses = size === 'large' 
    ? "py-6 text-2xl" 
    : "py-4 text-[10px]";

  let stateClasses = "";
  let displayText = "サムネイルを応募する";

  if (isUploading) {
    stateClasses = "bg-[var(--color-cyan-500)]/40 border-[var(--color-cyan-400)]/50 text-[var(--color-cyan-400)] animate-pulse cursor-not-allowed";
    displayText = "応募中...";
  } else if (status === 'success') {
    stateClasses = "bg-green-950/20 border-green-500/50 text-green-400 cursor-not-allowed";
    displayText = "応募完了！";
  } else if (status === 'error') {
    stateClasses = "bg-red-950/20 border-red-500/50 text-red-400";
    displayText = "応募失敗";
  } else {
    // デフォルト（活性状態のシアン色デザイン）
    stateClasses = "bg-[var(--color-cyan-500)]/20 border-[var(--color-cyan-400)]/30 text-[var(--color-cyan-400)] hover:bg-[var(--color-cyan-500)] hover:text-black hover:border-[var(--color-cyan-400)] shadow-[0_0_15px_var(--color-glow)]";
    if (isHovered) {
      displayText = "クリックしてサムネを応募";
    }
  }

  return (
    <div className="w-full">
      {/* 
        【超重要：iOS Safariの極悪バグ対策】
        1. iOS Safariでは、labelタグのクリックイベントが「onclick属性/リスナー」または「cursor: pointerスタイル」が
           インラインまたは明示的に指定されていないと無視されるバグがあります。そのため、onClick={() => {}} を追加しています。
        2. labelの中に直接 input をネストし、styleで cursor: 'pointer' をインラインで強制適用することで、
           スマホ実機でのタップ感知とアップローダーの起動を100%確実に保証します。
      */}
      <label
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {}} 
        className={`${baseClasses} ${sizeClasses} ${stateClasses}`}
        style={{ cursor: 'pointer' }}
      >
        <input 
          type="file" 
          onChange={handleFileChange} 
          disabled={isUploading}
          accept="image/*" 
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            padding: '0',
            margin: '-1px',
            overflow: 'hidden',
            clip: 'rect(0, 0, 0, 0)',
            whiteSpace: 'nowrap',
            border: '0',
          }}
        />
        {isUploading && (
          <svg className="animate-spin h-4 w-4 text-[var(--color-cyan-400)]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {displayText}
      </label>
    </div>
  );
}
