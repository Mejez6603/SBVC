'use client';

import { Input } from './ui/input';
import { Button } from './ui/button';
import { Loader, Search as SearchIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { searchBible } from '@/ai/flows/search-bible';
import { useBible } from '@/context/bible-context';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { tagalogToEnglishBookMap } from '@/lib/bible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from './ui/scroll-area';

type Suggestion = {
    reference: string;
    text?: string;
};

type SearchResults = {
  kjv: Suggestion[];
  adb: Suggestion[];
  tcb: Suggestion[];
}

function ResultRow({ suggestion, onSuggestionClick, highlight }: { suggestion: Suggestion, onSuggestionClick: (ref: string) => void, highlight: string }) {
    const getHighlightedText = (text: string | undefined, highlight: string) => {
        if (!highlight.trim() || !text) {
          return { __html: text || '' };
        }
        const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
        return { __html: text.replace(regex, `<mark class="bg-yellow-300 text-black rounded px-1">$1</mark>`) };
    };

    return (
        <button
            className="w-full text-left p-2 hover:bg-accent text-xs border-b"
            onClick={() => onSuggestionClick(suggestion.reference)}
        >
            <div className="font-bold">{suggestion.reference}</div>
            {suggestion.text ? (
                <div
                    className="text-muted-foreground whitespace-pre-wrap"
                    dangerouslySetInnerHTML={getHighlightedText(suggestion.text, highlight)}
                />
            ) : (
                <div className="text-muted-foreground italic">Verse not available in this version.</div>
            )}
        </button>
    );
}

function ResultList({ suggestions, onSuggestionClick, highlight }: { suggestions: Suggestion[], onSuggestionClick: (ref: string) => void, highlight: string }) {
    if (suggestions.length === 0) {
      return (
        <div className="p-4 text-xs text-muted-foreground h-full flex items-center justify-center text-center">
          No results found for this version.
        </div>
      );
    }
    
    return (
        <ScrollArea className="h-full w-full relative border rounded-md bg-background">
            <div className="p-2">
                {suggestions.map((suggestion, index) => (
                    <ResultRow 
                        key={index}
                        suggestion={suggestion}
                        onSuggestionClick={onSuggestionClick}
                        highlight={highlight}
                    />
                ))}
            </div>
        </ScrollArea>
    );
}

export function Notepad() {
  const [topic, setTopic] = useState('');
  const [results, setResults] = useState<SearchResults>({ kjv: [], adb: [], tcb: [] });
  const [isLoading, setIsLoading] = useState(false);
  const { navigateToVerse } = useBible();

  const handleSearch = async () => {
    if (!topic) return;
    setIsLoading(true);
    setResults({ kjv: [], adb: [], tcb: [] });
    try {
      const searchResult = await searchBible({ topic });
      setResults({
        kjv: searchResult.kjv,
        adb: searchResult.adb,
        tcb: searchResult.tcb,
      });
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

  const totalResults = results.kjv.length;

  const renderResults = (suggestions: Suggestion[]) => {
    return <ResultList suggestions={suggestions} onSuggestionClick={handleSuggestionClick} highlight={topic} />;
  };

  return (
    <div className="flex flex-col p-4 space-y-4 h-full">
      <div>
        <div className="font-semibold text-sm mb-2">Search</div>
        <div className="relative">
          <Input 
            placeholder="Enter a topic (e.g., 'love', 'earth')" 
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
        {totalResults > 0 && !isLoading && (
            <p className="text-xs text-muted-foreground mt-2">
                Found {totalResults} results.
            </p>
        )}
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
          {isLoading ? (
              <div className="p-4 text-xs text-muted-foreground h-full flex items-center justify-center flex-1">
                  <Loader className="animate-spin mr-2 h-4 w-4" />
                  <span>Searching...</span>
              </div>
          ) : totalResults > 0 ? (
            <Tabs defaultValue="kjv" className="flex-1 flex flex-col min-h-0">
                <TabsList className="grid w-full grid-cols-3 mb-2">
                    <TabsTrigger value="kjv">KJV</TabsTrigger>
                    <TabsTrigger value="adb">ADB1905</TabsTrigger>
                    <TabsTrigger value="tcb">TCB2015</TabsTrigger>
                </TabsList>
                <TabsContent value="kjv" className="flex-1 min-h-0 data-[state=inactive]:hidden">{renderResults(results.kjv)}</TabsContent>
                <TabsContent value="adb" className="flex-1 min-h-0 data-[state=inactive]:hidden">{renderResults(results.adb)}</TabsContent>
                <TabsContent value="tcb" className="flex-1 min-h-0 data-[state=inactive]:hidden">{renderResults(results.tcb)}</TabsContent>
            </Tabs>
          ) : (
            <div className="p-4 text-xs text-muted-foreground h-full flex items-center justify-center text-center flex-1 border rounded-md">
              Enter a term to search for in the Bible (KJV, ADB1905, TCB2015).
            </div>
          )}
      </div>
      
      <Separator />

      <div className="flex flex-col space-y-2 flex-shrink-0">
        <div className="font-semibold text-sm">Notepad</div>
        <Textarea className="h-48" placeholder="Take notes here..." />
      </div>

    </div>
  );
}
