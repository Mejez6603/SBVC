
'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAppContext, Passage } from './app-context';

interface BibleContextType {
  selectedBook: string | null;
  setSelectedBook: (book: string) => void;
  selectedChapter: number | null;
  setSelectedChapter: (chapter: number) => void;
  selectedVerse: number | null;
  selectedVersion: 'KJV' | 'ADB' | 'TCB' | null;
  setSelectedVerse: (verse: number, version: 'KJV' | 'ADB' | 'TCB', text: string) => void;
  selectedTagalogVersion: 'ADB' | 'TCB';
  setSelectedTagalogVersion: (version: 'ADB' | 'TCB') => void;
  selectedEnglishVersion: 'KJV';
  setSelectedEnglishVersion: (version: 'KJV') => void;
}

const BibleContext = createContext<BibleContextType | undefined>(undefined);

export function BibleProvider({ children }: { children: ReactNode }) {
  const { theme, setPassage, setBackgroundColor } = useAppContext();
  const [selectedBook, setSelectedBookState] = useState<string | null>(() => 
    typeof window !== 'undefined' ? localStorage.getItem('selectedBook') : null
  );
  const [selectedChapter, setSelectedChapterState] = useState<number | null>(() => {
      if (typeof window === 'undefined') return null;
      const savedChapter = localStorage.getItem('selectedChapter');
      return savedChapter ? parseInt(savedChapter, 10) : null;
  });
  const [selectedVerse, setSelectedVerseState] = useState<number | null>(null);
  const [selectedVersion, setSelectedVersionState] = useState<'KJV' | 'ADB' | 'TCB' | null>(null);
  const [selectedTagalogVersion, setSelectedTagalogVersionState] = useState<'ADB' | 'TCB'>('ADB');
  const [selectedEnglishVersion, setSelectedEnglishVersionState] = useState<'KJV'>('KJV');


  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (selectedBook) localStorage.setItem('selectedBook', selectedBook);
      if (selectedChapter) localStorage.setItem('selectedChapter', selectedChapter.toString());
    }
  }, [selectedBook, selectedChapter]);

  const setSelectedBook = (book: string) => {
    setSelectedBookState(book);
    setSelectedChapterState(1); // Reset to chapter 1 when a new book is selected
    setSelectedVerseState(null);
    setPassage(null);
  };

  const setSelectedChapter = (chapter: number) => {
    setSelectedChapterState(chapter);
    setSelectedVerseState(null);
    setPassage(null);
  };

  const setSelectedVerse = (verse: number, version: 'KJV' | 'ADB' | 'TCB', text: string) => {
    setSelectedVerseState(verse);
    setSelectedVersionState(version);
    if (selectedBook && selectedChapter) {
      const passage: Passage = {
        reference: `${selectedBook} ${selectedChapter}:${verse}`,
        text: text,
      };
      setPassage(passage);
      setBackgroundColor(theme === 'dark' ? '#000000' : '#FFFFFF');
    }
  };
  
  const setSelectedTagalogVersion = (version: 'ADB' | 'TCB') => {
    setSelectedTagalogVersionState(version);
  };

  const setSelectedEnglishVersion = (version: 'KJV') => {
    setSelectedEnglishVersionState(version);
  }

  return (
    <BibleContext.Provider
      value={{
        selectedBook,
        setSelectedBook,
        selectedChapter,
        setSelectedChapter,
        selectedVerse,
        selectedVersion,
        setSelectedVerse,
        selectedTagalogVersion,
        setSelectedTagalogVersion,
        selectedEnglishVersion,
        setSelectedEnglishVersion
      }}
    >
      {children}
    </BibleContext.Provider>
  );
}

export const useBible = () => {
  const context = useContext(BibleContext);
  if (context === undefined) {
    throw new Error('useBible must be used within a BibleProvider');
  }
  return context;
};
