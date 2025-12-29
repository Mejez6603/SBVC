
'use client';

import { useEffect, useState, useRef } from 'react';
import type { Passage } from '@/context/app-context';
import { AnimatePresence, motion } from 'framer-motion';

const THEME_KEY = 'sbvc-theme';
const PASSAGE_KEY = 'present-passage';
const FULLSCREEN_KEY = 'sbvc-fullscreen-request';
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

export default function PresentPage() {
  const [passage, setPassage] = useState<Passage | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
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

  const [adjustedFontSize, setAdjustedFontSize] = useState(customization.fontSize);
  const textRef = useRef<HTMLParagraphElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      }
    } else {
      if (document.exitFullscreen) {
        try {
          await document.exitFullscreen();
        } catch (err) {
          console.error(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`);
        }
      }
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

        if (key === null || key === CUSTOMIZATION_KEY) {
            const savedCustomization = localStorage.getItem(CUSTOMIZATION_KEY);
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
    if (passage && textRef.current && containerRef.current) {
        let currentFontSize = customization.fontSize;
        textRef.current.style.fontSize = `${currentFontSize}rem`;

        const checkOverflow = () => {
            const isOverflowing = textRef.current!.scrollHeight > containerRef.current!.clientHeight || textRef.current!.scrollWidth > containerRef.current!.clientWidth;
            return isOverflowing;
        }

        if (checkOverflow()) {
            while(checkOverflow() && currentFontSize > 1) {
                currentFontSize -= 0.2;
                textRef.current.style.fontSize = `${currentFontSize}rem`;
            }
        }
        setAdjustedFontSize(currentFontSize);
    } else {
        setAdjustedFontSize(customization.fontSize);
    }
}, [passage, customization.fontSize, customization.fontFamily, customization.textAlign, containerRef.current?.clientWidth, containerRef.current?.clientHeight]);


  const passageStyle = {
    fontFamily: customization.fontFamily,
    fontSize: `${adjustedFontSize}rem`,
    textAlign: customization.textAlign,
  }
  
  const titleStyle = {
    fontFamily: customization.titleFontFamily,
    fontSize: `${customization.titleFontSize}rem`,
    textAlign: customization.textAlign,
  }

  return (
    <main ref={containerRef} className="flex h-screen w-screen items-center justify-center bg-background px-2 py-4 transition-colors duration-300 overflow-hidden">
      <AnimatePresence mode="wait">
        {passage ? (
          <motion.div
            key={passage.reference}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full h-full flex flex-col items-center justify-center"
          >
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, x: customization.positions.title.x, y: customization.positions.title.y }}
                exit={{ opacity: 0, y: -20 }}
                className="font-bold text-primary/90 mb-2"
                style={titleStyle}
            >
              {passage.reference}
            </motion.h1>
            <motion.p
                ref={textRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, x: customization.positions.text.x, y: customization.positions.text.y }}
                exit={{ opacity: 0, y: -20 }}
                className="leading-relaxed text-foreground max-w-full whitespace-pre-wrap"
                style={passageStyle}
            >
              {passage.text}
            </motion.p>
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
