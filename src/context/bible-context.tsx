'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Passage, useAppContext } from './app-context';

interface BibleContextType {
  selectedBook: string;
  setSelectedBook: (book: string) => void;
  selectedChapter: number;
  setSelectedChapter: (chapter: number) => void;
  selectedVerse: number | null;
  setSelectedVerse: (verse: number | null) => void;
}

const BibleContext = createContext<BibleContextType | undefined>(undefined);

export function BibleProvider({ children }: { children: ReactNode }) {
  const [selectedBook, setSelectedBook] = useState('Genesis');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const { setPassage } = useAppContext();

  useEffect(() => {
    if (selectedVerse) {
        // This is a placeholder for fetching verse text
        const verseText = `This is the text for ${selectedBook} ${selectedChapter}:${selectedVerse}.`;
        setPassage({
            reference: `${selectedBook} ${selectedChapter}:${selectedVerse}`,
            text: verseText
        });
    }
  }, [selectedVerse, selectedBook, selectedChapter, setPassage]);

  const value = {
    selectedBook,
    setSelectedBook: (book: string) => {
      setSelectedBook(book);
      setSelectedChapter(1);
      setSelectedVerse(null);
    },
    selectedChapter,
    setSelectedChapter: (chapter: number) => {
        setSelectedChapter(chapter);
        setSelectedVerse(null);
    },
    selectedVerse,
    setSelectedVerse,
  };

  return <BibleContext.Provider value={value}>{children}</BibleContext.Provider>;
}

export function useBible() {
  const context = useContext(BibleContext);
  if (context === undefined) {
    throw new Error('useBible must be used within a BibleProvider');
  }
  return context;
}
