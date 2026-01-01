
'use client';

import { useState, useEffect, useRef } from 'react';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Button } from './ui/button';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, Palette, RefreshCw } from 'lucide-react';
import { Separator } from './ui/separator';

const HYMNALS_CUSTOMIZATION_KEY = 'sbvc-hymnals-customization';

type Customization = {
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

const defaultCustomization: Customization = {
    fontFamily: 'Inter',
    fontSize: 5,
    lineHeight: 1.5,
    titleFontFamily: 'Inter',
    titleFontSize: 4.5,
    textAlign: 'center',
    horizontalPadding: 1,
    positions: { 
        title: { x: 0, y: 0 },
        text: { x: 0, y: 0 } 
    },
    titleColor: '#D4A373',
    textColor: '#F5EBDD',
};

const presetColors = ['#D4A373', '#F5EBDD', '#FFFFFF', '#808080', '#000000'];

export function HymnalsCustomizationController() {
  const [customization, setCustomization] = useState<Customization>(defaultCustomization);
  const titleColorInputRef = useRef<HTMLInputElement>(null);
  const textColorInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedCustomization = localStorage.getItem(HYMNALS_CUSTOMIZATION_KEY);
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
      if (parsed.horizontalPadding === undefined) {
        parsed.horizontalPadding = 1;
      }
      if (parsed.lineHeight === undefined) {
        parsed.lineHeight = defaultCustomization.lineHeight;
      }
      if (!parsed.titleColor) {
        parsed.titleColor = defaultCustomization.titleColor;
      }
      if (!parsed.textColor) {
        parsed.textColor = defaultCustomization.textColor;
      }
      setCustomization(p => ({...p, ...parsed}));
    }
  }, []);

  const updateCustomization = (newCustomization: Partial<Customization>) => {
    const updated = { ...customization, ...newCustomization };
    setCustomization(updated);
    localStorage.setItem(HYMNALS_CUSTOMIZATION_KEY, JSON.stringify(updated));
  };
  
  const resetCustomization = () => {
      setCustomization(defaultCustomization);
      localStorage.setItem(HYMNALS_CUSTOMIZATION_KEY, JSON.stringify(defaultCustomization));
  }

  const handleResetPosition = () => {
    const saved = localStorage.getItem(HYMNALS_CUSTOMIZATION_KEY);
    if (saved) {
        const currentCustomization = JSON.parse(saved);
        const newCustomization = {
            ...currentCustomization,
            positions: { title: { x: 0, y: 0 }, text: { x: 0, y: 0 } }
        };
        setCustomization(newCustomization);
        localStorage.setItem(HYMNALS_CUSTOMIZATION_KEY, JSON.stringify(newCustomization));
    } else {
        updateCustomization({ positions: { title: { x: 0, y: 0 }, text: { x: 0, y: 0 } } });
    }
  };

  return (
    <div className="p-4 space-y-6">
       <div className="space-y-2">
        <div className="font-semibold text-sm">Title</div>
         <div className="space-y-2">
            <Label htmlFor="title-font-family">Font Family</Label>
            <Select
            value={customization.titleFontFamily}
            onValueChange={(value) => updateCustomization({ titleFontFamily: value })}
            >
            <SelectTrigger id="title-font-family">
                <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Inter">Inter (Sans-serif)</SelectItem>
                <SelectItem value="Literata">Literata (Serif)</SelectItem>
                <SelectItem value="monospace">Monospace</SelectItem>
                <SelectItem value="Georgia">Georgia</SelectItem>
                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                <SelectItem value="Roboto">Roboto</SelectItem>
                <SelectItem value="Open Sans">Open Sans</SelectItem>
                <SelectItem value="Lato">Lato</SelectItem>
                <SelectItem value="Montserrat">Montserrat</SelectItem>
                <SelectItem value="Oswald">Oswald</SelectItem>
                <SelectItem value="Raleway">Raleway</SelectItem>
                <SelectItem value="Merriweather">Merriweather</SelectItem>
                <SelectItem value="Playfair Display">Playfair Display</SelectItem>
                <SelectItem value="Ubuntu">Ubuntu</SelectItem>
                <SelectItem value="Noto Sans">Noto Sans</SelectItem>
            </SelectContent>
            </Select>
        </div>
         <div className="space-y-4">
            <Label htmlFor="title-font-size">Font Size ({customization.titleFontSize}rem)</Label>
            <Slider
              id="title-font-size"
              min={1}
              max={10}
              step={0.25}
              value={[customization.titleFontSize]}
              onValueChange={(value) => updateCustomization({ titleFontSize: value[0] })}
            />
        </div>
        <div className="space-y-2">
            <Label>Font Color</Label>
            <div className="flex items-center gap-3">
                {presetColors.map(color => (
                    <button
                        key={color}
                        aria-label={`Set color to ${color}`}
                        className={`h-6 w-6 rounded-full border transition-all ${customization.titleColor.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-ring ring-offset-2' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => updateCustomization({ titleColor: color })}
                    />
                ))}
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-full"
                    onClick={() => titleColorInputRef.current?.click()}
                >
                    <Palette className="h-4 w-4" />
                </Button>
                <input
                    ref={titleColorInputRef}
                    type="color"
                    value={customization.titleColor}
                    onInput={(e) => updateCustomization({ titleColor: e.currentTarget.value })}
                    className="sr-only"
                />
            </div>
        </div>
      </div>
      
      <Separator />

      <div className="space-y-2">
        <div className="font-semibold text-sm">Text</div>
        <Label htmlFor="font-family">Font Family</Label>
        <Select
          value={customization.fontFamily}
          onValueChange={(value) => updateCustomization({ fontFamily: value })}
        >
          <SelectTrigger id="font-family">
            <SelectValue placeholder="Select a font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Inter">Inter (Sans-serif)</SelectItem>
            <SelectItem value="Literata">Literata (Serif)</SelectItem>
            <SelectItem value="monospace">Monospace</SelectItem>
            <SelectItem value="Georgia">Georgia</SelectItem>
            <SelectItem value="Times New Roman">Times New Roman</SelectItem>
            <SelectItem value="Roboto">Roboto</SelectItem>
            <SelectItem value="Open Sans">Open Sans</SelectItem>
            <SelectItem value="Lato">Lato</SelectItem>
            <SelectItem value="Montserrat">Montserrat</SelectItem>
            <SelectItem value="Oswald">Oswald</SelectItem>
            <SelectItem value="Raleway">Raleway</SelectItem>
            <SelectItem value="Merriweather">Merriweather</SelectItem>
            <SelectItem value="Playfair Display">Playfair Display</SelectItem>
            <SelectItem value="Ubuntu">Ubuntu</SelectItem>
            <SelectItem value="Noto Sans">Noto Sans</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label htmlFor="font-size">Font Size ({customization.fontSize}rem)</Label>
        <Slider
          id="font-size"
          min={1}
          max={10}
          step={0.25}
          value={[customization.fontSize]}
          onValueChange={(value) => updateCustomization({ fontSize: value[0] })}
        />
      </div>

      <div className="space-y-4">
        <Label htmlFor="line-height">Line Spacing ({customization.lineHeight})</Label>
        <Slider
          id="line-height"
          min={1}
          max={3}
          step={0.1}
          value={[customization.lineHeight]}
          onValueChange={(value) => updateCustomization({ lineHeight: value[0] })}
        />
      </div>

      <div className="space-y-2">
        <Label>Font Color</Label>
        <div className="flex items-center gap-3">
            {presetColors.map(color => (
                <button
                    key={color}
                    aria-label={`Set color to ${color}`}
                    className={`h-6 w-6 rounded-full border transition-all ${customization.textColor.toLowerCase() === color.toLowerCase() ? 'ring-2 ring-ring ring-offset-2' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => updateCustomization({ textColor: color })}
                />
            ))}
            <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => textColorInputRef.current?.click()}
            >
                <Palette className="h-4 w-4" />
            </Button>
            <input
                ref={textColorInputRef}
                type="color"
                value={customization.textColor}
                onInput={(e) => updateCustomization({ textColor: e.currentTarget.value })}
                className="sr-only"
            />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Text Alignment</Label>
        <div className="grid grid-cols-4 gap-2">
          <Button
            variant={customization.textAlign === 'left' ? 'secondary' : 'outline'}
            onClick={() => updateCustomization({ textAlign: 'left' })}
            size="icon"
          >
            <AlignLeft />
          </Button>
          <Button
            variant={customization.textAlign === 'center' ? 'secondary' : 'outline'}
            onClick={() => updateCustomization({ textAlign: 'center' })}
            size="icon"
          >
            <AlignCenter />
          </Button>
          <Button
            variant={customization.textAlign === 'right' ? 'secondary' : 'outline'}
            onClick={() => updateCustomization({ textAlign: 'right' })}
            size="icon"
          >
            <AlignRight />
          </Button>
          <Button
            variant={customization.textAlign === 'justify' ? 'secondary' : 'outline'}
            onClick={() => updateCustomization({ textAlign: 'justify' })}
            size="icon"
          >
            <AlignJustify />
          </Button>
        </div>
      </div>
      
      <Separator />

      <div className="space-y-2">
        <div className="font-semibold text-sm">Layout</div>
        <div className="space-y-4">
            <Label htmlFor="horizontal-padding">Horizontal Padding ({customization.horizontalPadding}rem)</Label>
            <Slider
              id="horizontal-padding"
              min={0}
              max={10}
              step={0.5}
              value={[customization.horizontalPadding]}
              onValueChange={(value) => updateCustomization({ horizontalPadding: value[0] })}
            />
        </div>
      </div>

      <Separator />
      
      <div className="space-y-2">
        <Label>Position</Label>
        <Button variant="outline" className="w-full" onClick={handleResetPosition}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Positions
        </Button>
      </div>

      <Separator />
      
      <Button variant="destructive" className="w-full" onClick={resetCustomization}>
        Reset All Customizations
      </Button>

    </div>
  );
}
