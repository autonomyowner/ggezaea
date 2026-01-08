'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function InvestorFloatingButtons() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);

  // Don't show on investor pages themselves
  if (pathname?.startsWith('/investors')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Expanded menu */}
      {isExpanded && (
        <div className="flex flex-col gap-2 mb-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Link
            href="/investors"
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium shadow-lg transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #68a67d 0%, #4a8a5e 100%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(104, 166, 125, 0.4)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            <span>Investor Deck</span>
          </Link>

          <Link
            href="/investors/marketing"
            className="flex items-center gap-2 px-4 py-3 rounded-xl font-medium shadow-lg transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #e07b4c 0%, #c4623a 100%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(224, 123, 76, 0.4)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20V10" />
              <path d="M18 20V4" />
              <path d="M6 20v-4" />
            </svg>
            <span>Marketing Strategy</span>
          </Link>
        </div>
      )}

      {/* Main toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all hover:scale-110"
        style={{
          background: isExpanded
            ? 'linear-gradient(135deg, #333 0%, #111 100%)'
            : 'linear-gradient(135deg, #68a67d 0%, #e07b4c 100%)',
          color: 'white',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        {isExpanded ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
        )}
      </button>

      {/* Label when collapsed */}
      {!isExpanded && (
        <span
          className="absolute -left-24 bottom-3 text-xs font-medium px-2 py-1 rounded-lg whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
          style={{ background: 'rgba(0,0,0,0.8)', color: 'white' }}
        >
          For Investors
        </span>
      )}
    </div>
  );
}
