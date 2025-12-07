'use client';

import { useBible } from '@/context/bible-context';
import { oldTestamentBooks, newTestamentBooks } from '@/lib/bible';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';

interface BookListProps {
  testament: 'OLD' | 'NEW';
}

export function BookList({ testament }: BookListProps) {
  const { selectedBook, setSelectedBook } = useBible();
  const books = testament === 'OLD' ? oldTestamentBooks : newTestamentBooks;

  return (
    <ScrollArea className="h-full">
      <div className="p-1">
        {books.map((book) => (
          <button
            key={book}
            onClick={() => setSelectedBook(book)}
            className={cn(
              'w-full text-left px-2 py-1 rounded-sm text-xs',
              selectedBook === book
                ? 'bg-blue-600 text-white'
                : 'hover:bg-accent'
            )}
          >
            {book}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}
