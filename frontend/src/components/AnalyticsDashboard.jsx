import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Clock,
  BookOpen,
  History,
  CalendarDays,
  RotateCcw,
  Trash2,
  Play,
  ChevronRight,
  FileText
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '0m';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric', year: 'numeric'
    });
  } catch { return ''; }
}

function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return ''; }
}

export default function AnalyticsDashboard({
  isOpen,
  onClose,
  analytics,
  onReset,
  checkpoints = [],
  onResumeCheckpoint,
  onDeleteCheckpoint,
}) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Recent sessions from analytics tracker
  const recentSessions = (analytics?.sessions || []).slice(0, 15);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="history-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            key="history-panel"
            initial={{ x: '100%', opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            className="fixed top-0 right-0 h-full z-[90] w-full sm:w-[460px] flex flex-col bg-slate-950 border-l border-slate-800 shadow-2xl shadow-black/60"
            role="dialog"
            aria-modal="true"
            aria-label="Reading History & Resume Checkpoints"
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <History className="h-4 w-4 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-100">Reading History</h2>
                  <p className="text-[10px] text-slate-500">Resume checkpoints & past sessions</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none"
                  aria-label="Reset all statistics"
                  title="Clear all reading history & stats"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-violet-500"
                  aria-label="Close history panel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-5 space-y-6 reader-scroll">
              
              {/* Stats overview cards */}
              <div className="grid grid-cols-2 gap-3 select-none">
                <div className="rounded-xl border border-violet-500/10 bg-violet-500/5 p-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="h-3.5 w-3.5 text-violet-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Reading Time</span>
                  </div>
                  <p className="text-xl font-extrabold text-slate-200 tracking-tight">
                    {fmtDuration(analytics?.totalReadingSeconds || 0)}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-500/10 bg-emerald-500/5 p-4 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <BookOpen className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Pages Read</span>
                  </div>
                  <p className="text-xl font-extrabold text-slate-200 tracking-tight">
                    {analytics?.totalPagesRead || 0}
                  </p>
                </div>
              </div>

              {/* SECTION: Resume Checkpoints */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                    Resume Checkpoints
                  </h3>
                  <span className="text-[10px] text-slate-600 font-medium">Click to resume</span>
                </div>

                {checkpoints.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-900 p-6 text-center text-slate-600">
                    <FileText className="h-7 w-7 mx-auto mb-2 text-slate-700" />
                    <p className="text-xs font-medium">No resume checkpoints saved</p>
                    <p className="text-[10px] text-slate-700 leading-normal mt-1">
                      Pause reading a document to automatically create a resume point.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {checkpoints.map((cp) => (
                      <motion.div
                        key={cp.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group relative rounded-xl border border-slate-900 bg-slate-900/35 hover:bg-slate-900/70 hover:border-violet-500/30 p-3.5 transition-all duration-200 cursor-pointer flex flex-col gap-2"
                        onClick={() => onResumeCheckpoint(cp)}
                      >
                        {/* Title and Page */}
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-200 truncate group-hover:text-violet-400 transition-colors">
                              {cp.fileName}
                            </h4>
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-violet-400 bg-violet-500/10 rounded-md px-1.5 py-0.5 mt-1 border border-violet-500/15">
                              Page {cp.pageIndex + 1}
                            </span>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCheckpoint(cp.id);
                            }}
                            className="p-1 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                            aria-label="Delete checkpoint"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Snippet quote */}
                        {cp.textSnippet && (
                          <blockquote className="text-[11px] text-slate-400 border-l-2 border-slate-800 pl-2 py-0.5 line-clamp-2 italic leading-relaxed">
                            "{cp.textSnippet}..."
                          </blockquote>
                        )}

                        {/* Timestamp */}
                        <div className="flex items-center gap-1.5 text-[9px] text-slate-600 font-medium mt-1">
                          <CalendarDays className="h-3 w-3 text-slate-700" />
                          <span>Saved {fmtDate(cp.timestamp)} at {fmtTime(cp.timestamp)}</span>
                        </div>

                        {/* Hover Action indicator */}
                        <div className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity bg-violet-600 text-white rounded-full p-1 shadow-lg shadow-violet-600/30">
                          <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION: Recent Sessions */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                    Past Sessions
                  </h3>
                  {recentSessions.length > 0 && (
                    <span className="text-[10px] text-slate-600 font-medium">Last {recentSessions.length}</span>
                  )}
                </div>

                {recentSessions.length === 0 ? (
                  <div className="rounded-xl border border-slate-900/50 p-6 text-center text-slate-600">
                    <CalendarDays className="h-7 w-7 mx-auto mb-2 text-slate-700" />
                    <p className="text-xs font-medium">No reading sessions logged yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentSessions.map((sess, i) => (
                      <div
                        key={sess.id || i}
                        className="flex items-center gap-3 rounded-xl bg-slate-900/10 border border-slate-900/50 px-3 py-2.5 hover:bg-slate-900/35 transition-colors"
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 border border-slate-800 text-slate-500 text-[10px] font-bold shrink-0">
                          #{recentSessions.length - i}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-300 truncate">
                            {sess.fileName || 'Unknown'}
                          </p>
                          <p className="text-[9px] text-slate-500 mt-0.5">
                            {fmtDate(sess.startedAt)} · {fmtTime(sess.startedAt)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-bold text-slate-300">
                            {fmtDuration(sess.durationSeconds || 0)}
                          </p>
                          <p className="text-[9px] text-slate-500">
                            {sess.pagesRead || 0} pg{sess.pagesRead !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Reset Confirmation Overlay */}
            <AnimatePresence>
              {showResetConfirm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-red-500/30 p-5 z-[100]"
                >
                  <p className="text-sm font-semibold text-slate-200 mb-1">Clear all reading history?</p>
                  <p className="text-xs text-slate-500 mb-4 font-normal leading-normal">
                    This will permanently clear your reading time statistics, recent session logs, and all saved resume checkpoints. This action cannot be undone.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { 
                        onReset(); 
                        setShowResetConfirm(false); 
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors focus:outline-none cursor-pointer"
                    >
                      Clear everything
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors focus:outline-none cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
