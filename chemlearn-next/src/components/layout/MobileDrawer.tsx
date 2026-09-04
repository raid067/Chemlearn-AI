'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { useUIStore } from '@/stores/useUIStore';
import { NAV_LINKS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import ChemLearnLogo from '@/components/ChemLearnLogo';
import { X } from 'lucide-react';

export default function MobileDrawer() {
  const pathname = usePathname();
  const { user, signOut } = useAuthStore();
  const { mobileMenuOpen, closeMobileMenu, openModal, setAuthMode } = useUIStore();

  if (!mobileMenuOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={closeMobileMenu} />
      <div className="fixed inset-y-0 right-0 w-3/4 max-w-sm bg-white p-6 shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex justify-between items-center mb-8">
          <ChemLearnLogo textClassName="text-brand-purple" />
          <button aria-label="Close menu" onClick={closeMobileMenu} className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMobileMenu}
              className={cn(
                'px-4 py-3 rounded-lg text-lg font-medium transition-colors',
                pathname === link.href ? 'text-brand-purple bg-brand-purple/10' : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto">
          {user ? (
            <button
              onClick={() => { signOut(); closeMobileMenu(); }}
              className="w-full rounded-lg border border-slate-300 py-3 font-medium text-slate-700 hover:bg-slate-50"
            >
              Sign Out
            </button>
          ) : (
            <button
              onClick={() => { closeMobileMenu(); setAuthMode('signin'); openModal('auth'); }}
              className="w-full rounded-lg bg-brand-purple py-3 font-medium text-white shadow-md hover:bg-brand-purple/90"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
