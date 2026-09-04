import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ChemLearnLogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  href?: string | null;
}

export default function ChemLearnLogo({
  className,
  iconClassName,
  textClassName,
  href = '/',
}: ChemLearnLogoProps) {
  const content = (
    <>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 32 32" 
        className={cn("w-7 h-7 shrink-0", iconClassName)}
        aria-hidden="true"
      >
        <g transform="rotate(30 16 16)">
          <ellipse cx="16" cy="16" rx="12" ry="4.5" fill="none" stroke="#64748B" strokeWidth="1.5" />
          <circle cx="28" cy="16" r="1.5" fill="#0EA5E9" />
        </g>
        <g transform="rotate(90 16 16)">
          <ellipse cx="16" cy="16" rx="12" ry="4.5" fill="none" stroke="#64748B" strokeWidth="1.5" />
          <circle cx="4" cy="16" r="1.5" fill="#0EA5E9" />
        </g>
        <g transform="rotate(150 16 16)">
          <ellipse cx="16" cy="16" rx="12" ry="4.5" fill="none" stroke="#64748B" strokeWidth="1.5" />
          <circle cx="28" cy="16" r="1.5" fill="#0EA5E9" />
        </g>
        <circle cx="16" cy="16" r="3.5" fill="#F43F5E" />
        <circle cx="15" cy="15" r="1" fill="#FDA4AF" />
      </svg>
      <span className={cn("font-bold text-xl tracking-tight text-slate-900", textClassName)}>
        ChemLearn AI
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn("flex items-center gap-2 hover:opacity-90 transition-opacity", className)}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {content}
    </div>
  );
}
