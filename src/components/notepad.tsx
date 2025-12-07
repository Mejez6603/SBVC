'use client';

import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Loader, Search } from 'lucide-react';
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
    // Example: "John 3:16"
    const match = passage.match(/(\d?\s?[a-zA-Z]+)\s(\d+):(\d+)/);
    if (match) {
        const [, book, chapter, verse] = match;
        const bookName = book.trim();
        const chapterNum = parseInt(chapter, 10);
        
        setSelectedBook(bookName);
        setSelectedChapter(chapterNum);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-4">
      <div className="font-semibold text-sm mb-2">Notepad & AI Suggestions</div>
      <div className="relative mb-2">
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
          {isLoading ? <Loader className="animate-spin" /> : <Search />}
        </Button>
      </div>
      <ScrollArea className="flex-1 mt-2 border rounded-md">
        {isLoading ? (
            <div className="p-4 text-xs text-muted-foreground h-full flex items-center justify-center">
                <Loader className="animate-spin mr-2" />
                Getting suggestions...
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
          <div className="p-4 text-xs text-muted-foreground h-full flex items-center justify-center">
            Enter a topic to get related Bible passages.
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
