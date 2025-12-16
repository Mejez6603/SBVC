
'use client';

import { useBible } from '@/context/bible-context';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';
import * as adbData from '@/lib/adb1905.json';
import * as tcbData from '@/lib/tcb2015.json';

interface SBVCProps {
  version: 'KJV' | 'ADB' | 'TCB';
}

type Verse = {
    verse: number;
    text: string;
}

type BibleData = {
    [book: string]: {
        [chapter: string]: {
            [verse: string]: string;
        };
    };
};

const bibleData: {[key: string]: BibleData} = {
    ADB: adbData as BibleData,
    TCB: tcbData as BibleData,
}

const API_URL = 'https://bible-api.com';

async function fetchKJVChapter(book: string, chapter: number): Promise<Verse[]> {
    try {
        const response = await fetch(`${API_URL}/${book}+${chapter}?translation=kjv`);
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const data = await response.json();
        return data.verses.map((v: any) => ({
            verse: v.verse,
            text: v.text.replace(/\n/g, ' ').trim(),
        }));
    } catch (error) {
        console.error('Failed to fetch KJV chapter:', error);
        return [];
    }
}

function fetchLocalChapter(book: string, chapter: number, version: 'ADB' | 'TCB'): Verse[] {
    const data = bibleData[version];
    if (data && data[book] && data[book][chapter]) {
        return Object.entries(data[book][chapter]).map(([verseNum, text]) => ({
            verse: parseInt(verseNum, 10),
            text: text,
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
    const loadChapter = async () => {
        if (!selectedBook || !selectedChapter) return;
        
        setIsLoading(true);
        setError(null);
        setVerses([]);

        try {
            let fetchedVerses: Verse[] = [];
            if (version === 'KJV') {
                fetchedVerses = await fetchKJVChapter(selectedBook, selectedChapter);
                 if (fetchedVerses.length === 0) {
                    setError('Could not load chapter. Please try a different book or chapter.');
                }
            } else {
                fetchedVerses = fetchLocalChapter(selectedBook, selectedChapter, version);
                if (fetchedVerses.length === 0) {
                    setError(`Data for ${version} is not available in local files. Please populate the corresponding JSON file.`);
                }
            }
            setVerses(fetchedVerses);
        } catch (e) {
            setError('An error occurred while fetching data.');
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
            <p className="text-destructive text-center">{error}</p>
        ) : verses.length > 0 ? verses.map(({verse, text}) => (
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
