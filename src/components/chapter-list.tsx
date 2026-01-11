'use client';

import { useBible } from '@/context/bible-context';
import { bookChapters } from '@/lib/bible';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

export function ChapterList() {
  const { selectedBook, selectedChapter, setSelectedChapter } = useBible();
  
  if (!selectedBook) {
    return (
        <div className="w-[60px] border-r flex flex-col items-center justify-center">
            <p className="text-xs text-muted-foreground p-2 text-center">Select a book</p>
        </div>
    );
  }

  const numChapters = bookChapters[selectedBook] || 0;

  return (
    <div className="w-[60px] border-r flex flex-col">
      <div className="p-2 border-b text-center font-semibold text-xs">#</div>
      <ScrollArea className="flex-1">
        <div className="p-1">
          {Array.from({ length: numChapters }, (_, i) => i + 1).map(
            (chapter) => (
              <button
                key={chapter}
                onClick={() => setSelectedChapter(chapter)}
                className={cn(
                  'w-full text-center px-2 py-1 rounded-sm text-xs',
                  selectedChapter === chapter
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-accent'
                )}
              >
                {chapter}
              </button>
            )
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
