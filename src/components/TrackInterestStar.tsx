'use client';

import React from 'react';
import { useFavorites } from '@/context/FavoritesContext';

interface TrackInterestStarProps {
  trackId: number;
}

export default function TrackInterestStar({ trackId }: TrackInterestStarProps) {
  const { interested } = useFavorites();
  
  if (!interested.includes(trackId)) return null;

  return (
    <span className="ml-1 text-yellow-400 text-[10px] animate-pulse drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" title="お気に入り楽曲">
      ★
    </span>
  );
}
