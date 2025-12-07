
'use client';

import { useAppContext, Passage } from '@/context/app-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ExternalLink, Minus, Moon, Sun, ZoomIn, ZoomOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

function ControlBar() {
  const { theme, toggleTheme, increaseTextSize, decreaseTextSize, passage, toggleMinimize } = useAppContext();

  const handleShowScreen = () => {
    try {
      localStorage.setItem('present-passage', JSON.stringify(passage));
      window.open('/present', '_blank', 'noopener,noreferrer');
    } catch (error) {
      console.error("Could not open presentation window:", error);
    }
  };

  return (
    <div className="flex items-center gap-2 p-2 border-b">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleShowScreen}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Show on Screen</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={toggleMinimize}>
              <Minus className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Minimize</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <div className="flex-1" />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={decreaseTextSize}>
              <ZoomOut className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Decrease text size</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={increaseTextSize}>
              <ZoomIn className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Increase text size</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Toggle theme</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export function BibleViewer() {
  const { passage, textSize, isMinimized } = useAppContext();

  return (
    <div className="flex flex-col h-full">
      <ControlBar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 flex items-center justify-center">
        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="w-full max-w-4xl"
            >
              <Card className="h-full w-full shadow-lg border-none bg-transparent">
                <CardHeader>
                  <CardTitle className="font-headline text-3xl md:text-4xl text-center text-primary/90">
                    {passage.reference}
                  </CardTitle>
                </CardHeader>
                <CardContent className="mt-4">
                  <p
                    className="leading-relaxed md:leading-loose transition-all duration-300 ease-in-out text-center"
                    style={{ fontSize: `${textSize}px` }}
                  >
                    {passage.text}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
