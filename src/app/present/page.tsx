
'use client';

import { useEffect, useState } from 'react';
import type { Passage } from '@/context/app-context';
import { AnimatePresence, motion } from 'framer-motion';

const THEME_KEY = 'sbvc-theme';
const PASSAGE_KEY = 'present-passage';
const FULLSCREEN_KEY = 'sbvc-fullscreen-request';

export default function PresentPage() {
  const [passage, setPassage] = useState<Passage | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const enterFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      }
    }
  };

  const exitFullscreen = async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch (err) {
        console.error(`Error attempting to exit full-screen mode: ${err.message} (${err.name})`);
      }
    }
  };
  
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      enterFullscreen();
    } else {
      exitFullscreen();
    }
  };

  const syncStateFromStorage = () => {
    try {
      const savedTheme = localStorage.getItem(THEME_KEY) as 'dark' | 'light' | null;
      setTheme(savedTheme || 'dark');

      const savedPassage = localStorage.getItem(PASSAGE_KEY);
      setPassage(savedPassage ? JSON.parse(savedPassage) : null);
    } catch (error) {
      console.error("Failed to parse from local storage:", error);
      setPassage(null);
    }
  };

  useEffect(() => {
    syncStateFromStorage();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === PASSAGE_KEY || e.key === THEME_KEY) {
        syncStateFromStorage();
      }
      if (e.key === FULLSCREEN_KEY) {
        enterFullscreen();
      }
    };
    
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key.toLowerCase() === 'f') {
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

  return (
    <main className="flex h-screen w-screen items-center justify-center bg-background p-8 transition-colors duration-300">
      <AnimatePresence mode="wait">
        {passage ? (
          <motion.div
            key={passage.reference}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="text-center"
          >
            <h1 className="font-bold text-5xl sm:text-6xl md:text-7xl text-primary/90 mb-8">
              {passage.reference}
            </h1>
            <p className="text-3xl sm:text-4xl md:text-5xl leading-relaxed text-foreground max-w-7xl mx-auto whitespace-pre-wrap">
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
