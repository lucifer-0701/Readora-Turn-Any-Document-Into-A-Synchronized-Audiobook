import React from 'react';
import { Headphones, BookOpen, StickyNote, Bookmark, BarChart3 } from 'lucide-react';

const Header = React.memo(function Header({
  onHistoryToggle,
  onNotesToggle,
  onAnalyticsToggle,
  bookmarkCount = 0,
  notesCount = 0,
  onBackToHome,
}) {
  const totalBadge = bookmarkCount + notesCount;

  return (
    <header className="sticky top-0 z-50 w-full glass-panel" role="banner">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo & Back to Home */}
          <button
            onClick={onBackToHome}
            className="flex items-center gap-3 focus:outline-none focus:ring-1 focus:ring-violet-500/50 rounded-xl p-1.5 hover:bg-slate-900/60 active:scale-[0.98] transition-all group text-left"
            aria-label="Return to welcome page"
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 ring-1 ring-violet-400/20 group-hover:scale-105 transition-transform"
            >
              <Headphones className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5 m-0 leading-none group-hover:text-violet-400 transition-colors">
                <span>Readora</span>
                <span className="inline-flex items-center rounded-md bg-violet-500/10 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-violet-400 ring-1 ring-inset ring-violet-500/20">
                  AI
                </span>
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-0.5 group-hover:text-slate-300 transition-colors flex items-center gap-1">
                <span className="text-violet-400 font-bold group-hover:translate-x-[-2px] transition-transform">←</span> Back to Home
              </p>
            </div>
          </button>

          {/* Nav actions */}
          <nav className="flex items-center gap-1.5 sm:gap-3" aria-label="Quick links">
            {/* System status pill */}
            <div
              className="hidden md:flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-300 ring-1 ring-slate-800"
              role="status"
              aria-live="polite"
            >
              <div className="relative flex h-1.5 w-1.5" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </div>
              <span className="ml-1">System Online</span>
            </div>

            {/* Analytics button */}
            <button
              onClick={onAnalyticsToggle}
              className="flex items-center justify-center p-2 sm:px-3 sm:py-2 gap-1.5 btn-glass"
              aria-label="Open reading analytics dashboard"
            >
              <BarChart3 className="h-4 w-4 sm:h-4 sm:w-4 text-violet-400" aria-hidden="true" />
              <span className="hidden sm:inline">Analytics</span>
            </button>

            {/* Notes & Bookmarks button */}
            <button
              onClick={onNotesToggle}
              className="relative flex items-center justify-center p-2 sm:px-3 sm:py-2 gap-1.5 btn-glass"
              aria-label="Open notes and bookmarks panel"
            >
              <StickyNote className="h-4 w-4 sm:h-4 sm:w-4 text-amber-400" aria-hidden="true" />
              <span className="hidden sm:inline">Notes</span>
              {totalBadge > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white shadow">
                  {totalBadge > 99 ? '99+' : totalBadge}
                </span>
              )}
            </button>

            {/* Library button */}
            <button
              onClick={onHistoryToggle}
              className="flex items-center justify-center p-2 sm:px-3 sm:py-2 gap-1.5 btn-glass"
              aria-label="Open reading library sidebar"
            >
              <BookOpen className="h-4 w-4 sm:h-4 sm:w-4 text-violet-400" aria-hidden="true" />
              <span className="hidden sm:inline">Library</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
});

export default Header;
