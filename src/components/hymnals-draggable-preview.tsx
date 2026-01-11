'use client';

import { useState, useEffect, useRef } from 'react';
import type { Passage, Hymn, MediaFile, Customization } from '@/context/app-context';
import { motion, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';
import { VideoPlayer } from '@/components/video-player';

// Helper function to handle font family names
const getFontFamily = (font: string) => {
  if (font.includes(' ')) {
    return `'${font}'`;
  }
  return font;
};

export function HymnalsDraggablePreview() {
  const { 
      passage, 
      hymn, 
      backgroundColor, 
      activeMedia, 
      hymnalsCustomization: customization, 
      setHymnalsCustomization 
  } = useAppContext();

  const [previewScale, setPreviewScale] = useState(1);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isDraggingTitle, setIsDraggingTitle] = useState(false);
  const [isDraggingText, setIsDraggingText] = useState(false);

  const displayContent = passage || (hymn ? { reference: hymn.title, text: hymn.lyrics.join('\n') } : null);

  useEffect(() => {
    const calculateScale = () => {
        if (containerRef.current) {
            const scale = containerRef.current.clientWidth / 1280; // Assuming 1280px is base presentation width
            setPreviewScale(scale);
        }
    }
    calculateScale();
    window.addEventListener('resize', calculateScale);
    return () => window.removeEventListener('resize', calculateScale);
  }, [containerRef]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, type: 'title' | 'text') => {
    const scaleFactor = 1 / previewScale;
    const newPositions = { ...customization.positions };
    
    if(type in newPositions) {
        newPositions[type] = {
            x: customization.positions[type].x + info.offset.x * scaleFactor,
            y: customization.positions[type].y + info.offset.y * scaleFactor,
        };
    }
    
    const newCustomization = { ...customization, positions: newPositions };
    setHymnalsCustomization(newCustomization);

    if (type === 'title') {
        setIsDraggingTitle(false);
    } else {
        setIsDraggingText(false);
    }
  };
  
  const passageStyle = {
    fontFamily: getFontFamily(customization.fontFamily),
    fontSize: `${customization.fontSize * previewScale}rem`,
    lineHeight: customization.lineHeight,
    textAlign: customization.textAlign,
    color: customization.textColor,
  }
  
  const titleStyle = {
    fontFamily: getFontFamily(customization.titleFontFamily),
    fontSize: `${customization.titleFontSize * previewScale}rem`,
    cursor: isDraggingTitle ? 'grabbing' : 'grab',
    textAlign: customization.textAlign,
    color: customization.titleColor,
  }

  const containerStyle = {
    paddingLeft: `${customization.horizontalPadding * previewScale}rem`,
    paddingRight: `${customization.horizontalPadding * previewScale}rem`,
    backgroundColor: backgroundColor
  }

  return (
    <div 
        ref={containerRef}
        style={containerStyle}
        className={cn(
            "aspect-video w-full rounded-md relative overflow-hidden flex flex-col items-center justify-center transition-colors duration-300",
        )}
    >
      {activeMedia ? (
        <VideoPlayer file={activeMedia} isMuted={true} showControls={false} />
        ) : displayContent ? (
            <div className="w-full h-full flex flex-col items-center justify-center">
                 <motion.h1
                    ref={titleRef}
                    drag
                    onDragStart={() => setIsDraggingTitle(true)}
                    onDragEnd={(e, i) => handleDragEnd(e, i, 'title')}
                    dragMomentum={false}
                    animate={{ 
                        x: isDraggingTitle ? undefined : customization.positions.title.x * previewScale, 
                        y: isDraggingTitle ? undefined : customization.positions.title.y * previewScale 
                    }}
                    className="font-bold mb-1 cursor-grab active:cursor-grabbing line-clamp-1"
                    style={titleStyle}
                >
                    {displayContent.reference}
                </motion.h1>
                <motion.p
                    ref={textRef}
                    drag
                    onDragStart={() => setIsDraggingText(true)}
                    onDragEnd={(e, i) => handleDragEnd(e, i, 'text')}
                    dragMomentum={false}
                    animate={{ 
                        x: isDraggingText ? undefined : customization.positions.text.x * previewScale, 
                        y: isDraggingText ? undefined : customization.positions.text.y * previewScale
                    }}
                    className="whitespace-pre-wrap cursor-grab active:cursor-grabbing"
                    style={{ ...passageStyle, cursor: isDraggingText ? 'grabbing' : 'grab' }}
                >
                     {displayContent.text}
                </motion.p>
            </div>
        ) : (
             <div className="text-center">
                <p className="text-sm text-neutral-400">No content selected</p>
            </div>
        )}
    </div>
  );
}
