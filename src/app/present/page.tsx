'use client';

import { useState, useEffect } from 'react';
import { useAppContext, Passage, Hymn, MediaFile, Customization } from '@/context/app-context';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { VideoPlayer } from '@/components/video-player';

const PREACHING_CUSTOMIZATION_KEY = 'sbvc-customization';
const HYMNALS_CUSTOMIZATION_KEY = 'sbvc-hymnals-customization';
const FULLSCREEN_KEY = 'sbvc-fullscreen-request';
const CONTENT_TYPE_KEY = 'sbvc-content-type';


// Helper function to handle font family names
const getFontFamily = (font: string) => {
  if (font.includes(' ')) {
    return `'${font}'`;
  }
  return font;
};

export default function PresentPage() {
  const {
    passage,
    hymn,
    backgroundColor,
    activeMedia,
    hymnalsCustomization,
  } = useAppContext();

  // State for preaching customization
  const [preachingCustomization, setPreachingCustomization] = useState<Customization>({
    fontFamily: 'Inter',
    fontSize: 5,
    titleFontFamily: 'Inter',
    titleFontSize: 4.5,
    textAlign: 'center',
    horizontalPadding: 1,
    positions: { title: { x: 0, y: 0 }, text: { x: 0, y: 0 } },
    titleColor: '#D4A373',
    textColor: '#F5EBDD',
    lineHeight: 1.5,
  });

  const [contentType, setContentType] = useState<string | null>(null);

  const displayContent = passage || (hymn ? { reference: hymn.title, text: hymn.lyrics.join('') } : null);

  useEffect(() => {
    const syncContentType = () => {
        setContentType(localStorage.getItem(CONTENT_TYPE_KEY));
    }

    const syncPreachingCustomization = () => {
        try {
            const saved = localStorage.getItem(PREACHING_CUSTOMIZATION_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setPreachingCustomization(c => ({...c, ...parsed}));
            }
        } catch(e) {
            console.error("Failed to parse preaching customization from local storage", e);
        }
    };

    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === FULLSCREEN_KEY) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
        }
        if (e.key === CONTENT_TYPE_KEY) {
            syncContentType();
        }
        if (e.key === PREACHING_CUSTOMIZATION_KEY) {
            syncPreachingCustomization();
        }
    }

    syncContentType();
    syncPreachingCustomization();

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const customization = contentType === 'hymnal' ? hymnalsCustomization : preachingCustomization;

  const passageStyle = {
    fontFamily: getFontFamily(customization.fontFamily),
    fontSize: `${customization.fontSize}rem`,
    lineHeight: customization.lineHeight,
    textAlign: customization.textAlign,
    color: customization.textColor,
  }
  
  const titleStyle = {
    fontFamily: getFontFamily(customization.titleFontFamily),
    fontSize: `${customization.titleFontSize}rem`,
    color: customization.titleColor,
    textAlign: customization.textAlign,
  }

  const containerStyle = {
      backgroundColor: backgroundColor,
      paddingLeft: `${customization.horizontalPadding}rem`,
      paddingRight: `${customization.horizontalPadding}rem`,
      overflow: 'hidden',
  }

  return (
    <div 
        style={containerStyle}
        className={cn(
            "h-screen w-screen flex flex-col items-center justify-center transition-colors duration-300",
        )}
    >
      {activeMedia ? (
        <VideoPlayer 
            file={activeMedia} 
            isMuted={false} 
            showControls={false} 
            isControlling={false}
            containerClassName="w-full h-full"
            className="w-full h-full object-cover"
        />
      ) : displayContent ? (
        <div className="w-full h-full flex flex-col items-center justify-center">
             <motion.h1
                initial={{ x: 0, y: 0 }}
                animate={{ 
                    x: customization.positions.title.x,
                    y: customization.positions.title.y
                }}
                className="font-bold mb-4"
                style={titleStyle}
            >
                {displayContent.reference}
            </motion.h1>
            <motion.p
                initial={{ x: 0, y: 0 }}
                animate={{ 
                    x: customization.positions.text.x,
                    y: customization.positions.text.y 
                }}
                className="whitespace-pre-wrap"
                style={passageStyle}
            >
                {displayContent.text}
            </motion.p>
        </div>
    ) : (
        <div className="text-center text-white/80">
           <p className="text-2xl">Sabbath School and Bible Study</p>
        </div>
    )}
    </div>
  );
}
