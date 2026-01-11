'use client';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { NavigationMenu } from '@/components/navigation-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Play, RefreshCw, Maximize, Upload, Video, Music } from 'lucide-react';
import { cn } from '@/lib/utils';
import englishHymns from '@/data/hymns-english.json';
import tagalogHymns from '@/data/hymns-tagalog.json';
import { DraggablePreview } from '@/components/draggable-preview';
import { useAppContext, Hymn, Passage } from '@/context/app-context';
import { HymnalsCustomizationController } from '@/components/hymnals-customization-controller';
import { useToast } from '@/components/use-toast';

const backgroundColors = [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Light Gray', hex: '#F2F2F2' },
    { name: 'Soft Beige', hex: '#F5F1EB' },
    { name: 'Muted Blue', hex: '#E8EEF5' },
    { name: 'Charcoal Gray', hex: '#2B2B2B' },
];

const HYMNALS_CUSTOMIZATION_KEY = 'sbvc-hymnals-customization';
const FULLSCREEN_KEY = 'sbvc-fullscreen-request';
const CONTENT_TYPE_KEY = 'sbvc-content-type';
const MAX_PRESET_ITEMS = 15;

interface MediaFile {
  name: string;
  url: string;
  type: 'video' | 'audio';
  thumbnail: string | null;
}

const generateThumbnail = (file: File): Promise<string | null> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('video/')) {
      resolve(null);
      return;
    }
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    video.src = URL.createObjectURL(file);
    video.onloadeddata = () => {
      video.currentTime = 1;
    };
    video.onseeked = () => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        resolve(canvas.toDataURL('image/jpeg'));
      } else {
        resolve(null);
      }
      URL.revokeObjectURL(video.src);
    };
    video.onerror = () => {
        resolve(null);
        URL.revokeObjectURL(video.src);
    };
  });
};

