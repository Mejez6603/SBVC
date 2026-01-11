'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Music, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MediaFile {
  name: string;
  url: string;
  type: 'video' | 'audio';
  thumbnail: string | null; // Data URL for the thumbnail
}

export function VideoPlayer() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [activeFile, setActiveFile] = useState<MediaFile | null>(null);

  const handleSelectFile = (file: MediaFile) => {
    setActiveFile(file);
  };

  const handleRemoveFile = (fileToRemove: MediaFile) => {
    setFiles(files.filter(f => f.url !== fileToRemove.url));
    if (activeFile?.url === fileToRemove.url) {
      setActiveFile(null);
    }
    URL.revokeObjectURL(fileToRemove.url); // Clean up memory
    if (fileToRemove.thumbnail) {
        URL.revokeObjectURL(fileToRemove.thumbnail); // Clean up thumbnail memory if it exists
    }
  };

  return (
    <div className="flex flex-col h-full">
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
    </div>
  );
}
