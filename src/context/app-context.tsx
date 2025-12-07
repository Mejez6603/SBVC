
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Passage = {
  reference: string;
  text: string;
};

interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  textSize: number;
  increaseTextSize: () => void;
  decreaseTextSize: () => void;
  passage: Passage;
  setPassage: (passage: Passage) => void;
  isMinimized: boolean;
  toggleMinimize: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultPassage: Passage = {
  reference: "John 3:16",
  text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life. For God did not send his Son into the world to condemn the world, but in order that the world might be saved through him."
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [textSize, setTextSize] = useState(22);
  const [passage, setPassage] = useState<Passage>(defaultPassage);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    const storedTheme = localStorage.getItem('sbvc-theme') as 'dark' | 'light' | null;
    const initialTheme = storedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.classList.add(initialTheme);
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(newTheme);
      localStorage.setItem('sbvc-theme', newTheme);
      return newTheme;
    });
  };

  const increaseTextSize = () => setTextSize(size => Math.min(size + 2, 48));
  const decreaseTextSize = () => setTextSize(size => Math.max(size - 2, 12));
  const toggleMinimize = () => setIsMinimized(state => !state);

  const value = {
    theme,
    toggleTheme,
    textSize,
    increaseTextSize,
    decreaseTextSize,
    passage,
    setPassage,
    isMinimized,
    toggleMinimize,
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
