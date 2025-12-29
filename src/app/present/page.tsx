
'use client';

import { useEffect, useState } from 'react';
import type { Passage } from '@/context/app-context';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';

const THEME_KEY = 'sbvc-theme';
const PASSAGE_KEY = 'present-passage';
const FULLSCREEN_KEY = 'sbvc-fullscreen-request';
const CUSTOMIZATION_KEY = 'sbvc-customization';

type Customization = {
  fontFamily: string;
  fontSize: number;
  textAlign: 'left' | 'center' | 'right';
  position: { x: number, y: number };
};

export default function PresentPage() {
  const [passage, setPassage] = useState<Passage | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [customization, setCustomization] = useState<Customization>({
    fontFamily: 'Inter',
    fontSize: 5,
    textAlign: 'center',
    position: { x: 0, y: 0 },
  });
  
  const [isDragging, setIsDragging] = useState(false);

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
  
  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const newPos = {
        x: customization.position.x + info.delta.x,
        y: customization.position.y + info.delta.y,
    };
    
    const newCustomization = { ...customization, position: newPos };
    setCustomization(newCustomization);
    localStorage.setItem(CUSTOMIZATION_KEY, JSON.stringify(newCustomization));
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
                setCustomization(JSON.parse(savedCustomization));
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
  
  const passageStyle = {
    fontFamily: customization.fontFamily,
    fontSize: `${customization.fontSize}rem`,
    textAlign: customization.textAlign,
  }

  return (
    <main className="flex h-screen w-screen items-center justify-center bg-background p-8 transition-colors duration-300 overflow-hidden">
      <AnimatePresence mode="wait">
        {passage ? (
          <motion.div
            key={passage.reference}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, x: customization.position.x, y: customization.position.y }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            drag
            onDragStart={() => setIsDragging(true)}
            onDragEnd={() => setIsDragging(false)}
            onDrag={handleDrag}
            dragMomentum={false}
            className="text-center cursor-grab"
            style={{
                cursor: isDragging ? 'grabbing' : 'grab'
            }}
          >
            <h1 className="font-bold text-5xl sm:text-6xl md:text-7xl text-primary/90 mb-8" style={{ fontSize: `${customization.fontSize * 0.9}rem`}}>
              {passage.reference}
            </h1>
            <p className="leading-relaxed text-foreground max-w-7xl mx-auto whitespace-pre-wrap" style={passageStyle}>
              {passage.text}
            </p>
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
