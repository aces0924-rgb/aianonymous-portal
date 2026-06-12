'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

interface PlayerContextType {
  currentTrack: {
    id: number;
    title: string;
    mediaId: string;
    platform: 'youtube' | 'niconico';
  } | null;
  playTrack: (id: number, title: string, songUrl: string, audioUrl?: string) => void;
  closePlayer: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<PlayerContextType['currentTrack']>(null);

  const getYouTubeId = useCallback((url: string) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  }, []);

  const getNiconicoId = useCallback((url: string) => {
    if (!url) return null;
    const regExp = /(?:nicovideo\.jp\/watch\/|nico\.ms\/)(sm\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }, []);

  const getSunoUrl = useCallback((url: string) => {
    if (!url) return null;
    return url.includes('suno.com') ? url : null;
  }, []);

  const playTrack = useCallback((id: number, title: string, songUrl: string, audioUrl?: string) => {
    const urlsToTry = [songUrl, audioUrl].filter(Boolean) as string[];
    
    for (const url of urlsToTry) {
      const sunoUrlMatch = getSunoUrl(url);
      if (sunoUrlMatch) {
        window.open(url, '_blank', 'noopener,noreferrer');
        return;
      }

      const ytId = getYouTubeId(url);
      if (ytId) {
        setCurrentTrack({ id, title, mediaId: ytId, platform: 'youtube' });
        return;
      }
      
      const nicoId = getNiconicoId(url);
      if (nicoId) {
        setCurrentTrack({ id, title, mediaId: nicoId, platform: 'niconico' });
        return;
      }
    }

    alert('対応する動画URL（YouTube または ニコニコ動画）が見つかりませんでした。');
  }, [getYouTubeId, getNiconicoId]);

  const closePlayer = useCallback(() => setCurrentTrack(null), []);

  return (
    <PlayerContext.Provider value={{ currentTrack, playTrack, closePlayer }}>
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
