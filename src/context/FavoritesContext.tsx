'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import StorageDisclaimerModal from '@/components/StorageDisclaimerModal';

interface FavoritesContextType {
  favorites: number[];
  toggleFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;
  clearFavorites: () => void;
  interested: number[];
  toggleInterested: (id: number) => void;
  isInterested: (id: number) => boolean;
  hasSeenDisclaimer: boolean;
  markDisclaimerSeen: () => void;
  MAX_FAVORITES: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = 'vocaloid_fes_favorites';
const STORAGE_KEY_INTERESTED = 'vocaloid_fes_interested';
const STORAGE_KEY_DISCLAIMER = 'vocaloid_fes_storage_disclaimer';

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const [interested, setInterested] = useState<number[]>([]);
  const [hasSeenDisclaimer, setHasSeenDisclaimer] = useState<boolean>(false);
  const [isDisclaimerOpen, setIsDisclaimerOpen] = useState(false);
  const MAX_FAVORITES = 10;

  // Load from LocalStorage on mount
  useEffect(() => {
    const storedFavs = localStorage.getItem(STORAGE_KEY);
    if (storedFavs) {
      try { setFavorites(JSON.parse(storedFavs)); } catch (e) {}
    }
    const storedInterests = localStorage.getItem(STORAGE_KEY_INTERESTED);
    if (storedInterests) {
      try { setInterested(JSON.parse(storedInterests)); } catch (e) {}
    }
    const storedDisclaimer = localStorage.getItem(STORAGE_KEY_DISCLAIMER);
    if (storedDisclaimer === 'true') {
      setHasSeenDisclaimer(true);
    }
  }, []);

  // Save to LocalStorage whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_INTERESTED, JSON.stringify(interested));
  }, [interested]);

  const markDisclaimerSeen = () => {
    setHasSeenDisclaimer(true);
    localStorage.setItem(STORAGE_KEY_DISCLAIMER, 'true');
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
  const isInterested = (id: number) => interested.includes(id);

  const clearFavorites = () => setFavorites([]);

  return (
    <FavoritesContext.Provider value={{ 
      favorites, toggleFavorite, isFavorite, clearFavorites, 
      interested, toggleInterested, isInterested,
      hasSeenDisclaimer, markDisclaimerSeen,
      MAX_FAVORITES 
    }}>
      {children}
      <StorageDisclaimerModal 
        isOpen={isDisclaimerOpen} 
        onClose={() => setIsDisclaimerOpen(false)} 
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
