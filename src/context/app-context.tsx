
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Passage = {
  reference: string;
  text: string;
} | null;

export type Hymn = {
    number: number;
    title: string;
    lyrics: string[];
};

interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  passage: Passage;
  setPassage: (passage: Passage) => void;
  hymn: Hymn | null;
  setHymn: (hymn: Hymn | null) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  preset: Hymn[];
  setPreset: (preset: Hymn[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const THEME_KEY = 'sbvc-theme';
const PASSAGE_KEY = 'sbvc-passage';
const BACKGROUND_COLOR_KEY = 'sbvc-background-color';
const PRESET_KEY = 'sbvc-preset';

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [passage, setPassageState] = useState<Passage>(null);
  const [hymn, setHymn] = useState<Hymn | null>(null);
  const [backgroundColor, setBackgroundColorState] = useState<string>('#000000');
  const [preset, setPresetState] = useState<Hymn[]>([]);

  useEffect(() => {
    // Theme initialization
    const storedTheme = localStorage.getItem(THEME_KEY) as 'dark' | 'light' | null;
    setTheme(storedTheme || 'dark');

    // Passage initialization
    const storedPassage = localStorage.getItem(PASSAGE_KEY);
    if (storedPassage) {
      try {
        setPassageState(JSON.parse(storedPassage));
      } catch (error) {
        console.error('Could not parse stored passage:', error);
      }
    }

    // Background color initialization
    const storedBackgroundColor = localStorage.getItem(BACKGROUND_COLOR_KEY);
    if (storedBackgroundColor) {
        setBackgroundColorState(storedBackgroundColor);
    }

    // Preset initialization
    const storedPreset = localStorage.getItem(PRESET_KEY);
    if (storedPreset) {
        try {
            setPresetState(JSON.parse(storedPreset));
        } catch (error) {
            console.error('Could not parse stored preset:', error);
        }
    }

    // Storage event listener
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === THEME_KEY) {
        setTheme(event.newValue as 'dark' | 'light' || 'dark');
      }
      if (event.key === PASSAGE_KEY) {
        if (event.newValue) {
          try {
            setPassageState(JSON.parse(event.newValue));
          } catch (error) {
            console.error('Could not parse stored passage on change:', error);
          }
        } else {
          setPassageState(null);
        }
      }
      if (event.key === BACKGROUND_COLOR_KEY) {
        setBackgroundColorState(event.newValue || '#000000');
      }
      if (event.key === PRESET_KEY) {
        if (event.newValue) {
          try {
            setPresetState(JSON.parse(event.newValue));
          } catch (error) {
            console.error('Could not parse stored preset on change:', error);
          }
        } else {
          setPresetState([]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, newTheme);
      return newTheme;
    });
  };

  const setPassage = (newPassage: Passage) => {
    setPassageState(newPassage);
    if (newPassage) {
      localStorage.setItem(PASSAGE_KEY, JSON.stringify(newPassage));
    } else {
      localStorage.removeItem(PASSAGE_KEY);
    }
  };

  const setBackgroundColor = (color: string) => {
    setBackgroundColorState(color);
    localStorage.setItem(BACKGROUND_COLOR_KEY, color);
  };

  const setPreset = (newPreset: Hymn[]) => {
    setPresetState(newPreset);
    localStorage.setItem(PRESET_KEY, JSON.stringify(newPreset));
  };

  const value = {
    theme,
    toggleTheme,
    passage,
    setPassage,
    hymn,
    setHymn,
    backgroundColor,
    setBackgroundColor,
    preset,
    setPreset,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
