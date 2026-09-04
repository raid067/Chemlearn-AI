import Link from 'next/link';
import { NAV_LINKS } from '@/lib/constants';
import ChemLearnLogo from '@/components/ChemLearnLogo';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white/50 backdrop-blur-sm py-12 mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-2">
          <ChemLearnLogo href={null} textClassName="text-brand-purple" />
          <span className="text-slate-400">© {new Date().getFullYear()}</span>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-slate-500 hover:text-brand-purple transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
