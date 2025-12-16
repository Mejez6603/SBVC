
'use client';

import { BibleProvider, useBible } from '@/context/bible-context';
import { BookList } from '@/components/book-list';
import { ChapterList } from '@/components/chapter-list';
import { SBVC } from '@/components/sbvc';
import { PresentationController } from '@/components/presentation-controller';
import { Notepad } from '@/components/notepad';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';

const FULLSCREEN_KEY = 'sbvc-fullscreen-request';

function Controller() {
  const { selectedTagalogVersion, setSelectedTagalogVersion } = useBible();

  const handleFullscreenRequest = () => {
    localStorage.setItem(FULLSCREEN_KEY, Date.now().toString());
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName.toLowerCase() !== 'input' && target.tagName.toLowerCase() !== 'textarea') {
            e.preventDefault();
            handleFullscreenRequest();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="h-screen w-full flex flex-col font-sans text-sm">
      <header className="h-10 border-b flex items-center px-4 text-xs text-muted-foreground">
        SBVC Controller
      </header>
      <div className="flex flex-1 min-h-0">
        <div className="flex flex-1">
          <div className="w-[300px] border-r flex flex-col">
            <div className="grid grid-cols-2">
              <div className="p-2 text-center font-bold text-xs border-b">OLD</div>
              <div className="p-2 text-center font-bold text-xs border-b border-l">NEW</div>
            </div>
            <div className="flex-1 grid grid-cols-2 overflow-hidden">
                <ScrollArea className="h-full border-r">
                    <BookList testament="OLD" />
                </ScrollArea>
                <ScrollArea className="h-full">
                    <BookList testament="NEW" />
                </ScrollArea>
            </div>
          </div>
          <ChapterList />
          <div className="flex-1 border-r flex flex-col">
            <div className="grid grid-cols-2 border-b">
              <div className="p-2 text-center font-bold text-xs">English</div>
              <div className="p-2 text-center font-bold text-xs border-l">
                Tagalog
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 overflow-hidden">
              <div className="flex flex-col border-r">
                <div className="p-2 text-center font-semibold text-xs border-b">KJV</div>
                <ScrollArea className="flex-1">
                  <SBVC version="KJV" />
                </ScrollArea>
              </div>
              <div className="flex flex-col">
                <div className="p-2 text-center font-semibold text-xs border-b">
                  <div className="flex justify-center gap-2">
                      <Button 
                        variant={selectedTagalogVersion === 'ADB' ? 'default' : 'ghost'}
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setSelectedTagalogVersion('ADB')}
                      >
                        ADB1905
                      </Button>
                      <Button 
                        variant={selectedTagalogVersion === 'TCB' ? 'default' : 'ghost'}
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={() => setSelectedTagalogVersion('TCB')}
                      >
                        TCB2015
                      </Button>
                  </div>
                </div>
                <ScrollArea className="flex-1">
                  <SBVC version={selectedTagalogVersion} />
                </ScrollArea>
              </div>
            </div>
          </div>
        </div>
        <div className="w-[350px] border-l flex flex-col">
          <PresentationController />
          <Notepad />
        </div>
      </div>
    </div>
  );
}

export default function ControllerPage() {
  return (
    <BibleProvider>
      <Controller />
    </BibleProvider>
  );
}
