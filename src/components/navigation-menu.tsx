'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/controller', label: 'SBVC' },
  { href: '/hymnals', label: 'Hymnals' },
  { href: '/preaching', label: 'Preaching' },
  { href: '/about', label: 'About' },
];

export function NavigationMenu() {
  const pathname = usePathname();

  return (
    <header className="h-10 border-b flex items-center px-4">
      <nav className="flex items-center gap-6 text-sm">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'transition-colors hover:text-foreground text-muted-foreground',
              (pathname === link.href || (link.href !== '/controller' && pathname.startsWith(link.href) && link.href !== '#')) && 'text-foreground font-semibold'
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
