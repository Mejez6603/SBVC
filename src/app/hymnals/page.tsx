import { NavigationMenu } from '@/components/navigation-menu';

export default function HymnalsPage() {
  return (
    <div className="h-screen w-full flex flex-col font-sans text-sm">
      <NavigationMenu />
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-muted-foreground">Soon</h1>
      </div>
    </div>
  );
}
