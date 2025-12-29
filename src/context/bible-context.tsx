
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
  navigateToVerse: (book: string, chapter: number, verse: number) => void;
  selectedVersion: BibleVersion;
  selectedTagalogVersion: 'ADB' | 'TCB';
  setSelectedTagalogVersion: (version: 'ADB' | 'TCB') => void;
  selectedEnglishVersion: 'KJV';
  setSelectedEnglishVersion: (version: 'KJV') => void;
}

const BibleContext = createContext<BibleContextType | undefined>(undefined);

export function BibleProvider({ children }: { children: ReactNode }) {
  const [selectedBook, setSelectedBook] = useState('Genesis');
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVerse, setInternalSelectedVerse] = useState<number | null>(null);
  const [selectedVersion, setSelectedVersion] = useState<BibleVersion>('KJV');
  const [selectedTagalogVersion, setSelectedTagalogVersion] = useState<'ADB' | 'TCB'>('ADB');
  const [selectedEnglishVersion, setSelectedEnglishVersion] = useState<'KJV'>('KJV');
  
  const { setPassage } = useAppContext();

  const handleSetSelectedBook = (book: string) => {
    setSelectedBook(book);
    setSelectedChapter(1);
    setInternalSelectedVerse(null); // Clear verse selection when changing book
    setPassage(null);
  };

  const handleSetSelectedChapter = (chapter: number) => {
    setSelectedChapter(chapter);
    setInternalSelectedVerse(null); // Clear verse selection when changing chapter
    setPassage(null);
  };

  const setSelectedVerse = (verse: number | null, version: BibleVersion, text: string) => {
    let newPassage: Passage = null;
    
    if (verse === selectedVerse && version === selectedVersion) {
        // If clicking the same verse again, clear the selection and presentation
        setInternalSelectedVerse(null);
        newPassage = null;
    } else {
        // Update the selection in the controller
        setInternalSelectedVerse(verse);
        setSelectedVersion(version);

        if (verse !== null) {
            newPassage = {
                reference: `${selectedBook} ${selectedChapter}:${verse}`,
                text: text,
            };
        }
    }

    // Update the global passage state for presentation and preview
    setPassage(newPassage);
    try {
        if (newPassage) {
          localStorage.setItem('present-passage', JSON.stringify(newPassage));
        } else {
          localStorage.removeItem('present-passage');
        }
    } catch (error) {
        console.error('Could not access local storage:', error);
    }
  }

  const navigateToVerse = (book: string, chapter: number, verse: number) => {
    setSelectedBook(book);
    setSelectedChapter(chapter);
    setInternalSelectedVerse(verse);
    // This function does NOT update the presentation state
  };


  const value = {
    selectedBook,
    setSelectedBook: handleSetSelectedBook,
    selectedChapter,
    setSelectedChapter: handleSetSelectedChapter,
    selectedVerse,
    setSelectedVerse,
    navigateToVerse,
    selectedVersion,
    selectedTagalogVersion,
    setSelectedTagalogVersion,
    selectedEnglishVersion,
    setSelectedEnglishVersion
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
