'use client';

import { useAppContext } from '@/context/app-context';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Moon, Play, Sun, X, RefreshCw, Maximize } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { DraggablePreview } from './draggable-preview';

const CUSTOMIZATION_KEY = 'sbvc-customization';
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
      window.open('/present', 'present');
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

  const handleResetPosition = () => {
    const saved = localStorage.getItem(CUSTOMIZATION_KEY);
    if (saved) {
        const currentCustomization = JSON.parse(saved);
        currentCustomization.positions = { title: { x: 0, y: 0 }, text: { x: 0, y: 0 } };
        localStorage.setItem(CUSTOMIZATION_KEY, JSON.stringify(currentCustomization));
    }
  };

  const handleFullscreenRequest = () => {
    localStorage.setItem(FULLSCREEN_KEY, Date.now().toString());
  };

  return (
    <div className="p-4 border-b">
      <AnimatePresence>
        {passage ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <DraggablePreview passage={passage} />
          </motion.div>
        ) : (
            <Card className="bg-card/50 aspect-video flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No passage selected</p>
            </Card>
        )}
      </AnimatePresence>
      <div className="grid grid-cols-5 gap-2 mt-4">
        <Button variant="outline" size="icon" onClick={handleShowScreen}>
          <Play />
        </Button>
        <Button variant="outline" size="icon" onClick={handleClearScreen}>
          <X />
        </Button>
        <Button variant="outline" size="icon" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun/> : <Moon />}
        </Button>
        <Button variant="outline" size="icon" onClick={handleResetPosition}>
            <RefreshCw />
        </Button>
        <Button variant="outline" size="icon" onClick={handleFullscreenRequest}>
            <Maximize />
        </Button>
      </div>
    </div>
  );
}
