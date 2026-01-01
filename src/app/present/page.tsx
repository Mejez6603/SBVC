
'use client';

import { useEffect, useState, useRef } from 'react';
import type { Passage } from '@/context/app-context';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';

const THEME_KEY = 'sbvc-theme';
const PASSAGE_KEY = 'sbvc-passage';
const FULLSCREEN_KEY = 'sbvc-fullscreen-request';
const CUSTOMIZATION_KEY = 'sbvc-customization';
const HYMNALS_CUSTOMIZATION_KEY = 'sbvc-hymnals-customization';
const BACKGROUND_COLOR_KEY = 'sbvc-background-color';
const CONTENT_TYPE_KEY = 'sbvc-content-type';

type Customization = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  titleFontFamily: string;
  titleFontSize: number;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  horizontalPadding: number;
  positions: {
    title: { x: number; y: number };
    text: { x: number; y: number };
  };
  titleColor: string;
  textColor: string;
};

export default function PresentPage() {
  const [passage, setPassage] = useState<Passage | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [backgroundColor, setBackgroundColor] = useState<string>('#000000');
  const [customization, setCustomization] = useState<Customization>({
    fontFamily: 'Inter',
    fontSize: 5,
    lineHeight: 1.5,
    titleFontFamily: 'Inter',
    titleFontSize: 4.5,
    textAlign: 'center',
    horizontalPadding: 1,
    positions: {
      title: { x: 0, y: 0 },
      text: { x: 0, y: 0 },
    },
    titleColor: '#ffffff',
    textColor: '#ffffff',
  });

  const [adjustedFontSize, setAdjustedFontSize] = useState(customization.fontSize);
  const textRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const contentWrapperRef = useRef<HTMLDivElement>(null);

  const [isDraggingTitle, setIsDraggingTitle] = useState(false);
  const [isDraggingText, setIsDraggingText] = useState(false);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err: any) {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      }
    } else {
      if (document.exitFullscreen) {
        try {
          await document.exitFullscreen();
        } catch (err: any) {
          console.error(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`);
        }
      }
    }
  };

  const handleDragEnd = (info: PanInfo, type: 'title' | 'text') => {
    const newPositions = { ...customization.positions };
    newPositions[type] = {
      x: customization.positions[type].x + info.offset.x,
      y: customization.positions[type].y + info.offset.y,
    };
    const newCustomization = { ...customization, positions: newPositions };
    setCustomization(newCustomization);
    const contentType = localStorage.getItem(CONTENT_TYPE_KEY) || 'bible';
    const key = contentType === 'bible' ? CUSTOMIZATION_KEY : HYMNALS_CUSTOMIZATION_KEY;
    localStorage.setItem(key, JSON.stringify(newCustomization));

    if (type === 'title') {
        setIsDraggingTitle(false);
    } else {
        setIsDraggingText(false);
    }
  };

  useEffect(() => {
    const syncStateFromStorage = (key: string | null) => {
      try {
        if (key === null || key === THEME_KEY) {
          const savedTheme = localStorage.getItem(THEME_KEY) as 'dark' | 'light' | null;
          setTheme(savedTheme || 'dark');
        }
        
        if (key === null || key === PASSAGE_KEY) {
          const savedPassage = localStorage.getItem(PASSAGE_KEY);
          setPassage(savedPassage ? JSON.parse(savedPassage) : null);
        }

        if (key === null || key === BACKGROUND_COLOR_KEY) {
          const savedBackgroundColor = localStorage.getItem(BACKGROUND_COLOR_KEY);
          if (savedBackgroundColor) {
            setBackgroundColor(savedBackgroundColor);
          }
        }

        if (key === null || key === CUSTOMIZATION_KEY || key === HYMNALS_CUSTOMIZATION_KEY) {
            const contentType = localStorage.getItem(CONTENT_TYPE_KEY) || 'bible';
            const customizationKey = contentType === 'bible' ? CUSTOMIZATION_KEY : HYMNALS_CUSTOMIZATION_KEY;
            const savedCustomization = localStorage.getItem(customizationKey);
            if (savedCustomization) {
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
                if (parsed.lineHeight === undefined) {
                  parsed.lineHeight = 1.5;
                }
                if (!parsed.titleColor) {
                  parsed.titleColor = '#ffffff';
                }
                if (!parsed.textColor) {
                  parsed.textColor = '#ffffff';
                }
                setCustomization(c => ({...c, ...parsed}));
            }
        }
      } catch (error) {
        console.error("Failed to parse from local storage:", error);
        if (key === null || key === PASSAGE_KEY) {
          setPassage(null);
        }
      }
    };
    
    // Set unique name for the presentation window
    window.name = 'present';
    
    syncStateFromStorage(null); // Initial sync

    const handleStorageChange = (e: StorageEvent) => {
      syncStateFromStorage(e.key);
      
      if (e.key === FULLSCREEN_KEY) {
        // This is not guaranteed to work due to browser security restrictions
        // but we keep it as a secondary trigger. The primary is the keydown.
        toggleFullscreen();
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'f' && !e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            toggleFullscreen();
        }
    }

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);
  
  useEffect(() => {
    const adjustFontSize = () => {
        if (passage && textRef.current && containerRef.current && contentWrapperRef.current) {
            let currentFontSize = customization.fontSize;
            const contentWrapper = contentWrapperRef.current;
            const container = containerRef.current;

            // Apply the current font size to measure
            contentWrapper.style.fontSize = `${currentFontSize}rem`;

            const checkOverflow = () => {
                // Ensure textRef has settled before measuring
                return textRef.current!.scrollHeight > container.clientHeight - contentWrapper.offsetTop;
            }
            
            // Iteratively reduce font size until it fits
            while(checkOverflow() && currentFontSize > 0.5) {
                currentFontSize -= 0.1;
                contentWrapper.style.fontSize = `${currentFontSize}rem`;
            }

            setAdjustedFontSize(currentFontSize);
        } else {
            setAdjustedFontSize(customization.fontSize);
        }
    }
    // Adjust on initial load and when content changes
    adjustFontSize();
    
    // Adjust on window resize
    window.addEventListener('resize', adjustFontSize);
    return () => window.removeEventListener('resize', adjustFontSize);

}, [passage, customization, containerRef, contentWrapperRef, textRef]);


  const passageStyle = {
    fontFamily: customization.fontFamily,
    textAlign: customization.textAlign,
    color: customization.textColor,
    lineHeight: customization.lineHeight,
  }
  
  const titleStyle = {
    fontFamily: customization.titleFontFamily,
    fontSize: `${customization.titleFontSize}rem`,
    textAlign: customization.textAlign,
    color: customization.titleColor,
  }

  const mainStyle = {
    paddingLeft: `${customization.horizontalPadding}rem`,
    paddingRight: `${customization.horizontalPadding}rem`,
    backgroundColor: backgroundColor,
  }
  
  const contentWrapperStyle = {
    fontSize: `${adjustedFontSize}rem`
  }

  return (
    <main ref={containerRef} className="flex h-screen w-screen items-center justify-center py-4 transition-colors duration-300 overflow-hidden" style={mainStyle}>
      <AnimatePresence mode="wait">
        {passage ? (
          <motion.div
            key={`${passage.reference}-${passage.text}`}
            ref={contentWrapperRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full h-full flex flex-col items-center justify-center"
            style={contentWrapperStyle}
          >
            {passage.reference && (
              <motion.h1 
                  drag
                  dragMomentum={false}
                  onDragStart={() => setIsDraggingTitle(true)}
                  onDragEnd={(e, i) => handleDragEnd(i, 'title')}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                      opacity: 1,
                      x: isDraggingTitle ? undefined : customization.positions.title.x,
                      y: isDraggingTitle ? undefined : customization.positions.title.y
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  className="font-bold mb-2 cursor-grab active:cursor-grabbing"
                  style={titleStyle}
              >
                {passage.reference}
              </motion.h1>
            )}
            {passage.text && (
              <motion.p
                  ref={textRef}
                  drag
                  dragMomentum={false}
                  onDragStart={() => setIsDraggingText(true)}
                  onDragEnd={(e, i) => handleDragEnd(i, 'text')}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{
                      opacity: 1,
                      x: isDraggingText ? undefined : customization.positions.text.x,
                      y: isDraggingText ? undefined : customization.positions.text.y
                  }}
                  exit={{ opacity: 0, y: -20 }}
                  className="whitespace-pre-wrap cursor-grab active:cursor-grabbing"
                  style={passageStyle}
              >
                {passage.text}
              </motion.p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="no-passage"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-primary/90">SBVC</h1>
            <p className="mt-4 text-xl text-foreground/80">No passage selected for presentation.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
