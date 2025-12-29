
'use client';

import { useState, useEffect } from 'react';
import type { Passage } from '@/context/app-context';
import { motion, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';

const CUSTOMIZATION_KEY = 'sbvc-customization';

type Customization = {
  fontFamily: string;
  fontSize: number;
  titleFontFamily: string;
  titleFontSize: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  horizontalPadding: number;
  positions: {
    title: { x: number; y: number };
    text: { x: number; y: number };
  };
};

interface DraggablePreviewProps {
    passage: NonNullable<Passage>;
}

export function DraggablePreview({ passage }: DraggablePreviewProps) {
  const { theme } = useAppContext();
  const [customization, setCustomization] = useState<Customization>({
    fontFamily: 'Inter',
    fontSize: 5,
    titleFontFamily: 'Inter',
    titleFontSize: 4.5,
    textAlign: 'center',
    horizontalPadding: 1,
    positions: {
      title: { x: 0, y: 0 },
      text: { x: 0, y: 0 },
    },
  });
  const [isDraggingTitle, setIsDraggingTitle] = useState(false);
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const syncCustomization = () => {
        const savedCustomization = localStorage.getItem(CUSTOMIZATION_KEY);
        if (savedCustomization) {
            try {
                const parsed = JSON.parse(savedCustomization);
                 // Backwards compatibility for old structures
                if (parsed.position) {
                    parsed.positions = { title: parsed.position, text: parsed.position };
                    delete parsed.position;
                }
                if (!parsed.titleFontSize) {
                    parsed.titleFontSize = parsed.fontSize ? parsed.fontSize * 0.9 : 4.5;
                }
                if (!parsed.titleFontFamily) {
                    parsed.titleFontFamily = 'Inter';
                }
                if (parsed.horizontalPadding === undefined) {
                    parsed.horizontalPadding = 1;
                }
                setCustomization(c => ({...c, ...parsed}));
            } catch (e) {
                console.error("Failed to parse customization from local storage", e)
            }
        }
    }
    syncCustomization();

    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === CUSTOMIZATION_KEY) {
            syncCustomization();
        }
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  useEffect(() => {
    if (containerRef) {
        const scale = containerRef.clientWidth / 1280; // Assuming 1280px is the base width of presentation
        setPreviewScale(scale);
    }
  }, [containerRef]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, type: 'title' | 'text') => {
    const scaleFactor = 1 / previewScale;
    const newPositions = { ...customization.positions };
    
    newPositions[type] = {
      x: customization.positions[type].x + info.offset.x * scaleFactor,
      y: customization.positions[type].y + info.offset.y * scaleFactor,
    };
    
    const newCustomization = { ...customization, positions: newPositions };
    setCustomization(newCustomization);
    localStorage.setItem(CUSTOMIZATION_KEY, JSON.stringify(newCustomization));

    if (type === 'title') {
        setIsDraggingTitle(false);
    } else {
        setIsDraggingText(false);
    }
  };
  
  const passageStyle = {
    fontFamily: customization.fontFamily,
    fontSize: `${customization.fontSize * previewScale}rem`,
    lineHeight: 1.5,
    textAlign: customization.textAlign,
  }
  
  const titleStyle = {
    fontFamily: customization.titleFontFamily,
    fontSize: `${customization.titleFontSize * previewScale}rem`,
    cursor: isDraggingTitle ? 'grabbing' : 'grab',
    textAlign: customization.textAlign
  }

  const containerStyle = {
    paddingLeft: `${customization.horizontalPadding * previewScale}rem`,
    paddingRight: `${customization.horizontalPadding * previewScale}rem`,
  }

  return (
    <div 
        ref={setContainerRef}
        style={containerStyle}
        className={cn(
            "aspect-video w-full rounded-md relative overflow-hidden flex flex-col items-center justify-center",
            theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
        )}
    >
        <motion.h1
            drag
            onDragStart={() => setIsDraggingTitle(true)}
            onDragEnd={(e, i) => handleDragEnd(e, i, 'title')}
            dragMomentum={false}
            animate={{ 
                x: isDraggingTitle ? undefined : customization.positions.title.x * previewScale, 
                y: isDraggingTitle ? undefined : customization.positions.title.y * previewScale 
            }}
            className="font-bold mb-1 cursor-grab line-clamp-1"
            style={titleStyle}
        >
            {passage.reference}
        </motion.h1>
        <motion.p
            drag
            onDragStart={() => setIsDraggingText(true)}
            onDragEnd={(e, i) => handleDragEnd(e, i, 'text')}
            dragMomentum={false}
            animate={{ 
                x: isDraggingText ? undefined : customization.positions.text.x * previewScale, 
                y: isDraggingText ? undefined : customization.positions.text.y * previewScale
            }}
            className="whitespace-pre-wrap cursor-grab line-clamp-4"
            style={{ ...passageStyle, cursor: isDraggingText ? 'grabbing' : 'grab' }}
        >
            {passage.text}
        </motion.p>
    </div>
  );
}
