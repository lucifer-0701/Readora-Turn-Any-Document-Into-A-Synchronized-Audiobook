import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlignLeft,
  Minimize2,
  Maximize2,
  Sparkles,
  Hash,
} from 'lucide-react';

// Approximate words per visual "line" for line-highlight grouping
const WORDS_PER_LINE = 10;

const TextDisplay = React.memo(function TextDisplay({
  text,
  words = [],
  currentWordIndex = -1,
  onWordClick,
  currentPage = 0,
  totalPages = 1,
  onPageChange,
  readingSeconds = 0,
  isTimerRunning = false,
  onToggleTimer,
}) {
  const [fontSize, setFontSize] = useState(18);
  const [pageInput, setPageInput] = useState(String(currentPage + 1));
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [prevPage, setPrevPage] = useState(currentPage);
  const [pageDirection, setPageDirection] = useState(1);

  const containerRef = useRef(null);


  // Track page direction for slide animation
  useEffect(() => {
    if (currentPage !== prevPage) {
      setPageDirection(currentPage > prevPage ? 1 : -1);
      setPrevPage(currentPage);
    }
    setPageInput(String(currentPage + 1));
  }, [currentPage]);

  // ── Auto-scroll active word into view ──
  useEffect(() => {
    if (currentWordIndex >= 0 && containerRef.current) {
      const active = containerRef.current.querySelector('.word-active');
      if (active) {
        active.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentWordIndex]);

  // ── Helpers ──
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const increaseFontSize = () => setFontSize((p) => Math.min(p + 2, 32));
  const decreaseFontSize = () => setFontSize((p) => Math.max(p - 2, 13));

  const handlePageSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(pageInput, 10);
    if (!isNaN(val) && val >= 1 && val <= totalPages) {
      onPageChange(val - 1);
    } else {
      setPageInput(String(currentPage + 1));
    }
  };

  // Current line index for reading-guide highlight
  const currentLineIndex =
    currentWordIndex >= 0 ? Math.floor(currentWordIndex / WORDS_PER_LINE) : -1;

  // Reading progress within the current page
  const pageProgress =
    words.length > 1 && currentWordIndex >= 0
      ? Math.round((currentWordIndex / (words.length - 1)) * 100)
      : 0;

  // Page slide variants
  const pageVariants = {
    enter: (dir) => ({
      opacity: 0,
      x: dir > 0 ? 50 : -50,
      scale: 0.99,
    }),
    center: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
    exit: (dir) => ({
      opacity: 0,
      x: dir > 0 ? -50 : 50,
      scale: 0.99,
      transition: { duration: 0.25, ease: 'easeIn' },
    }),
  };

  // ── Render ──
  return (
    <section
      className={`flex flex-col rounded-3xl border shadow-2xl overflow-hidden transition-all duration-500 ${
        isFocusMode
          ? 'bg-slate-950 border-slate-800/80 min-h-[calc(100vh-200px)]'
          : 'bg-slate-900/30 backdrop-blur-xl border-slate-800/60 min-h-[520px]'
      }`}
      aria-labelledby="reader-board-title"
    >
      <h2 id="reader-board-title" className="sr-only">
        Document Reader
      </h2>

      {/* ══════════════ Top Toolbar ══════════════ */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-2 sm:gap-3 border-b border-slate-800/60 bg-slate-950/70 backdrop-blur-md px-3 sm:px-5 py-2 sm:py-3">
        {/* Left: Reader label + word count */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/10 border border-violet-500/20">
            <BookOpen className="h-3.5 w-3.5 text-violet-400" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold text-slate-200">Reader</span>
          {text && (
            <span className="text-[10px] text-slate-500 font-medium hidden sm:inline-flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {words.length} words
            </span>
          )}
        </div>

        {/* Center: Page navigation */}
        {text && totalPages > 1 && (
          <nav
            className="flex items-center gap-1 bg-slate-950/80 border border-slate-800 rounded-xl px-1.5 py-1"
            aria-label="Page navigation"
          >
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 disabled:pointer-events-none transition-colors focus:outline-none focus:ring-1 focus:ring-violet-500"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>

            <form onSubmit={handlePageSubmit} className="flex items-center gap-1 text-xs">
              <input
                type="text"
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                aria-label="Page number"
                className="w-8 text-center font-bold text-slate-200 bg-transparent border-none rounded px-1 py-0.5 focus:bg-slate-900 focus:ring-1 focus:ring-violet-500 outline-none"
              />
              <span className="text-slate-600 font-medium">/ {totalPages}</span>
            </form>

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-20 disabled:pointer-events-none transition-colors focus:outline-none focus:ring-1 focus:ring-violet-500"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </nav>
        )}

        {/* Right: Timer + Font + Focus */}
        <div className="flex items-center gap-1.5">
          {/* Reading timer */}
          {text && (
            <button
              onClick={onToggleTimer}
              className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 rounded-xl px-2.5 py-1.5 text-[11px] font-bold text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors focus:outline-none focus:ring-1 focus:ring-violet-500"
              title={isTimerRunning ? 'Pause timer' : 'Resume timer'}
              aria-label="Reading timer"
            >
              <Clock
                className={`h-3.5 w-3.5 ${isTimerRunning ? 'text-emerald-400' : 'text-slate-500'}`}
                aria-hidden="true"
              />
              <span className="tabular-nums">{formatTime(readingSeconds)}</span>
            </button>
          )}

          {/* Font size controls */}
          {text && (
            <div className="flex items-center gap-0 bg-slate-950/80 rounded-xl border border-slate-800 px-0.5 py-0.5">
              <button
                onClick={decreaseFontSize}
                disabled={fontSize <= 13}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 disabled:pointer-events-none transition-colors"
                aria-label="Decrease font size"
              >
                <ZoomOut className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <span className="text-[10px] font-bold text-slate-500 min-w-[26px] text-center tabular-nums select-none">
                {fontSize}
              </span>
              <button
                onClick={increaseFontSize}
                disabled={fontSize >= 32}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-25 disabled:pointer-events-none transition-colors"
                aria-label="Increase font size"
              >
                <ZoomIn className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )}

          {/* Focus mode toggle */}
          {text && (
            <button
              onClick={() => setIsFocusMode((f) => !f)}
              className={`p-2 rounded-xl border transition-colors focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                isFocusMode
                  ? 'bg-violet-600/15 border-violet-500/30 text-violet-400'
                  : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-violet-400 hover:border-violet-500/30'
              }`}
              title={isFocusMode ? 'Exit focus mode' : 'Focus mode'}
              aria-label={isFocusMode ? 'Exit focus mode' : 'Enter focus mode'}
            >
              {isFocusMode ? (
                <Minimize2 className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* ══════════════ Page Progress Bar ══════════════ */}
      {text && (
        <div
          className="shrink-0 h-[3px] w-full bg-slate-900/80"
          role="progressbar"
          aria-valuenow={pageProgress}
          aria-valuemin="0"
          aria-valuemax="100"
          aria-label="Reading progress on current page"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400"
            style={{ boxShadow: '0 0 8px rgba(139, 92, 246, 0.4)' }}
            initial={false}
            animate={{ width: `${pageProgress}%` }}
            transition={{ ease: 'easeOut', duration: 0.25 }}
          />
        </div>
      )}

      {/* ══════════════ Main Reading Area ══════════════ */}
      <div className="flex-1 overflow-hidden relative">
        {text ? (
          <AnimatePresence mode="wait" custom={pageDirection}>
            <motion.div
              key={currentPage}
              custom={pageDirection}
              variants={pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="absolute inset-0 overflow-y-auto reader-scroll scroll-smooth"
              ref={containerRef}
              role="document"
              aria-label="Document reading area"
            >
              {/* Centered reader column */}
              <div
                className="mx-auto max-w-[680px] px-4 sm:px-10 py-6 sm:py-14 pb-20"
                style={{ fontSize: `${fontSize}px` }}
              >
                {/* Page label divider */}
                {totalPages > 1 && (
                  <div className="mb-8 flex items-center gap-4" aria-hidden="true">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-600 select-none">
                      Page {currentPage + 1}
                    </span>
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-800 to-transparent" />
                  </div>
                )}

                {/* Word-by-word rendering with line-level highlighting */}
                <div
                  className="text-slate-300 leading-[2.0] tracking-wide font-light selection:bg-violet-500/20"
                  style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
                >
                  {words.length > 0
                    ? (() => {
                        // Group words into approximate visual lines
                        const lines = [];
                        for (let i = 0; i < words.length; i += WORDS_PER_LINE) {
                          lines.push({
                            startIdx: i,
                            words: words.slice(i, i + WORDS_PER_LINE),
                          });
                        }

                        return lines.map((line, lineIdx) => {
                          const isActiveLine = lineIdx === currentLineIndex;
                          return (
                            <span
                              key={lineIdx}
                              className={`inline transition-all duration-300 ${
                                isActiveLine ? 'line-active' : ''
                              }`}
                            >
                              {line.words.map((word, wordOffset) => {
                                const globalIdx = line.startIdx + wordOffset;
                                const isActive = globalIdx === currentWordIndex;
                                const isPast = currentWordIndex >= 0 && globalIdx < currentWordIndex;

                                return (
                                  <span
                                    key={globalIdx}
                                    onClick={() => onWordClick && onWordClick(globalIdx)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onWordClick && onWordClick(globalIdx);
                                      }
                                    }}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={`Word ${globalIdx + 1}: ${word}`}
                                    aria-pressed={isActive}
                                    className={`cursor-pointer mx-[2px] rounded-md px-0.5 py-0.5 transition-all duration-100 focus:outline-none focus:ring-1 focus:ring-violet-500/60 ${
                                      isActive
                                        ? 'word-active'
                                        : isPast
                                        ? 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/30'
                                        : isActiveLine
                                        ? 'text-slate-200 hover:bg-slate-800/40 hover:text-white'
                                        : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                                    }`}
                                  >
                                    {word}
                                  </span>
                                );
                              })}
                              {' '}
                            </span>
                          );
                        });
                      })()
                    : text}
                </div>

                {/* Bottom page navigation */}
                {totalPages > 1 && (
                  <div className="mt-14 flex items-center justify-between border-t border-slate-800/40 pt-6">
                    <button
                      onClick={() => onPageChange(currentPage - 1)}
                      disabled={currentPage === 0}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-20 disabled:pointer-events-none transition-all text-sm font-medium focus:outline-none focus:ring-1 focus:ring-violet-500"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>
                    <span className="text-[11px] text-slate-600 font-bold tabular-nums select-none">
                      {currentPage + 1} of {totalPages}
                    </span>
                    <button
                      onClick={() => onPageChange(currentPage + 1)}
                      disabled={currentPage === totalPages - 1}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-20 disabled:pointer-events-none transition-all text-sm font-medium focus:outline-none focus:ring-1 focus:ring-violet-500"
                      aria-label="Next page"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          /* ══════════════ Empty State ══════════════ */
          <div className="h-full flex flex-col items-center justify-center text-center px-6 py-20 space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
              aria-hidden="true"
            >
              <div className="absolute inset-0 w-24 h-24 rounded-3xl bg-violet-600/10 blur-2xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-500 shadow-2xl">
                <AlignLeft className="h-9 w-9" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="max-w-sm space-y-2.5"
            >
              <h3 className="text-lg font-bold text-slate-200">No Document Loaded</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Upload a PDF, image, or paste text above to start reading.
                Words will highlight in sync with speech playback.
              </p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                const sample =
                  'Welcome to Readora! This is a state-of-the-art document reader that transforms your text into interactive audio experiences directly in your browser. Upload your favorite PDF or paste any article, select a natural voice, adjust the speed controls, and enjoy hands-free reading. Try clicking words in the reader panel to jump straight to any point in the speech!';
                onWordClick && onWordClick(-2, sample);
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/25 px-6 py-3 text-sm font-semibold text-violet-400 hover:text-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all shadow-sm"
              aria-label="Load demo reading sample"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Try Demo Text
            </motion.button>
          </div>
        )}
      </div>
    </section>
  );
});

export default TextDisplay;
