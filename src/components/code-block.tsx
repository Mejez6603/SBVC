
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard';
import { cn } from '@/lib/utils';

interface CodeBlockProps {
  command: string;
  className?: string;
}

export function CodeBlock({ command, className }: CodeBlockProps) {
  const [isCopied, handleCopy] = useCopyToClipboard(2000);

  return (
    <div className={cn("bg-gray-900/50 dark:bg-gray-800/20 rounded-md flex items-center justify-between p-2 pl-4 border border-gray-700/50", className)}>
      <code className="text-sm font-mono text-muted-foreground">
        <span className="text-green-400">$</span> {command}
      </code>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-gray-400 hover:text-white"
        onClick={() => handleCopy(command)}
      >
        {isCopied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
}
