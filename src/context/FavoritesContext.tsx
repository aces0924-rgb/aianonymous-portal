'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import StorageDisclaimerModal from '@/components/StorageDisclaimerModal';
import HelpModal from '@/components/HelpModal';

interface FavoritesContextType {
  favorites: number[];
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  clearFavorites: () => void;
  illustrationFavorites: number[];
  toggleIllustrationFavorite: (id: number) => void;
  isIllustrationFavorite: (id: number) => boolean;
  clearIllustrationFavorites: () => void;
  MAX_ILLUST_FAVORITES: number;
  enableArtistMain: boolean;
  interested: number[];
  toggleInterested: (id: number) => void;
  isInterested: (id: number) => boolean;
  hasSeenDisclaimer: boolean;
  markDisclaimerSeen: () => void;
  MAX_FAVORITES: number;
  hasSeenHelp: boolean;
  markHelpSeen: (seen: boolean) => void;
  isHelpOpen: boolean;
  openHelp: () => void;
  closeHelp: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode, enableArtistMain?: boolean }> = ({ children, enableArtistMain = false }) => {
  const params = useParams();
  const eventSlug = (params?.eventSlug as string) || 'default';

  const STORAGE_KEY = `vocaloid_fes_favorites_${eventSlug}`;
  const STORAGE_KEY_ILLUST = `vocaloid_fes_illust_favorites_${eventSlug}`;
  const STORAGE_KEY_INTERESTED = `vocaloid_fes_interested_${eventSlug}`;
  const STORAGE_KEY_DISCLAIMER = `vocaloid_fes_storage_disclaimer_${eventSlug}`;
  const STORAGE_KEY_HELP = `vocaloid_fes_has_seen_help_${eventSlug}`;
  const [favorites, setFavorites] = useState<number[]>([]);
  const [illustrationFavorites, setIllustrationFavorites] = useState<number[]>([]);
  const [interested, setInterested] = useState<number[]>([]);
  const [hasSeenDisclaimer, setHasSeenDisclaimer] = useState<boolean>(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const [hasSeenHelp, setHasSeenHelp] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const MAX_FAVORITES = 10;
  const MAX_ILLUST_FAVORITES = 10;

  // Load from LocalStorage on mount or when eventSlug changes
  useEffect(() => {
    const storedFavs = localStorage.getItem(STORAGE_KEY);
    if (storedFavs) {
      try { setFavorites(JSON.parse(storedFavs)); } catch (e) { setFavorites([]); }
    } else {
      setFavorites([]);
    }

    const storedIllustFavs = localStorage.getItem(STORAGE_KEY_ILLUST);
    if (storedIllustFavs) {
      try { setIllustrationFavorites(JSON.parse(storedIllustFavs)); } catch (e) { setIllustrationFavorites([]); }
    } else {
      setIllustrationFavorites([]);
    }

    const storedInterests = localStorage.getItem(STORAGE_KEY_INTERESTED);
    if (storedInterests) {
      try { setInterested(JSON.parse(storedInterests)); } catch (e) { setInterested([]); }
    } else {
      setInterested([]);
    }

    const storedDisclaimer = localStorage.getItem(STORAGE_KEY_DISCLAIMER);
    if (storedDisclaimer) {
      setHasSeenDisclaimer(true);
    }

    const storedHelp = localStorage.getItem(STORAGE_KEY_HELP);
    if (storedHelp === 'true') {
      setHasSeenHelp(true);
    }
  }, [eventSlug]);

  // Save to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites, STORAGE_KEY]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ILLUST, JSON.stringify(illustrationFavorites));
  }, [illustrationFavorites, STORAGE_KEY_ILLUST]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INTERESTED, JSON.stringify(interested));
  }, [interested, STORAGE_KEY_INTERESTED]);

  const markDisclaimerSeen = () => {
    localStorage.setItem(STORAGE_KEY_DISCLAIMER, 'true');
    setHasSeenDisclaimer(true);
  };

  const toggleFavorite = (id: number) => {
    if (!hasSeenDisclaimer && !favorites.includes(id)) {
      setIsDisclaimerOpen(true);
    }
    setFavorites((prev) => {
      if (prev.includes(id)) return prev.filter((fid) => fid !== id);
      if (prev.length >= MAX_FAVORITES) {
        alert(`推し曲は最大${MAX_FAVORITES}曲までです。`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const toggleIllustrationFavorite = (id: number) => {
    if (!enableArtistMain) {
      return toggleFavorite(id);
    }
    if (!hasSeenDisclaimer && !illustrationFavorites.includes(id)) {
      setIsDisclaimerOpen(true);
    }
    setIllustrationFavorites((prev) => {
      if (prev.includes(id)) return prev.filter((fid) => fid !== id);
      if (prev.length >= MAX_ILLUST_FAVORITES) {
        alert(`推しイラストは最大${MAX_ILLUST_FAVORITES}作品までです。`);
        return prev;
      }
      return [...prev, id];
    });
  };

  const toggleInterested = (id: number) => {
    if (!hasSeenDisclaimer && !interested.includes(id)) {
      setIsDisclaimerOpen(true);
    }
    setInterested((prev) => {
      if (prev.includes(id)) return prev.filter((fid) => fid !== id);
      return [...prev, id];
    });
  };

  const isFavorite = (id: number) => favorites.includes(id);
  const isIllustrationFavorite = (id: number) => {
    if (!enableArtistMain) return favorites.includes(id);
    return illustrationFavorites.includes(id);
  };
  const isInterested = (id: number) => interested.includes(id);

  const clearFavorites = () => setFavorites([]);
  const clearIllustrationFavorites = () => setIllustrationFavorites([]);

  const markHelpSeen = (seen: boolean) => {
    localStorage.setItem(STORAGE_KEY_HELP, seen ? 'true' : 'false');
    setHasSeenHelp(seen);
  };

  const openHelp = () => setIsHelpOpen(true);
  const closeHelp = () => setIsHelpOpen(false);

  return (
    <FavoritesContext.Provider value={{
      favorites,
      toggleFavorite,
      isFavorite,
      clearFavorites,
      illustrationFavorites,
      toggleIllustrationFavorite,
      isIllustrationFavorite,
      clearIllustrationFavorites,
      MAX_ILLUST_FAVORITES,
      enableArtistMain,
      interested,
      toggleInterested,
      isInterested,
      hasSeenDisclaimer,
      markDisclaimerSeen,
      MAX_FAVORITES,
      hasSeenHelp,
      markHelpSeen,
      isHelpOpen,
      openHelp,
      closeHelp,
    }}>
      {children}
      <StorageDisclaimerModal
        isOpen={isDisclaimerOpen}
        onClose={() => setIsDisclaimerOpen(false)}
      />
      <HelpModal
        isOpen={isHelpOpen}
        onClose={closeHelp}
        enableArtistMain={enableArtistMain}
      />
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
