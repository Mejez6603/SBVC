'use client';

import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Loader, Search as SearchIcon } from 'lucide-react';
import { useState } from 'react';
import { suggestRelevantPassages } from '@/ai/flows/suggest-relevant-passages';
import { useBible } from '@/context/bible-context';

export function Notepad() {
  const [topic, setTopic] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { setSelectedBook, setSelectedChapter } = useBible();

  const handleSearch = async () => {
    if (!topic) return;
    setIsLoading(true);
    try {
      const result = await suggestRelevantPassages({ topic });
      setSuggestions(result.passages);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
      setSuggestions(['Failed to load suggestions.']);
    }
    setIsLoading(false);
  };
  
  const handleSuggestionClick = (passage: string) => {
    // Example: "John 3:16" or "1 John 3:16"
    const match = passage.match(/(\d?\s?[a-zA-Z\s]+)\s(\d+):(\d+)/);
    if (match) {
        const [, book, chapter] = match;
        const bookName = book.trim();
        const chapterNum = parseInt(chapter, 10);
        
        setSelectedBook(bookName);
        setSelectedChapter(chapterNum);
    }
  };

  return (
    <div className="flex flex-col p-4 space-y-4 h-full">
      <div>
        <div className="font-semibold text-sm mb-2">Search</div>
        <div className="relative">
          <Input 
            placeholder="Enter a topic (e.g., 'love', 'forgiveness')" 
            className="pr-20"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button 
            size="sm" 
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? <Loader className="animate-spin" /> : <SearchIcon />}
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 border rounded-md bg-background min-h-[200px]">
        {isLoading ? (
            <div className="p-4 text-xs text-muted-foreground h-full flex items-center justify-center">
                <Loader className="animate-spin mr-2 h-4 w-4" />
                <span>Getting suggestions...</span>
            </div>
        ) : suggestions.length > 0 ? (
          <div className="p-2">
            {suggestions.map((suggestion, index) => (
              <button 
                key={index} 
                className="w-full text-left p-2 rounded-md hover:bg-accent text-xs"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 text-xs text-muted-foreground h-full flex items-center justify-center text-center">
            Enter a topic above to get related Bible passages.
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
