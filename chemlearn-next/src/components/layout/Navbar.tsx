'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';

import ChemLearnLogo from '@/components/ChemLearnLogo';

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuthStore();
  const { toggleMobileMenu, openModal, setAuthMode } = useUIStore();

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/70 border-b border-border/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <ChemLearnLogo textClassName="text-brand-purple" />
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium transition-colors hover:text-brand-purple hover:bg-brand-purple/10',
                  pathname === link.href ? 'text-brand-purple bg-brand-purple/10' : 'text-slate-600'
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        
      <div className="flex items-center gap-4">
        {user ? (
          <button
            onClick={() => signOut()}
            className="hidden md:inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple border border-slate-200 bg-white shadow-sm hover:bg-slate-50 hover:text-brand-purple h-10 px-5"
          >
            Sign Out
          </button>
        ) : (
          <button
            onClick={() => { setAuthMode('signin'); openModal('auth'); }}
            className="hidden md:inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple bg-brand-purple text-white shadow-lg shadow-brand-purple/20 hover:bg-brand-purple/90 h-10 px-6"
          >
            Sign In
          </button>
        )}
        <button aria-label="Open main menu" onClick={toggleMobileMenu} className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple">
          <Menu className="h-6 w-6" />
        </button>
      </div>
      </div>
    </header>
  );
}