export default function HymnalsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { 
    passage, setPassage, 
    backgroundColor, setBackgroundColor, 
    preset, setPreset
  } = useAppContext(); 
  const [activeHymn, setActiveHymn] = useState<Hymn | null>(null);
  const [selectedVerseIndex, setSelectedVerseIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [activeFile, setActiveFile] = useState<MediaFile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(CONTENT_TYPE_KEY, 'hymnal');
  }, []);

  const handleShowScreen = () => {
    try {
        if(passage) {
            localStorage.setItem('present-passage', JSON.stringify(passage));
        } else {
            localStorage.removeItem('present-passage');
        }
      window.open('/present', 'present');
    } catch (error) {
      console.error("Could not open presentation window:", error);
    }
  };
  
  const handleClearScreen = () => {
    setPassage(null);
    try {
      localStorage.removeItem('present-passage');
    } catch (error) {
      console.error("Could not clear passage from local storage:", error);
    }
  }

  const handleResetPosition = () => {
    const saved = localStorage.getItem(HYMNALS_CUSTOMIZATION_KEY);
    if (saved) {
        const currentCustomization = JSON.parse(saved);
        currentCustomization.positions = { title: { x: 0, y: 0 }, text: { x: 0, y: 0 } };
        localStorage.setItem(HYMNALS_CUSTOMIZATION_KEY, JSON.stringify(currentCustomization));
    }
  };

  const handleFullscreenRequest = () => {
    localStorage.setItem(FULLSCREEN_KEY, Date.now().toString());
  };

  const filteredEnglishHymns = useMemo(() => 
    englishHymns.filter((hymn) =>
      hymn.title.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm]);

  const filteredTagalogHymns = useMemo(() => 
    tagalogHymns.filter((hymn) =>
      hymn.title.toLowerCase().includes(searchTerm.toLowerCase())
    ), [searchTerm]);

  const handleAddToPreset = (hymnToAdd: Hymn) => {
    if (preset.length >= MAX_PRESET_ITEMS) {
      toast({
        title: "Preset is full",
        description: "Please remove a hymn from the preset before adding a new one.",
        variant: "destructive",
      });
      return;
    }
    if (!preset.find(h => h.number === hymnToAdd.number && h.title === hymnToAdd.title)) {
      setPreset([...preset, hymnToAdd]);
    }
  };

  const handleRemoveFromPreset = (hymnToRemove: Hymn) => {
    setPreset(preset.filter(h => !(h.number === hymnToRemove.number && h.title === hymnToRemove.title)));
    if (activeHymn?.number === hymnToRemove.number && activeHymn?.title === hymnToRemove.title) {
        setActiveHymn(null);
        setPassage(null);
    }
  };

  const handleHymnSelectFromPreset = (hymn: Hymn) => {
    setActiveHymn(hymn);
    setSelectedVerseIndex(null);
  };
  
  const handleContentSelectForPreview = (content: string[], reference: string, index: number) => {
    let newPassage: Passage;
    if (index === -1) {
        newPassage = {
            reference: reference,
            text: ''
        };
    } else {
        newPassage = {
            reference: '',
            text: content.join('\n')
        };
    }
    setPassage(newPassage)
    setSelectedVerseIndex(index);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles) {
      addFiles(Array.from(selectedFiles));
    }
  };

  const addFiles = async (newFiles: File[]) => {
    const mediaFilePromises = newFiles
      .filter(file => file.type.startsWith('video/') || file.type.startsWith('audio/'))
      .map(async (file) => {
        const thumbnail = await generateThumbnail(file);
        return {
          name: file.name,
          url: URL.createObjectURL(file),
          type: file.type.startsWith('video/') ? 'video' : 'audio' as 'video' | 'audio',
          thumbnail,
        };
      });

    const mediaFiles = await Promise.all(mediaFilePromises);
    setFiles(prev => [...prev, ...mediaFiles]);
  };

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles) {
      addFiles(Array.from(droppedFiles));
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleSelectFile = (file: MediaFile) => {
    setActiveFile(file);
  };

  const handleRemoveFile = (fileToRemove: MediaFile) => {
    setFiles(files.filter(f => f.url !== fileToRemove.url));
    if (activeFile?.url === fileToRemove.url) {
      setActiveFile(null);
    }
    URL.revokeObjectURL(fileToRemove.url);
    if (fileToRemove.thumbnail) {
        URL.revokeObjectURL(fileToRemove.thumbnail);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

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
                  {filteredEnglishHymns.map((hymn, index) => (
                     <div
                        key={`english-hymn-${hymn.number}-${index}`}
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
                  {filteredTagalogHymns.map((hymn, index) => (
                     <div
                        key={`tagalog-hymn-${hymn.number}-${index}`}
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
                    <ScrollArea className='flex-1'>
                        <div className="flex-shrink-0">
                            <h2 className="text-xl font-bold mb-2">Background</h2>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {backgroundColors.map(color => (
                                    <Button
                                        key={color.hex}
                                        variant="outline"
                                        className={cn(
                                            "h-10 w-16",
                                            backgroundColor === color.hex && 'ring-2 ring-ring ring-offset-2'
                                        )}
                                        style={{ backgroundColor: color.hex }}
                                        onClick={() => setBackgroundColor(color.hex)}
                                    >
                                    </Button>
                                ))}
                            </div>
                            <div className="border-t my-4"></div>
                        </div>
                        <div className="flex-shrink-0">
                            <h2 className="text-xl font-bold mb-2">Preset</h2>
                            {preset.length > 0 ? (
                                <div className="grid grid-cols-3 gap-2">
                                    {preset.map((hymn, index) => (
                                        <div key={`${hymn.number}-${index}`} className={cn(
                                            "flex items-center justify-between p-2 border rounded-md cursor-pointer",
                                            activeHymn?.number === hymn.number && activeHymn?.title === hymn.title && 'bg-muted font-semibold'
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
                                            onClick={() => handleContentSelectForPreview([activeHymn.title], activeHymn.title, -1)}
                                            className={cn(
                                            'p-3 rounded-md cursor-pointer border',
                                            selectedVerseIndex === -1
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
                                            onClick={() => handleContentSelectForPreview(verse, `${activeHymn.title} - Verse ${index + 1}`, index)}
                                            className={cn(
                                            'p-3 rounded-md cursor-pointer border',
                                            selectedVerseIndex === index
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
                    </ScrollArea>
                </TabsContent>
                <TabsContent value="video" className="flex-1 flex flex-col min-h-0 pt-4">
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onClick={openFileDialog}
                        className={cn(
                        'flex-shrink-0 flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors',
                        isDragging ? 'border-primary bg-muted' : 'border-muted-foreground/50 hover:border-primary'
                        )}
                    >
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <p className="mt-2 text-sm text-muted-foreground">Drag & drop files here, or click to select</p>
                        <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        accept="video/*,audio/*"
                        onChange={handleFileChange}
                        className="hidden"
                        />
                    </div>
                    <div className="flex-grow mt-4 overflow-hidden">
                        <h3 className="text-lg font-semibold mb-2">Media Library</h3>
                        <ScrollArea className="h-full pr-4">
                        {files.length === 0 ? (
                            <p className="text-muted-foreground text-center py-4">No media files added.</p>
                        ) : (
                            <div className="space-y-2">
                            {files.map(file => (
                                <div
                                key={file.url}
                                onClick={() => handleSelectFile(file)}
                                className={cn(
                                    'flex items-center justify-between p-2 border rounded-md cursor-pointer',
                                    activeFile?.url === file.url ? 'bg-muted font-semibold' : 'hover:bg-muted/50'
                                )}
                                >
                                <div className="flex items-center gap-3 truncate">
                                    {file.thumbnail ? (
                                        <img src={file.thumbnail} alt={`${file.name} thumbnail`} className="w-16 h-9 object-cover rounded-sm bg-muted" />
                                    ) : (
                                        <div className="w-16 h-9 flex items-center justify-center bg-muted rounded-sm">
                                        <Music className="w-6 h-6 text-muted-foreground" />
                                        </div>
                                    )}
                                    <span className="truncate font-medium">{file.name}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={(e) => { e.stopPropagation(); handleRemoveFile(file); }}>
                                    <X className="h-4 w-4" />
                                </Button>
                                </div>
                            ))}
                            </div>
                        )}
                        </ScrollArea>
                    </div>

                    {activeFile && (
                        <div className="flex-shrink-0 mt-4 border-t pt-4">
                        <h3 className="text-lg font-semibold mb-2">Now Playing</h3>
                        <video controls autoPlay key={activeFile.url} className="w-full rounded-lg bg-black">
                            <source src={activeFile.url} type={activeFile.type === 'video' ? 'video/mp4' : 'audio/mp3'} />
                            Your browser does not support the video tag.
                        </video>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>

        {/* Preview Panel (Right) */}
        <div className="w-[400px] flex-shrink-0 p-4 bg-card text-card-foreground border-l flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Preview</h2>
          <DraggablePreview />
           <div className="grid grid-cols-4 gap-2 mt-4">
                <Button variant="outline" size="icon" onClick={handleShowScreen}>
                    <Play />
                </Button>
                <Button variant="outline" size="icon" onClick={handleClearScreen}>
                    <X />
                </Button>
                <Button variant="outline" size="icon" onClick={handleResetPosition}>
                    <RefreshCw />
                </Button>
                <Button variant="outline" size="icon" onClick={handleFullscreenRequest}>
                    <Maximize />
                </Button>
            </div>
            <div className="border-t my-4"></div>
            <h2 className="text-lg font-semibold mb-4">Customization</h2>
            <ScrollArea>
                <HymnalsCustomizationController />
            </ScrollArea>
        </div>
      </div>
    </div>
  );
}
