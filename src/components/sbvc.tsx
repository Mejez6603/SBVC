
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
};

const API_URL = 'https://api.scripture.api.bible/v1/bibles';
const API_KEY = 'nhFVKnTausxskioYM6ucy';

const BIBLE_IDS = {
    KJV: 'de4e12af7f28f599-01', // KJV
    ADB: '068596979b4a2ff4-01', // Ang Dating Biblia (1905)
    TCB: 'f93fc3a31c5379e4-01', // Tagalog Contemporary Bible
};

// We need to map book names to the IDs that api.bible uses.
// This is not exhaustive and can be expanded.
const BOOK_IDS: { [key: string]: string } = {
    "Genesis": "GEN", "Exodus": "EXO", "Leviticus": "LEV", "Numbers": "NUM", "Deuteronomy": "DEU", "Joshua": "JOS", "Judges": "JDG", "Ruth": "RUT",
    "1 Samuel": "1SA", "2 Samuel": "2SA", "1 Kings": "1KI", "2 Kings": "2KI", "1 Chronicles": "1CH", "2 Chronicles": "2CH", "Ezra": "EZR",
    "Nehemiah": "NEH", "Esther": "EST", "Job": "JOB", "Psalms": "PSA", "Proverbs": "PRO", "Ecclesiastes": "ECC", "Song of Solomon": "SNG",
    "Isaiah": "ISA", "Jeremiah": "JER", "Lamentations": "LAM", "Ezekiel": "EZK", "Daniel": "DAN", "Hosea": "HOS", "Joel": "JOL", "Amos": "AMO",
    "Obadiah": "OBA", "Jonah": "JON", "Micah": "MIC", "Nahum": "NAH", "Habakkuk": "HAB", "Zephaniah": "ZEP", "Haggai": "HAG", "Zechariah": "ZEC", "Malachi": "MAL",
    "Matthew": "MAT", "Mark": "MRK", "Luke": "LUK", "John": "JHN", "Acts": "ACT", "Romans": "ROM", "1 Corinthians": "1CO", "2 Corinthians": "2CO",
    "Galatians": "GAL", "Ephesians": "EPH", "Philippians": "PHP", "Colossians": "COL", "1 Thessalonians": "1TH", "2 Thessalonians": "2TH",
    "1 Timothy": "1TI", "2 Timothy": "2TI", "Titus": "TIT", "Philemon": "PHM", "Hebrews": "HEB", "James": "JAS", "1 Peter": "1PE", "2 Peter": "2PE",
    "1 John": "1JN", "2 John": "2JN", "3 John": "3JN", "Jude": "JUD", "Revelation": "REV"
};


async function fetchChapterFromApi(book: string, chapter: number, version: 'KJV' | 'ADB' | 'TCB'): Promise<Verse[]> {
  const bibleId = BIBLE_IDS[version];
  const bookId = BOOK_IDS[book];
  
  if (!bookId) {
    console.error(`No book ID found for ${book}`);
    return [];
  }
  
  if (!API_KEY) {
    console.error("API key for api.bible is not configured.");
    throw new Error("API key is missing.");
  }
  
  const passageId = `${bookId}.${chapter}`;

  try {
    const response = await fetch(`${API_URL}/${bibleId}/passages/${passageId}?content-type=text&include-verse-numbers=true`, {
      headers: { 'api-key': API_KEY }
    });

    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data = await response.json();
    
    if (data.data && data.data.content) {
      // The content is returned as a single string with verse numbers in brackets, e.g., "[1] In the beginning..."
      // We need to parse this into our Verse[] structure.
      const content = data.data.content;
      const verseStrings = content.split(/\[(\d+)\]/).filter(Boolean); // Split by [verse_number]
      
      const verses: Verse[] = [];
      for (let i = 0; i < verseStrings.length; i += 2) {
          const verseNum = parseInt(verseStrings[i], 10);
          const verseText = verseStrings[i+1].trim();
          if (!isNaN(verseNum) && verseText) {
              verses.push({ verse: verseNum, text: verseText });
          }
      }
      return verses;
    }
    
    return [];
  } catch (error) {
    console.error(`Failed to fetch chapter from api.bible for ${version}:`, error);
    throw error;
  }
}


export function SBVC({ version }: SBVCProps) {
  const { selectedBook, selectedChapter, selectedVerse, setSelectedVerse, selectedVersion } = useBible();
  const [verses, setVerses] = useState<Verse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Diagnostic function to check API key and available Bibles
    const checkApiKey = async () => {
      console.log('Running API Key Diagnostic...');
      try {
        const response = await fetch(API_URL, {
          headers: { 'api-key': API_KEY }
        });
        const data = await response.json();
        if (!response.ok) {
          console.error('API Key Diagnostic FAILED:', data);
        } else {
          console.log('API Key Diagnostic SUCCESS. Available Bibles:', data.data);
        }
      } catch (e) {
        console.error('API Key Diagnostic FAILED with error:', e);
      }
    };
    checkApiKey();
  }, []);

  useEffect(() => {
    const loadChapter = async () => {
      if (!selectedBook || !selectedChapter) return;

      setIsLoading(true);
      setError(null);
      setVerses([]);

      try {
        const fetchedVerses = await fetchChapterFromApi(selectedBook, selectedChapter, version);
        if (fetchedVerses.length === 0) {
          setError('Could not load chapter. The book may not be available in this translation or the API key is invalid/missing.');
        }
        setVerses(fetchedVerses);
      } catch (e: any) {
        setError(`An error occurred while fetching data: ${e.message}`);
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
