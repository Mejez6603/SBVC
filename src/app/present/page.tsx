
'use client';

import { useEffect, useState } from 'react';
import type { Passage } from '@/context/app-context';
import { AnimatePresence, motion } from 'framer-motion';

export default function PresentPage() {
  const [passage, setPassage] = useState<Passage | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    try {
      const savedPassage = localStorage.getItem('present-passage');
      if (savedPassage) {
        setPassage(JSON.parse(savedPassage));
      }
      const savedTheme = localStorage.getItem('sbvc-theme') as 'dark' | 'light' | null;
      if (savedTheme) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error("Failed to load data from local storage:", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.className = '';
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  return (
    <main className="flex h-screen w-screen items-center justify-center bg-background p-8 transition-colors duration-300">
      <AnimatePresence>
        {passage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
            className="text-center"
          >
            <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl font-bold text-primary/90 mb-8">
              {passage.reference}
            </h1>
            <p className="font-body text-3xl sm:text-4xl md:text-5xl leading-relaxed text-foreground max-w-7xl mx-auto">
              {passage.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
       {!passage && (
          <div className="text-center">
            <h1 className="font-headline text-4xl font-bold text-primary/90">VerseView</h1>
            <p className="mt-4 text-xl text-foreground/80">No passage selected for presentation.</p>
          </div>
       )}
    </main>
  );
}
