
import { NavigationMenu } from '@/components/navigation-menu';
import { CodeBlock } from '@/components/code-block';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="h-screen w-full flex flex-col font-sans text-sm bg-background">
      <NavigationMenu />
      <main className="flex-1 flex justify-center py-12 px-4">
        <div className="w-full max-w-4xl space-y-8">
            <div className="text-center">
                <h1 className="text-4xl font-bold">About SBVC</h1>
                <p className="mt-2 text-lg text-muted-foreground">
                    A modern Bible presentation tool for services and study groups.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Getting Started</CardTitle>
                    <CardDescription>Follow these steps to get a local copy up and running.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                     <div>
                        <h3 className="font-semibold mb-2">1. Clone the repository</h3>
                        <p className="text-sm text-muted-foreground mb-2">First, you need to clone the project from GitHub.</p>
                        <CodeBlock command="git clone https://github.com/Mejez6603/SBVC.git" />
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">2. Navigate to the project directory</h3>
                        <p className="text-sm text-muted-foreground mb-2">Once cloned, move into the project folder.</p>
                        <CodeBlock command="cd SBVC" />
                    </div>
                     <div>
                        <h3 className="font-semibold mb-2">3. Install dependencies</h3>
                        <p className="text-sm text-muted-foreground mb-2">Install all the required packages using npm.</p>
                        <CodeBlock command="npm install" />
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">4. Run the development server</h3>
                        <p className="text-sm text-muted-foreground mb-2">Start the local server to see the application in action.</p>
                        <CodeBlock command="npm run dev" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Technologies Used</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                        <li>Next.js (App Router)</li>
                        <li>TypeScript</li>
                        <li>React</li>
                        <li>Tailwind CSS</li>
                        <li>ShadCN UI</li>
                        <li>Genkit for AI</li>
                        <li>Framer Motion</li>
                        <li>TanStack Virtual</li>
                    </ul>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
