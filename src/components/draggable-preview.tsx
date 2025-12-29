
'use client';

import { useState, useEffect, useRef } from 'react';
import type { Passage } from '@/context/app-context';
import { motion, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';

const CUSTOMIZATION_KEY = 'sbvc-customization';
const PASSAGE_KEY = 'present-passage';

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

export function DraggablePreview() {
  const { theme } = useAppContext();
  const [passage, setPassage] = useState<Passage>(null);
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

  const [adjustedFontSize, setAdjustedFontSize] = useState(customization.fontSize);
  const [previewScale, setPreviewScale] = useState(1);
  const textRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  const [isDraggingTitle, setIsDraggingTitle] = useState(false);
  const [isDraggingText, setIsDraggingText] = useState(false);

  useEffect(() => {
    const syncState = () => {
        try {
            const savedCustomization = localStorage.getItem(CUSTOMIZATION_KEY);
            if (savedCustomization) {
                const parsed = JSON.parse(savedCustomization);
                // Backwards compatibility
                if (parsed.position) {
                    parsed.positions = { title: parsed.position, text: parsed.position };
                    delete parsed.position;
                }
                if (!parsed.titleFontSize) parsed.titleFontSize = parsed.fontSize ? parsed.fontSize * 0.9 : 4.5;
                if (!parsed.titleFontFamily) parsed.titleFontFamily = 'Inter';
                if (parsed.horizontalPadding === undefined) parsed.horizontalPadding = 1;
                setCustomization(c => ({...c, ...parsed}));
            }

            const savedPassage = localStorage.getItem(PASSAGE_KEY);
            setPassage(savedPassage ? JSON.parse(savedPassage) : null);

        } catch (e) {
            console.error("Failed to parse from local storage", e)
        }
    }
    syncState();

    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === CUSTOMIZATION_KEY || e.key === PASSAGE_KEY) {
            syncState();
        }
    }
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  useEffect(() => {
    if (containerRef.current) {
        const scale = containerRef.current.clientWidth / 1280; // Assuming 1280px is base presentation width
        setPreviewScale(scale);
    }
  }, [containerRef]);

  useEffect(() => {
    const adjustFontSize = () => {
        if (passage && textRef.current && containerRef.current && contentWrapperRef.current) {
            let currentFontSize = customization.fontSize;
            const contentWrapper = contentWrapperRef.current;
            const container = containerRef.current;

            contentWrapper.style.fontSize = `${currentFontSize * previewScale}rem`;

            const checkOverflow = () => {
                return textRef.current!.scrollHeight > (container.clientHeight - contentWrapper.offsetTop);
            }
            
            while(checkOverflow() && currentFontSize > 0.5) {
                currentFontSize -= 0.1;
                contentWrapper.style.fontSize = `${currentFontSize * previewScale}rem`;
            }
            setAdjustedFontSize(currentFontSize);
        } else {
            setAdjustedFontSize(customization.fontSize);
        }
    }
    adjustFontSize();
    const resizeObserver = new ResizeObserver(adjustFontSize);
    if (containerRef.current) {
        resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, [passage, customization.fontSize, previewScale, containerRef, contentWrapperRef, textRef]);


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

  const contentWrapperStyle = {
    fontSize: `${adjustedFontSize * previewScale}rem`
  }

  return (
    <div 
        ref={containerRef}
        style={containerStyle}
        className={cn(
            "aspect-video w-full rounded-md relative overflow-hidden flex flex-col items-center justify-center transition-colors duration-300",
            theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
        )}
    >
        {passage ? (
            <div ref={contentWrapperRef} className="w-full h-full flex flex-col items-center justify-center" style={contentWrapperStyle}>
                 <motion.h1
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
                    {passage.reference}
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
                    {passage.text}
                </motion.p>
            </div>
        ) : (
             <div className="text-center">
                <p className={cn("text-sm", theme === 'dark' ? 'text-neutral-400' : 'text-neutral-500')}>No passage selected</p>
            </div>
        )}
    </div>
  );
}

    