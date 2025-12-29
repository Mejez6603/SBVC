
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
    positions: {
      title: { x: 0, y: 0 },
      text: { x: 0, y: 0 },
    },
  });
  const [isDragging, setIsDragging] = useState(false);
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

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo, type: 'title' | 'text') => {
    const newPositions = { ...customization.positions };
    
    const scaleFactor = 1 / previewScale;
    
    newPositions[type] = {
      x: customization.positions[type].x + info.delta.x * scaleFactor,
      y: customization.positions[type].y + info.delta.y * scaleFactor,
    };
    
    const newCustomization = { ...customization, positions: newPositions };
    setCustomization(newCustomization);
    localStorage.setItem(CUSTOMIZATION_KEY, JSON.stringify(newCustomization));
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
    cursor: isDragging ? 'grabbing' : 'grab',
    textAlign: customization.textAlign
  }

  return (
    <div 
        ref={setContainerRef}
        className={cn(
            "aspect-video w-full rounded-md p-2 relative overflow-hidden flex flex-col items-center justify-center",
            theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
        )}
    >
        <motion.h1
            drag
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            onDrag={(e, i) => handleDrag(e, i, 'title')}
            dragMomentum={false}
            animate={{ 
                x: customization.positions.title.x * previewScale, 
                y: customization.positions.title.y * previewScale 
            }}
            className="font-bold mb-1 cursor-grab line-clamp-1"
            style={titleStyle}
        >
            {passage.reference}
        </motion.h1>
        <motion.p
            drag
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            onDrag={(e, i) => handleDrag(e, i, 'text')}
            dragMomentum={false}
            animate={{ 
                x: customization.positions.text.x * previewScale, 
                y: customization.positions.text.y * previewScale 
            }}
            className="whitespace-pre-wrap cursor-grab line-clamp-4"
            style={{ ...passageStyle, cursor: isDragging ? 'grabbing' : 'grab' }}
        >
            {passage.text}
        </motion.p>
    </div>
  );
}
