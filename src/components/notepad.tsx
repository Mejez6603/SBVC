'use client';

import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Loader, Search as SearchIcon } from 'lucide-react';
import { useState } from 'react';
import { searchBible } from '@/ai/flows/search-bible';
import { useBible } from '@/context/bible-context';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { tagalogToEnglishBookMap } from '@/lib/bible';

type Suggestion = {
    reference: string;
    text: string;
};

export function Notepad() {
  const [topic, setTopic] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { navigateToVerse } = useBible();

  const handleSearch = async () => {
    if (!topic) return;
    setIsLoading(true);
    setSuggestions([]);
    try {
      const result = await searchBible({ topic });
      setSuggestions(result.passages);
    } catch (error) {
      console.error('Failed to get suggestions:', error);
    }
    setIsLoading(false);
  };
  
  const handleSuggestionClick = (passage: string) => {
    const match = passage.match(/(\d?\s?[a-zA-Z\s]+)\s(\d+):(\d+)/);
    if (match) {
        const [, book, chapter, verse] = match;
        const bookName = book.trim();
        const chapterNum = parseInt(chapter, 10);
        const verseNum = parseInt(verse, 10);
        
        const englishBookName = tagalogToEnglishBookMap[bookName] || bookName;

        navigateToVerse(englishBookName, chapterNum, verseNum);
    }
  };

  const getHighlightedText = (text: string, highlight: string) => {
    if (!highlight.trim()) {
      return text;
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    return text.replace(regex, `<mark class="bg-yellow-300 text-black rounded px-1">$1</mark>`);
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
        {suggestions.length > 0 && !isLoading && (
            <p className="text-xs text-muted-foreground mt-2">
                Found {suggestions.length} results.
            </p>
        )}
      </div>
      
      <ScrollArea className="flex-1 border rounded-md bg-background min-h-[250px]">
        {isLoading ? (
            <div className="p-4 text-xs text-muted-foreground h-full flex items-center justify-center">
                <Loader className="animate-spin mr-2 h-4 w-4" />
                <span>Searching...</span>
            </div>
        ) : suggestions.length > 0 ? (
          <div className="p-2">
            {suggestions.map((suggestion, index) => (
              <button 
                key={index} 
                className="w-full text-left p-2 rounded-md hover:bg-accent text-xs"
                onClick={() => handleSuggestionClick(suggestion.reference)}
              >
                <div className="font-bold">{suggestion.reference}</div>
                <div 
                  className="text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: getHighlightedText(suggestion.text, topic) }}
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 text-xs text-muted-foreground h-full flex items-center justify-center text-center">
            Enter a term to search for in the Bible (KJV).
          </div>
        )}
      </ScrollArea>
      
      <Separator />

      <div className="flex flex-col space-y-2 flex-1 min-h-[200px]">
        <div className="font-semibold text-sm">Notepad</div>
        <Textarea className="flex-1" placeholder="Take notes here..." />
      </div>

    </div>
  );
}
