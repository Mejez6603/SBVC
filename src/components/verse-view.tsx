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
          <p key={verse} className="mb-2">
            <button
              onClick={() => setSelectedVerse(verse)}
              className={cn(
                'mr-2 font-bold p-1 rounded-sm',
                selectedVerse === verse ? 'bg-blue-600 text-white' : ''
              )}
            >
              {verse}
            </button>
            <span className={cn(selectedVerse === verse ? 'font-bold' : '')}>{text}</span>
          </p>
        )) : <p>Select a book and chapter to view.</p>}
      </div>
    </ScrollArea>
  );
}
