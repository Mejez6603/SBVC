
'use client';

import { useBible } from '@/context/bible-context';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { useEffect, useState, useRef } from 'react';
import { Skeleton } from './ui/skeleton';

interface SBVCProps {
  version: 'KJV' | 'ADB' | 'TCB';
}

type Verse = {
  verse: number;
  text: string;
};

type ChapterData = {
  [verse: string]: string;
};

type BookData = {
  [chapter: string]: ChapterData;
};

export function SBVC({ version }: SBVCProps) {
  const { selectedBook, selectedChapter, selectedVerse, setSelectedVerse, selectedVersion } = useBible();
  const [verses, setVerses] = useState<Verse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const verseRefs = useRef<Map<number, HTMLButtonElement | null>>(new Map());

  useEffect(() => {
    if (selectedVerse && verseRefs.current.has(selectedVerse)) {
      const verseElement = verseRefs.current.get(selectedVerse);
      verseElement?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [selectedVerse, version, verses]);

  useEffect(() => {
    const loadChapter = async () => {
      if (!selectedBook || !selectedChapter) return;

      setIsLoading(true);
      setError(null);
      setVerses([]);
      verseRefs.current.clear();

      try {
        const bookFileName = selectedBook.toLowerCase().replace(/\s/g, '');
        const versionDir = version.toLowerCase();
        
        const bookModule = await import(`@/lib/bible/${versionDir}/${bookFileName}.json`);
        const bookData: BookData = bookModule.default;
        
        const chapterData = bookData[selectedChapter];

        if (chapterData) {
            const fetchedVerses = Object.entries(chapterData).map(([verseNum, text]) => ({
              verse: parseInt(verseNum, 10),
              text,
            }));
            setVerses(fetchedVerses);
        } else {
             throw new Error(`Chapter ${selectedChapter} not found for ${selectedBook}.`);
        }

      } catch (e: any) {
        setError(`Could not load ${selectedBook}. File not found.`);
        setVerses([]);
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
            ref={(el) => { verseRefs.current.set(verse, el) }}
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
