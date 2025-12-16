
'use client';

import { useEffect, useState } from 'react';
import type { Passage } from '@/context/app-context';
import { AnimatePresence, motion } from 'framer-motion';

export default function PresentPage() {
  const [passage, setPassage] = useState<Passage | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const updatePassage = () => {
    try {
      const savedPassage = localStorage.getItem('present-passage');
      if (savedPassage) {
        setPassage(JSON.parse(savedPassage));
      } else {
        setPassage(null);
      }
    } catch (error) {
      console.error("Failed to parse passage from local storage:", error);
      setPassage(null);
    }
  };

  const updateTheme = () => {
    const savedTheme = localStorage.getItem('sbvc-theme') as 'dark' | 'light' | null;
    setTheme(savedTheme || 'dark');
  };

  useEffect(() => {
    // Initial load for both theme and passage
    updatePassage();
    updateTheme();

    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'present-passage') {
            updatePassage();
        }
        if (e.key === 'sbvc-theme') {
            updateTheme();
        }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
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
            <h1 className="text-4xl font-bold text-primary/90">VerseView</h1>
            <p className="mt-4 text-xl text-foreground/80">No passage selected for presentation.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
