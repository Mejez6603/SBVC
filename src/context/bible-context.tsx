'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Passage, useAppContext } from './app-context';
import { bibleVersions } from '@/lib/bible';

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
    const updatePresentation = (passage: Passage) => {
      setPassage(passage);
      try {
        if (passage) {
          localStorage.setItem('present-passage', JSON.stringify(passage));
        } else {
          localStorage.removeItem('present-passage');
        }
      } catch (error) {
        console.error('Could not access local storage:', error);
      }
    };

    if (selectedVerse !== null) {
      const kjvText =
        bibleVersions['KJV']?.[selectedBook]?.[selectedChapter]?.[
          selectedVerse
        ] || '';
      const tlvText =
        bibleVersions['TL']?.[selectedBook]?.[selectedChapter]?.[
          selectedVerse
        ] || '';
      const verseText = `${kjvText}\n\n${tlvText}`;

      const newPassage: Passage = {
        reference: `${selectedBook} ${selectedChapter}:${selectedVerse}`,
        text: verseText,
      };
      updatePresentation(newPassage);
    } else {
      updatePresentation(null);
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
