
'use client';

import { useState, useEffect } from 'react';

export function useCopyToClipboard(timeout = 2000): [boolean, (text: string) => void] {
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCopied) {
      timer = setTimeout(() => {
        setIsCopied(false);
      }, timeout);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [isCopied, timeout]);

  const handleCopy = (text: string) => {
    if (typeof window === 'undefined' || !navigator.clipboard) {
      console.warn('Clipboard API not available');
      return;
    }

    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return [isCopied, handleCopy];
}
