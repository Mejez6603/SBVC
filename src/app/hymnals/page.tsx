'use client';

import { useState, useMemo } from 'react';
import { NavigationMenu } from '@/components/navigation-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { cn } from '@/lib/utils';
import hymns from '@/data/hymns.json';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface Hymn {
  number: number;
  title: string;
  lyrics: string[];
}

const backgroundColors = [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Light Gray', hex: '#F2F2F2' },
    { name: 'Soft Beige', hex: '#F5F1EB' },
    { name: 'Muted Blue', hex: '#E8EEF5' },
    { name: 'Charcoal Gray', hex: '#2B2B2B' },
];

export default function HymnalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [preset, setPreset] = useState<Hymn[]>([]);
  const [activeHymn, setActiveHymn] = useState<Hymn | null>(null);
  const [selectedLyrics, setSelectedLyrics] = useState<string[] | null>(null);
  const [activeVerseIndex, setActiveVerseIndex] = useState<number | null>(null);
  const [previewBgColor, setPreviewBgColor] = useState('#000000'); // Default black
  const [titleFontSize, setTitleFontSize] = useState(4.5);
  const [lyricsFontSize, setLyricsFontSize] = useState(4);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('center');

  const filteredHymns = useMemo(() => 
    hymns.filter((hymn) =>
      hymn.title.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm]);

  const handleAddToPreset = (hymnToAdd: Hymn) => {
    if (!preset.find(h => h.number === hymnToAdd.number)) {
      setPreset([...preset, hymnToAdd]);
    }
  };

  const handleRemoveFromPreset = (hymnToRemove: Hymn) => {
    setPreset(preset.filter(h => h.number !== hymnToRemove.number));
    if (activeHymn?.number === hymnToRemove.number) {
        setActiveHymn(null);
        setSelectedLyrics(null);
        setActiveVerseIndex(null);
    }
  };

  const handleHymnSelectFromPreset = (hymn: Hymn) => {
    setActiveHymn(hymn);
    setSelectedLyrics(null);
    setActiveVerseIndex(null);
  };
  
  const handleTitleSelect = () => {
    if (activeHymn) {
        setSelectedLyrics([activeHymn.title]);
        setActiveVerseIndex(-1); // Use -1 to indicate title is selected
    }
  };

  const handleVerseSelect = (lyrics: string[], index: number) => {
    setSelectedLyrics(lyrics);
    setActiveVerseIndex(index);
  };

  const getGroupedLyrics = (lyrics: string[]): string[][] => {
    const groups: string[][] = [];
    let currentGroup: string[] = [];
    for (const line of lyrics) {
      if (line.trim() === '' && currentGroup.length > 0) {
        groups.push(currentGroup);
        currentGroup = [];
      } else if (line.trim() !== '') {
        currentGroup.push(line);
      }
    }
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    return groups;
  };

  const groupedLyrics = useMemo(() => 
    activeHymn ? getGroupedLyrics(activeHymn.lyrics) : [], 
  [activeHymn]);
  
  const previewTextColor = previewBgColor === '#2B2B2B' || previewBgColor === '#000000' ? '#FFFFFF' : '#000000';

  return (
    <div className="h-screen w-full flex flex-col font-sans text-sm">
      <NavigationMenu />
      <div className="flex flex-1 min-h-0">
        {/* Hymn Selection Panel (Left) */}
        <div className="w-[500px] flex-shrink-0 flex flex-col p-4 border-r">
          <Input
            placeholder="Search hymns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
          <div className="flex flex-row flex-1 gap-4 min-h-0">
            <div className="flex-1 flex flex-col">
              <h2 className="text-lg font-semibold mb-2">English</h2>
              <ScrollArea className="flex-1">
                <div className="flex flex-col space-y-1 pr-2">
                  {filteredHymns.map((hymn) => (
                     <div
                        key={hymn.number}
                        className="group flex items-center justify-between p-2 rounded-md hover:bg-muted"
                      >
                        <span className="flex-1 h-auto whitespace-normal text-left pr-2">
                          {hymn.number}. {hymn.title}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddToPreset(hymn)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Add
                        </Button>
                      </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="flex-1 flex flex-col">
              <h2 className="text-lg font-semibold mb-2">Tagalog</h2>
              <ScrollArea className="flex-1">
                <div className="flex flex-col space-y-2 pr-2">
                  {/* Replace with Tagalog hymns when available */}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* Control & Preset Panel (Center) */}
        <div className="flex-1 flex flex-col p-4 border-r min-h-0">
          <Tabs defaultValue="hymnal" className="flex-1 flex flex-col min-h-0">
            <TabsList>
              <TabsTrigger value="hymnal">Hymnal</TabsTrigger>
              <TabsTrigger value="video">Video</TabsTrigger>
            </TabsList>
            <TabsContent value="hymnal" className="flex-1 flex flex-col min-h-0 pt-4">
                 <div className="flex-shrink-0">
                    <h2 className="text-xl font-bold mb-2">Background</h2>
                    <div className="flex flex-wrap gap-2 mb-4">
                        {backgroundColors.map(color => (
                            <Button
                                key={color.hex}
                                variant="outline"
                                className={cn(
                                    "h-10 w-16",
                                    previewBgColor === color.hex && 'ring-2 ring-ring ring-offset-2'
                                )}
                                style={{ backgroundColor: color.hex }}
                                onClick={() => setPreviewBgColor(color.hex)}
                            >
                            </Button>
                        ))}
                    </div>
                    <div className="border-t my-4"></div>
                </div>
                <div className="flex-shrink-0">
                    <h2 className="text-xl font-bold mb-2">Preset</h2>
                    {preset.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                            {preset.map(hymn => (
                                <div key={hymn.number} className={cn(
                                    "flex items-center justify-between p-2 border rounded-md cursor-pointer",
                                    activeHymn?.number === hymn.number && 'bg-muted font-semibold'
                                )}
                                onClick={() => handleHymnSelectFromPreset(hymn)}
                                >
                                    <span className="truncate pr-2">{hymn.number}. {hymn.title}</span>
                                    <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={(e) => { e.stopPropagation(); handleRemoveFromPreset(hymn); }}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground p-2">Add hymns from the list on the left.</p>
                    )}
                    <div className="border-t my-4"></div>
                </div>

                {activeHymn && (
                    <div className="flex flex-col flex-1 min-h-0">
                        <h3 className="text-lg font-bold mb-2 flex-shrink-0">{activeHymn.title}</h3>
                        <ScrollArea className="flex-1 pr-2">
                            <div className="flex flex-col gap-2 mt-2">
                                <div
                                    onClick={handleTitleSelect}
                                    className={cn(
                                    'p-3 rounded-md cursor-pointer border',
                                    activeVerseIndex === -1
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-card hover:bg-muted'
                                    )}
                                >
                                    <p className="font-bold mb-2 text-sm">Title</p>
                                    <p className="whitespace-pre-wrap text-sm">
                                        {activeHymn.title}
                                    </p>
                                </div>
                                {groupedLyrics.map((verse, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleVerseSelect(verse, index)}
                                    className={cn(
                                    'p-3 rounded-md cursor-pointer border',
                                    activeVerseIndex === index
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-card hover:bg-muted'
                                    )}
                                >
                                    <p className="font-bold mb-2 text-sm">Verse {index + 1}</p>
                                    {verse.map((line, lineIndex) => (
                                    <p key={lineIndex} className="whitespace-pre-wrap text-sm">
                                        {line}
                                    </p>
                                    ))}
                                </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}
                {!activeHymn && <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Select a hymn from the preset to see its lyrics.</p></div>}
            </TabsContent>
            <TabsContent value="video">
                <div className="flex-1 flex items-center justify-center"><p className="text-muted-foreground">Video content goes here.</p></div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Panel (Right) */}
        <div className="w-[400px] flex-shrink-0 p-4 bg-card text-card-foreground border-l flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <div 
            className="aspect-video p-4 rounded-md flex items-center justify-center"
            style={{ backgroundColor: previewBgColor }}
          >
            {selectedLyrics ? (
              <div 
                style={{
                    color: previewTextColor,
                    fontSize: `${activeVerseIndex === -1 ? titleFontSize : lyricsFontSize}rem`,
                    textAlign: textAlign,
                    lineHeight: 1.2,
                }}
              >
                {selectedLyrics.map((line, index) => (
                  <p key={index} className="whitespace-pre-wrap">
                    {line}
                  </p>
                ))}
              </div>
            ) : (
                <div className="text-muted-foreground">No lyrics selected</div>
            )}
          </div>

          <div className="border-t my-4"></div>

          <ScrollArea className="flex-1">
            <div className="space-y-6 pr-4">
                <h3 className="text-lg font-semibold">Customization</h3>
                 <div>
                    <Label className="text-base font-semibold">Title</Label>
                    <div className="mt-2 space-y-4">
                        <div>
                            <Label>Font Size ({titleFontSize.toFixed(1)}rem)</Label>
                            <Slider
                                value={[titleFontSize]}
                                onValueChange={(value) => setTitleFontSize(value[0])}
                                min={1}
                                max={8}
                                step={0.1}
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <Label className="text-base font-semibold">Lyrics</Label>
                     <div className="mt-2 space-y-4">
                        <div>
                            <Label>Font Size ({lyricsFontSize.toFixed(1)}rem)</Label>
                            <Slider
                                value={[lyricsFontSize]}
                                onValueChange={(value) => setLyricsFontSize(value[0])}
                                min={1}
                                max={8}
                                step={0.1}
                            />
                        </div>
                        <div>
                            <Label>Text Alignment</Label>
                            <ToggleGroup
                                type="single"
                                value={textAlign}
                                onValueChange={(value) => value && setTextAlign(value as any)}
                                className="grid grid-cols-4 gap-1 mt-1"
                            >
                                <ToggleGroupItem value="left" aria-label="Left align"><AlignLeft className="h-4 w-4" /></ToggleGroupItem>
                                <ToggleGroupItem value="center" aria-label="Center align"><AlignCenter className="h-4 w-4" /></ToggleGroupItem>
                                <ToggleGroupItem value="right" aria-label="Right align"><AlignRight className="h-4 w-4" /></ToggleGroupItem>
                                <ToggleGroupItem value="justify" aria-label="Justify align"><AlignJustify className="h-4 w-4" /></ToggleGroupItem>
                            </ToggleGroup>
                        </div>
                    </div>
                </div>
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
