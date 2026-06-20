'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { encodeSelectionId } from '@/lib/id-utils';

interface ShareButtonProps {
  userName: string;
  id?: number; // Optional id for numeric URL
  basePostUrl?: string; // URL of the post to be quoted/appended
  type?: 'song' | 'illustration'; // シェアのタイプ（デフォルトはsong）
  shareHashtag?: string; // カスタムハッシュタグ
  siteTitle?: string; // イベントのタイトル
}

export default function ShareButton({ userName, id, basePostUrl, type = 'song', shareHashtag = '#アノフェス', siteTitle = 'AI-anonymous MUSIC FES.' }: ShareButtonProps) {
  const params = useParams();
  const eventSlug = params?.eventSlug as string || '';

  const handleShare = () => {
    // Use production URL if available, otherwise fallback to current origin
    const origin = window.location.origin.includes('localhost') 
      ? 'https://aianonymous.vercel.app' 
      : window.location.origin;
    
    // Construct URL: use numeric ID if available, otherwise fallback to userName
    const pathSegment = id ? encodeSelectionId(id) : encodeURIComponent(userName);
    const basePath = type === 'illustration' ? '/selection/illustration' : '/selection';
    const eventPrefix = eventSlug ? `/${eventSlug}` : '';
    const shareUrl = `${origin}${eventPrefix}${basePath}/${pathSegment}`;
    
    const shareSubject = type === 'illustration' ? '「推しイラスト」' : '「推し曲」';
    let text = `【${siteTitle}】\n${userName}さんの${shareSubject}はこれ！\n\n${shareHashtag}\n\n${shareUrl}\n`;
    
    // Append the base post URL if provided (for quote-like behavior) at the very end
    if (basePostUrl) {
      text += `\n${basePostUrl}`;
    }
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    
    window.open(twitterUrl, '_blank', 'noreferrer');
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-3 px-8 py-4 bg-white text-black rounded-full font-black text-lg hover:bg-[var(--color-cyan-500)] hover:text-black transition-all shadow-[0_0_25px_rgba(255,255,255,0.2)] hover:shadow-[0_0_35px_var(--color-glow)] active:scale-95 group"
    >
      <span className="text-2xl">𝕏</span>
      <span>このリストを𝕏で共有する</span>
    </button>
  );
}
