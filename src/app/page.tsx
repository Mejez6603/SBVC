
'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  const openControlPanel = () => {
    window.open('/controller', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
      <h1 className="text-4xl font-bold text-primary/90 mb-4">VerseView</h1>
      <p className="text-xl text-muted-foreground mb-8">Your Bible Presentation Assistant</p>
      <Button onClick={openControlPanel} size="lg">
        Open Control Panel
      </Button>
    </div>
  );
}
