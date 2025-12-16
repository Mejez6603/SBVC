
import { BibleProvider } from '@/context/bible-context';
import { BookList } from '@/components/book-list';
import { ChapterList } from '@/components/chapter-list';
import { SBVC } from '@/components/sbvc';
import { PresentationController } from '@/components/presentation-controller';
import { Notepad } from '@/components/notepad';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ControllerPage() {
  return (
    <BibleProvider>
      <div className="h-screen w-full flex flex-col font-sans text-sm">
        <header className="h-10 border-b flex items-center px-4 text-xs text-muted-foreground">
          SBVC Controller
        </header>
        <div className="flex flex-1 min-h-0">
          <div className="flex flex-1">
            <div className="w-[200px] border-r">
              <Tabs defaultValue="OLD" className="flex flex-col h-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="OLD">OLD</TabsTrigger>
                  <TabsTrigger value="NEW">NEW</TabsTrigger>
                </TabsList>
                <TabsContent value="OLD" className="flex-1 overflow-auto">
                  <BookList testament="OLD" />
                </TabsContent>
                <TabsContent value="NEW" className="flex-1 overflow-auto">
                  <BookList testament="NEW" />
                </TabsContent>
              </Tabs>
            </div>
            <ChapterList />
            <div className="flex-1 border-r flex flex-col">
              <div className="grid grid-cols-3 border-b">
                <div className="p-2 text-center font-bold text-xs">English</div>
                <div className="p-2 text-center font-bold text-xs border-l col-span-2">Tagalog</div>
              </div>
              <div className="flex-1 grid grid-cols-3">
                <div className="flex flex-col">
                  <div className="p-2 text-center font-semibold text-xs border-b">KJV</div>
                  <div className="flex-1 overflow-auto">
                    <SBVC version="KJV" />
                  </div>
                </div>
                <div className="flex flex-col border-l">
                  <div className="p-2 text-center font-semibold text-xs border-b">Ang Bibliya 1905</div>
                  <div className="flex-1 overflow-auto">
                    <SBVC version="TL" />
                  </div>
                </div>
                <div className="flex flex-col border-l">
                  <div className="p-2 text-center font-semibold text-xs border-b">TCN2015</div>
                  <div className="flex-1 overflow-auto">
                    <SBVC version="TCN" />
                  </div>
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
    </BibleProvider>
  );
}
