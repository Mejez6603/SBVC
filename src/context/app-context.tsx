'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Passage = {
  reference: string;
  text: string;
} | null;

export type Hymn = {
    id?: number;
    number: number;
    title: string;
    lyrics: string[];
};

export interface MediaFile {
  name: string;
  url: string;
  type: string;
}

export interface MediaPlaybackState {
    isPlaying: boolean;
    currentTime: number;
    timestamp: number;
}

export type Customization = {
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


interface AppContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  passage: Passage;
  setPassage: (passage: Passage) => void;
  hymn: Hymn | null;
  setHymn: (hymn: Hymn | null) => void;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  preset: Hymn[];
  setPreset: (preset: Hymn[]) => void;
  mediaFiles: MediaFile[];
  setMediaFiles: (files: MediaFile[]) => void;
  activeMedia: MediaFile | null;
  setActiveMedia: (media: MediaFile | null) => void;
  mediaPlaybackState: MediaPlaybackState | null;
  setMediaPlaybackState: (state: MediaPlaybackState | null) => void;
  hymnalsCustomization: Customization;
  setHymnalsCustomization: (customization: Customization) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const THEME_KEY = 'sbvc-theme';
const PASSAGE_KEY = 'sbvc-passage';
const BACKGROUND_COLOR_KEY = 'sbvc-background-color';
const PRESET_KEY = 'sbvc-preset';
const MEDIA_FILES_KEY = 'sbvc-media-files';
const ACTIVE_MEDIA_KEY = 'sbvc-active-media';
const MEDIA_PLAYBACK_STATE_KEY = 'sbvc-media-playback-state';
const HYMNALS_CUSTOMIZATION_KEY = 'sbvc-hymnals-customization';

const defaultHymnalsCustomization: Customization = {
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
    titleColor: '#D4A373',
    textColor: '#F5EBDD',
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [passage, setPassageState] = useState<Passage>(null);
  const [hymn, setHymn] = useState<Hymn | null>(null);
  const [backgroundColor, setBackgroundColorState] = useState<string>('#000000');
  const [preset, setPresetState] = useState<Hymn[]>([]);
  const [mediaFiles, setMediaFilesState] = useState<MediaFile[]>([]);
  const [activeMedia, setActiveMediaState] = useState<MediaFile | null>(null);
  const [mediaPlaybackState, setMediaPlaybackStateState] = useState<MediaPlaybackState | null>(null);
  const [hymnalsCustomization, setHymnalsCustomizationState] = useState<Customization>(defaultHymnalsCustomization);

  useEffect(() => {
    const storedTheme = localStorage.getItem(THEME_KEY) as 'dark' | 'light' | null;
    setTheme(storedTheme || 'dark');

    const storedPassage = localStorage.getItem(PASSAGE_KEY);
    if (storedPassage) {
      try {
        setPassageState(JSON.parse(storedPassage));
      } catch (error) {
        console.error('Could not parse stored passage:', error);
      }
    }

    const storedBackgroundColor = localStorage.getItem(BACKGROUND_COLOR_KEY);
    if (storedBackgroundColor) {
        setBackgroundColorState(storedBackgroundColor);
    }

    const storedPreset = localStorage.getItem(PRESET_KEY);
    if (storedPreset) {
        try {
            setPresetState(JSON.parse(storedPreset));
        } catch (error) {
            console.error('Could not parse stored preset:', error);
        }
    }

    const storedMediaFiles = localStorage.getItem(MEDIA_FILES_KEY);
    if (storedMediaFiles) {
        try {
            setMediaFilesState(JSON.parse(storedMediaFiles));
        } catch (error) {
            console.error('Could not parse stored media files:', error);
        }
    }

    const storedActiveMedia = localStorage.getItem(ACTIVE_MEDIA_KEY);
    if (storedActiveMedia) {
        try {
            setActiveMediaState(JSON.parse(storedActiveMedia));
        } catch (error) {
            console.error('Could not parse stored active media:', error);
        }
    }

    const storedHymnalsCustomization = localStorage.getItem(HYMNALS_CUSTOMIZATION_KEY);
    if (storedHymnalsCustomization) {
        try {
            const parsed = JSON.parse(storedHymnalsCustomization);
            setHymnalsCustomizationState(hymnalsCustomization => ({...hymnalsCustomization, ...parsed}));
        } catch (error) {
            console.error('Could not parse stored hymnals customization:', error);
        }
    }

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === THEME_KEY) {
        setTheme(event.newValue as 'dark' | 'light' || 'dark');
      }
      if (event.key === PASSAGE_KEY) {
        if (event.newValue) {
          try {
            setPassageState(JSON.parse(event.newValue));
          } catch (error) {
            console.error('Could not parse stored passage on change:', error);
          }
        } else {
          setPassageState(null);
        }
      }
      if (event.key === BACKGROUND_COLOR_KEY) {
        setBackgroundColorState(event.newValue || '#000000');
      }
      if (event.key === PRESET_KEY) {
        if (event.newValue) {
          try {
            setPresetState(JSON.parse(event.newValue));
          } catch (error) {
            console.error('Could not parse stored preset on change:', error);
          }
        } else {
          setPresetState([]);
        }
      }
      if (event.key === MEDIA_FILES_KEY) {
        if (event.newValue) {
          try {
            setMediaFilesState(JSON.parse(event.newValue));
          } catch (error) {
            console.error('Could not parse stored media files on change:', error);
          }
        } else {
          setMediaFilesState([]);
        }
      }
      if (event.key === ACTIVE_MEDIA_KEY) {
        if (event.newValue) {
          try {
            setActiveMediaState(JSON.parse(event.newValue));
          } catch (error) {
            console.error('Could not parse stored active media on change:', error);
          }
        } else {
          setActiveMediaState(null);
        }
      }
      if (event.key === MEDIA_PLAYBACK_STATE_KEY) {
        if (event.newValue) {
            try {
                setMediaPlaybackStateState(JSON.parse(event.newValue));
            } catch (error) {
                console.error('Could not parse stored media playback state on change:', error);
            }
        } else {
            setMediaPlaybackStateState(null);
        }
      }
      if (event.key === HYMNALS_CUSTOMIZATION_KEY) {
        if (event.newValue) {
            try {
                const parsed = JSON.parse(event.newValue);
                setHymnalsCustomizationState(hymnalsCustomization => ({...hymnalsCustomization, ...parsed}));
            } catch (error) {
                console.error('Could not parse stored hymnals customization on change:', error);
            }
        } else {
            setHymnalsCustomizationState(defaultHymnalsCustomization);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'dark' ? 'light' : 'dark';
      localStorage.setItem(THEME_KEY, newTheme);
      return newTheme;
    });
  };

  const setPassage = (newPassage: Passage) => {
    setPassageState(newPassage);
    if (newPassage) {
      localStorage.setItem(PASSAGE_KEY, JSON.stringify(newPassage));
    } else {
      localStorage.removeItem(PASSAGE_KEY);
    }
  };

  const setBackgroundColor = (color: string) => {
    setBackgroundColorState(color);
    localStorage.setItem(BACKGROUND_COLOR_KEY, color);
  };

  const setPreset = (newPreset: Hymn[]) => {
    setPresetState(newPreset);
    localStorage.setItem(PRESET_KEY, JSON.stringify(newPreset));
  };

  const setMediaFiles = (newFiles: MediaFile[]) => {
    setMediaFilesState(newFiles);
    localStorage.setItem(MEDIA_FILES_KEY, JSON.stringify(newFiles));
  };

  const setActiveMedia = (newMedia: MediaFile | null) => {
    setActiveMediaState(newMedia);
    if (newMedia) {
        localStorage.setItem(ACTIVE_MEDIA_KEY, JSON.stringify(newMedia));
    } else {
        localStorage.removeItem(ACTIVE_MEDIA_KEY);
    }
  };

  const setMediaPlaybackState = (newState: MediaPlaybackState | null) => {
    setMediaPlaybackStateState(newState);
    if (newState) {
        localStorage.setItem(MEDIA_PLAYBACK_STATE_KEY, JSON.stringify(newState));
    } else {
        localStorage.removeItem(MEDIA_PLAYBACK_STATE_KEY);
    }
  };

  const setHymnalsCustomization = (newCustomization: Customization) => {
    setHymnalsCustomizationState(newCustomization);
    localStorage.setItem(HYMNALS_CUSTOMIZATION_KEY, JSON.stringify(newCustomization));
  };

  const value = {
    theme,
    toggleTheme,
    passage,
    setPassage,
    hymn,
    setHymn,
    backgroundColor,
    setBackgroundColor,
    preset,
    setPreset,
    mediaFiles,
    setMediaFiles,
    activeMedia,
    setActiveMedia,
    mediaPlaybackState,
    setMediaPlaybackState,
    hymnalsCustomization,
    setHymnalsCustomization
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
