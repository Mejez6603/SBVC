
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Passage = {
  reference: string;
  text: string;
} | null;

interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  passage: Passage;
  setPassage: (passage: Passage) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const THEME_KEY = 'sbvc-theme';

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [passage, setPassage] = useState<Passage>(null);

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_KEY) as 'dark' | 'light' | null;
    const initialTheme = storedTheme || 'dark';
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_KEY, newTheme);
      } catch (error) {
        console.error('Could not access local storage:', error);
      }
      return newTheme;
    });
  };

  const value = {
    theme,
    toggleTheme,
    passage,
    setPassage,
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
