'use client';

import { NavigationMenu } from '@/components/navigation-menu';
import React, { useRef } from 'react';

// The navigation links, matching the hardcoded IDs in the content below
const navHeadings = [
  { text: 'Description', slug: 'description' },
  { text: 'Features', slug: 'features' },
  { text: 'How The System Works', slug: 'how-the-system-works' },
  { text: 'Changelog', slug: 'changelog' },
  { text: 'Technologies Used', slug: 'technologies-used' },
  { text: 'Getting Started', slug: 'getting-started' },
  { text: 'Deployment', slug: 'deployment' },
  { text: 'Future Enhancements', slug: 'future-enhancements' },
  { text: 'Acknowledgements', slug: 'acknowledgements' },
  { text: 'License', slug: 'license' },
];

// The About page is now a single, self-contained client component.
// The content is hardcoded directly into the JSX, removing all server-side
// dependencies and fixing the rendering and scrolling issues.
export default function AboutPage() {
  const mainContentRef = useRef<HTMLElement>(null);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    const container = mainContentRef.current;
    const targetElement = document.getElementById(slug);

    if (container && targetElement) {
      const containerRect = container.getBoundingClientRect();
      const targetRect = targetElement.getBoundingClientRect();
      const offset = targetRect.top - containerRect.top;
      const newScrollTop = container.scrollTop + offset;

      container.scrollTo({ top: newScrollTop, behavior: 'smooth' });
      window.history.pushState(null, '', `#${slug}`);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col font-sans text-sm">
      <NavigationMenu />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 overflow-y-auto p-8 border-r border-neutral-800 hidden md:block">
          <h3 className="text-lg font-semibold mb-4 text-white">On this page</h3>
          <nav><ul>{navHeadings.map(h => (<li key={h.slug} className="mb-2"><a href={`#${h.slug}`} onClick={e => handleNavClick(e, h.slug)} className="block text-neutral-400 hover:text-white transition-colors">{h.text}</a></li>))}</ul></nav>
        </aside>
        <main ref={mainContentRef} className="flex-1 overflow-y-auto p-8">
          <div className="prose prose-invert mx-auto">
            <h1>SBVC - Show Bible Verse Controller</h1>
            <h2 id="description">Description</h2>
            <p>SBVC is a modern, web-based application designed to facilitate the presentation of Bible passages for church services, Bible studies, and other gatherings. Built with Next.js and TypeScript, it offers a clean, distraction-free viewing experience for the audience and a powerful, intuitive control panel for the operator.</p>
            <img src="/images/sbvc001.png" alt="SBVC Screenshot" />
            <p>The system uses a dual-window approach:</p>
            <ol>
              <li><strong>Controller Window</strong>: A comprehensive dashboard for selecting books, chapters, and verses, searching for topics, customizing the look and feel, and previewing the output.</li>
              <li><strong>Presentation Window</strong>: A separate, clean output screen designed for a secondary monitor or projector. It displays only the selected verse and reference, ensuring the audience remains focused on the text.</li>
            </ol>
            <hr />
            <h2 id="features">Features</h2>
            <ul>
              <li><strong>Multi-Version Bible Support</strong>: Seamlessly switch between English and Tagalog translations.</li>
              <li><strong>Dual-Window Operation</strong>: Manage content in one window while presenting it cleanly in another.</li>
              <li><strong>AI-Powered Search</strong>: A powerful search tool to find verses by topic or keyword.</li>
              <li><strong>High-Performance Results</strong>: A virtualized list ensures smooth scrolling with thousands of matches.</li>
              <li><strong>Live Presentation Preview</strong>: A real-time, aspect-ratio-correct preview of the presentation screen.</li>
              <li><strong>Advanced Customization</strong>: Control typography, alignment, and layout.</li>
              <li><strong>Draggable Elements</strong>: Directly manipulate the position of text in the live preview.</li>
            </ul>
            <hr />
            <h2 id="how-the-system-works">How The System Works</h2>
            <p>SBVC leverages `localStorage` as a high-speed communication channel between the controller and presentation windows.</p>
            <ol>
                <li><strong>Verse Selection</strong>: The operator selects a verse, and the data is written to `localStorage`.</li>
                <li><strong>State Synchronization</strong>: The presentation window listens for storage events and updates its display instantly.</li>
                <li><strong>Customization</strong>: Theme, font, and layout settings are also synced via `localStorage`.</li>
            </ol>
            <hr />
            <h2 id="changelog">Changelog</h2>
            <p>Key milestones include UI implementation, state management with React Context, presentation screen development, advanced customization controls, and the integration of an AI-powered search with a virtualized results list.</p>
            <hr />
            <h2 id="technologies-used">Technologies Used</h2>
            <ul>
              <li><strong>Framework</strong>: Next.js (with App Router)</li>
              <li><strong>Language</strong>: TypeScript</li>
              <li><strong>Styling</strong>: Tailwind CSS</li>
              <li><strong>UI Components</strong>: ShadCN UI</li>
              <li><strong>Generative AI</strong>: Genkit</li>
            </ul>
            <hr />
            <h2 id="getting-started">Getting Started</h2>
            <p>To run locally, clone the repository, install dependencies, and run the development server.</p>
            <pre><code>git clone https://github.com/Mejez6603/SBVC.git\ncd SBVC\nnpm install\nnpm run dev</code></pre>
            <hr />
            <h2 id="deployment">Deployment</h2>
            <p>The application is configured for easy deployment on platforms like Vercel or Firebase App Hosting.</p>
            <hr />
            <h2 id="future-enhancements">Future Enhancements</h2>
            <ul>
              <li>Hymnals and Preaching Modules</li>
              <li>Multi-verse selection</li>
              <li>Saved lists for services</li>
            </ul>
             <hr />
            <h2 id="acknowledgements">Acknowledgements</h2>
            <ul>
                <li>GOD</li>
                <li>Pastor Alberto M Mejes</li>
                <li>SBBC</li>
                <li>And many more...</li>
            </ul>
            <hr />
            <h2 id="license">License</h2>
            <p>This project is open-source. Please refer to the `LICENSE` file for details.</p>
          </div>
        </main>
      </div>
    </div>
  );
}
