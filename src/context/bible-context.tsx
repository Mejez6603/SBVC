
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Passage, useAppContext } from './app-context';

type BibleVersion = 'KJV' | 'ADB' | 'TCB';

interface BibleContextType {
  selectedBook: string;
  setSelectedBook: (book: string) => void;
  selectedChapter: number;
  setSelectedChapter: (chapter: number) => void;
  selectedVerse: number | null;
  setSelectedVerse: (verse: number | null, version: BibleVersion, text: string) => void;
  selectedVersion: BibleVersion;
  selectedTagalogVersion: 'ADB' | 'TCB';
  setSelectedTagalogVersion: (version: 'ADB' | 'TCB') => void;
}

const BibleContext = createContext<BibleContextType | undefined>(undefined);

export function BibleProvider({ children }: { children: ReactNode }) {
  const [selectedBook, setSelectedBook] = useState('Genesis');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVerse, setInternalSelectedVerse] = useState<number | null>(null);
  const [selectedVerseText, setSelectedVerseText] = useState<string>('');
  const [selectedVersion, setSelectedVersion] = useState<BibleVersion>('KJV');
  const [selectedTagalogVersion, setSelectedTagalogVersion] = useState<'ADB' | 'TCB'>('ADB');
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

    if (selectedVerse !== null && selectedBook && selectedChapter && selectedVerseText) {
      const newPassage: Passage = {
        reference: `${selectedBook} ${selectedChapter}:${selectedVerse}`,
        text: selectedVerseText,
      };
      updatePresentation(newPassage);
    } else {
        updatePresentation(null);
    }
  }, [selectedVerse, selectedBook, selectedChapter, selectedVersion, selectedVerseText, setPassage]);

  const setSelectedVerse = (verse: number | null, version: BibleVersion, text: string) => {
    setInternalSelectedVerse(verse);
    setSelectedVersion(version);
    setSelectedVerseText(text);
  }

  const value = {
    selectedBook,
    setSelectedBook: (book: string) => {
      setSelectedBook(book);
      setSelectedChapter(1);
      setInternalSelectedVerse(null);
      setSelectedVerseText('');
    },
    selectedChapter,
    setSelectedChapter: (chapter: number) => {
      setSelectedChapter(chapter);
      setInternalSelectedVerse(null);
      setSelectedVerseText('');
    },
    selectedVerse,
    setSelectedVerse,
    selectedVersion,
    selectedTagalogVersion,
    setSelectedTagalogVersion
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
