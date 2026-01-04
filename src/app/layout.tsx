import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '@/context/app-context';
import { Toaster } from '@/components/ui/toaster';

export const metadata: Metadata = {
  title: 'SBVC',
  description: 'A clean and distraction-free way to read Bible passages.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,700;1,7..72,400&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Lato:wght@400;700&family=Montserrat:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&family=Ubuntu:wght@400;500;700&family=Noto+Sans:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        <AppProvider>
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
