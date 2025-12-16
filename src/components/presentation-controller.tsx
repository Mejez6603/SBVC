
'use client';

import { useAppContext } from '@/context/app-context';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Moon, Play, Sun, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const FULLSCREEN_KEY = 'sbvc-fullscreen-request';

export function PresentationController() {
  const { passage, setPassage, theme, toggleTheme } = useAppContext();

  const handleShowScreen = () => {
    try {
        if(passage) {
            localStorage.setItem('present-passage', JSON.stringify(passage));
        } else {
            localStorage.removeItem('present-passage');
        }
      window.open('/present', '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error("Could not open presentation window:", error);
    }
  };
  
  const handleClearScreen = () => {
    setPassage(null);
    try {
      localStorage.removeItem('present-passage');
    } catch (error) {
      console.error("Could not clear passage from local storage:", error);
    }
  }

  const handleFullscreen = () => {
    try {
      localStorage.setItem(FULLSCREEN_KEY, Date.now().toString());
    } catch (error) {
      console.error('Could not access local storage:', error);
    }
  };

  return (
    <div className="p-4 border-b">
      <AnimatePresence>
        {passage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="bg-card/50">
              <CardContent className="p-3">
                <div className="font-semibold text-sm mb-2">{passage.reference}</div>
                <p className="text-xs text-muted-foreground line-clamp-3">{passage.text}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-5 gap-2 mt-4">
        <Button variant="outline" size="icon" onClick={handleShowScreen}>
          <Play />
        </Button>
        <Button variant="outline" size="icon" onClick={handleClearScreen}>
          <X />
        </Button>
        <Button variant="outline" size="icon" onClick={handleFullscreen}>
          F
        </Button>
        <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun/> : <Moon />}
        </Button>
        <div />
      </div>
    </div>
  );
}
