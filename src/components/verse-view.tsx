'use client';

import { useBible } from '@/context/bible-context';
import { bibleVersions } from '@/lib/bible';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface VerseViewProps {
  version: 'KJV' | 'TL';
}

type Verse = {
    verse: number;
    text: string;
}

export function VerseView({ version }: VerseViewProps) {
  const { selectedBook, selectedChapter, selectedVerse, setSelectedVerse } = useBible();
  const [verses, setVerses] = useState<Verse[]>([]);
  
  useEffect(() => {
    const bibleData = bibleVersions[version];
    if (bibleData && bibleData[selectedBook] && bibleData[selectedBook][selectedChapter]) {
      const chapterData = bibleData[selectedBook][selectedChapter];
      const versesArray = Object.entries(chapterData).map(([verseNum, text]) => ({
          verse: parseInt(verseNum, 10),
          text,
      }));
      setVerses(versesArray);
    } else {
      setVerses([]);
    }
  }, [selectedBook, selectedChapter, version]);

  return (
    <ScrollArea className="h-full">
      <div className="p-4 text-sm leading-relaxed">
        {verses.length > 0 ? verses.map(({verse, text}) => (
          <button
            key={verse}
            onClick={() => setSelectedVerse(verse)}
            className={cn(
              'flex items-start gap-2 text-left w-full p-2 rounded-md',
              selectedVerse === verse
                ? 'bg-blue-600 text-white'
                : 'hover:bg-accent'
            )}
          >
            <span className="w-6 font-bold opacity-50">{verse}</span>
            <span className={cn('flex-1', selectedVerse === verse ? 'font-semibold' : '')}>{text}</span>
          </button>
        )) : <p>Select a book and chapter to view.</p>}
      </div>
    </ScrollArea>
  );
}
