
'use client';

import { useBible } from '@/context/bible-context';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';

import KJVData from '@/lib/kjv.json';
import ADBData from '@/lib/adb1905.json';
import TCBData from '@/lib/tcb2015.json';

interface SBVCProps {
  version: 'KJV' | 'ADB' | 'TCB';
}

type Verse = {
  verse: number;
  text: string;
};

type BibleData = {
  [book: string]: {
    [chapter: string]: {
      [verse: string]: string;
    };
  };
};

const BIBLE_DATA: { [key in 'KJV' | 'ADB' | 'TCB']: BibleData } = {
  KJV: KJVData as BibleData,
  ADB: ADBData as BibleData,
  TCB: TCBData as BibleData,
};

function getChapterFromLocal(book: string, chapter: number, version: 'KJV' | 'ADB' | 'TCB'): Verse[] {
  const bible = BIBLE_DATA[version];
  if (bible && bible[book] && bible[book][chapter]) {
    const chapterData = bible[book][chapter];
    return Object.entries(chapterData).map(([verseNum, text]) => ({
      verse: parseInt(verseNum, 10),
      text,
    }));
  }
  return [];
}


export function SBVC({ version }: SBVCProps) {
  const { selectedBook, selectedChapter, selectedVerse, setSelectedVerse, selectedVersion } = useBible();
  const [verses, setVerses] = useState<Verse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChapter = () => {
      if (!selectedBook || !selectedChapter) return;

      setIsLoading(true);
      setError(null);
      setVerses([]);

      try {
        const fetchedVerses = getChapterFromLocal(selectedBook, selectedChapter, version);
        if (fetchedVerses.length === 0) {
          setError(`Could not load ${selectedBook} ${selectedChapter} for ${version}. Please ensure the data exists in the local JSON file.`);
        }
        setVerses(fetchedVerses);
      } catch (e: any) {
        setError(e.message || `An error occurred while loading data for ${version}.`);
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };

    loadChapter();
  }, [selectedBook, selectedChapter, version]);

  const handleVerseClick = (verseNumber: number, verseText: string) => {
    setSelectedVerse(verseNumber, version, verseText);
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 text-sm leading-relaxed">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-[95%]" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[98%]" />
            <Skeleton className="h-4 w-[92%]" />
            <Skeleton className="h-4 w-[96%]" />
          </div>
        ) : error ? (
          <p className="text-destructive text-center p-4">{error}</p>
        ) : verses.length > 0 ? verses.map(({ verse, text }) => (
          <button
            key={verse}
            onClick={() => handleVerseClick(verse, text)}
            className={cn(
              'flex items-start gap-2 text-left w-full p-2 rounded-md',
              selectedVerse === verse && selectedVersion === version
                ? 'bg-blue-600 text-white'
                : 'hover:bg-accent'
            )}
          >
            <span className="w-6 font-bold opacity-50">{verse}</span>
            <span className={cn('flex-1', selectedVerse === verse && selectedVersion === version ? 'font-semibold' : '')}>{text}</span>
          </button>
        )) : <p className="text-muted-foreground text-center">Select a book and chapter to view.</p>}
      </div>
    </ScrollArea>
  );
}
