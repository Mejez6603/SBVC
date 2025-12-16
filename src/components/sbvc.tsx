
'use client';

import { useBible } from '@/context/bible-context';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import { Skeleton } from './ui/skeleton';

interface SBVCProps {
  version: 'KJV' | 'ADB' | 'TCB';
}

type Verse = {
    verse: number;
    text: string;
}

const API_URL = 'https://bible-api.com';

async function fetchChapter(book: string, chapter: number, version: string): Promise<Verse[]> {
    // The public API uses 'kjv'. The app uses 'KJV'.
    const apiVersion = version.toLowerCase();
    
    // For now, only KJV is supported by the public API
    if (apiVersion !== 'kjv') {
        // Here you could add logic to fetch from your own data source for ADB and TCB
        console.warn(`${version} is not supported by the public API. Returning empty.`);
        return [];
    }
    
    try {
        const response = await fetch(`${API_URL}/${book}+${chapter}?translation=${apiVersion}`);
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const data = await response.json();
        return data.verses.map((v: any) => ({
            verse: v.verse,
            text: v.text.replace(/\n/g, ' ').trim(), // Clean up verse text
        }));
    } catch (error) {
        console.error('Failed to fetch chapter:', error);
        return [];
    }
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
            const fetchedVerses = await fetchChapter(selectedBook, selectedChapter, version);
            setVerses(fetchedVerses);
            if (fetchedVerses.length === 0 && version === 'KJV') {
              setError('Could not load chapter. Please try a different book or chapter.');
            }
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
        )) : <p className="text-muted-foreground text-center">Select a book and chapter to view, or data for this version is unavailable.</p>}
      </div>
    </ScrollArea>
  );
}
