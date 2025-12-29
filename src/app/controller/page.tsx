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
import { CustomizationController } from '@/components/customization-controller';
import { Separator } from '@/components/ui/separator';

const FULLSCREEN_KEY = 'sbvc-fullscreen-request';

function Controller() {
  const { selectedTagalogVersion, setSelectedTagalogVersion, selectedEnglishVersion, setSelectedEnglishVersion } = useBible();

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
          <div className="flex-1 border-r flex flex-col min-h-0">
            <div className="flex flex-1 min-h-0">
                <div className="flex-1 flex flex-col border-r h-full">
                    <div className="p-2 text-center font-bold text-xs border-b">English</div>
                    <div className="p-2 text-center font-semibold text-xs border-b h-[53px] flex items-center justify-center">
                        <div className="flex justify-center gap-2">
                             <Button 
                                variant={selectedEnglishVersion === 'KJV' ? 'default' : 'ghost'}
                                size="sm"
                                className="h-6 px-2 text-xs"
                                onClick={() => setSelectedEnglishVersion('KJV')}
                            >
                                KJV
                            </Button>
                        </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <SBVC version={selectedEnglishVersion} />
                    </div>
                </div>
                <div className="flex-1 flex flex-col h-full">
                    <div className="p-2 text-center font-bold text-xs border-b">Tagalog</div>
                    <div className="p-2 text-center font-semibold text-xs border-b h-[53px] flex items-center justify-center">
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
                    <div className="flex-1 overflow-hidden">
                        <SBVC version={selectedTagalogVersion} />
                    </div>
                </div>
            </div>
          </div>
        </div>
        <div className="w-[350px] border-l flex flex-col">
          <Tabs defaultValue="main" className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-full grid-cols-2 m-2">
                <TabsTrigger value="main">Controls</TabsTrigger>
                <TabsTrigger value="ai">Search</TabsTrigger>
            </TabsList>
            <TabsContent value="main" className="flex-1 flex flex-col min-h-0">
                <PresentationController />
                <Separator />
                <div className="p-4 border-b text-sm font-semibold">Customization</div>
                <ScrollArea className="flex-1">
                  <CustomizationController />
                </ScrollArea>
            </TabsContent>
            <TabsContent value="ai" className="flex-1 flex flex-col min-h-0 data-[state=inactive]:hidden">
                <Notepad />
            </TabsContent>
          </Tabs>
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
