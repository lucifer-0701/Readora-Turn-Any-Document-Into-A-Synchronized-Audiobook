import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bookmark,
  BookmarkCheck,
  BookmarkPlus,
  FileText,
  Pencil,
  Trash2,
  Plus,
  X,
  Check,
  StickyNote,
  ChevronRight,
  CalendarDays,
  BookOpen,
  Layers,
} from 'lucide-react';

// ─── Storage helpers ───────────────────────────────────────────────────────────
const LS_BOOKMARKS = 'readora_bookmarks';
const LS_NOTES = 'readora_notes';

function loadLS(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLS(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('localStorage write failed', e);
  }
}

// ─── Tiny helpers ──────────────────────────────────────────────────────────────
function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

// ─── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, body }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/60 border border-slate-700/50">
        <Icon className="h-6 w-6 text-slate-500" />
      </div>
      <p className="text-sm font-semibold text-slate-300">{title}</p>
      <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">{body}</p>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function NotesBookmarkPanel({
  isOpen,
  onClose,
  currentPage,        // 0-based index
  totalPages,
  fileName,
  onJumpToPage,       // (pageIndex) => void
  currentPageIsBookmarked,
  onBookmarkToggle,   // () => void – toggle current page
}) {
  const [tab, setTab] = useState('bookmarks'); // 'bookmarks' | 'notes'

  // ── Bookmark state ─────────────────────────────────────────────────────────
  const [bookmarks, setBookmarks] = useState(() => loadLS(LS_BOOKMARKS));

  // Filter bookmarks for the current document
  const docBookmarks = bookmarks.filter((b) => b.fileName === fileName);

  const removeBookmark = (id) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      saveLS(LS_BOOKMARKS, next);
      return next;
    });
  };

  // ── Notes state ────────────────────────────────────────────────────────────
  const [notes, setNotes] = useState(() => loadLS(LS_NOTES));
  const [newNoteText, setNewNoteText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const textareaRef = useRef(null);

  // Filter notes for the current document
  const docNotes = notes
    .filter((n) => n.fileName === fileName)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const notesOnCurrentPage = docNotes.filter((n) => n.page === currentPage + 1);

  const addNote = () => {
    const trimmed = newNoteText.trim();
    if (!trimmed || !fileName) return;
    const note = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
      fileName,
      page: currentPage + 1,
      text: trimmed,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => {
      const next = [note, ...prev];
      saveLS(LS_NOTES, next);
      return next;
    });
    setNewNoteText('');
  };

  const startEdit = (note) => {
    setEditingId(note.id);
    setEditText(note.text);
  };

  const commitEdit = (id) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    setNotes((prev) => {
      const next = prev.map((n) =>
        n.id === id ? { ...n, text: trimmed, updatedAt: new Date().toISOString() } : n
      );
      saveLS(LS_NOTES, next);
      return next;
    });
    setEditingId(null);
  };

  const deleteNote = (id) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      saveLS(LS_NOTES, next);
      return next;
    });
    if (editingId === id) setEditingId(null);
  };

  // Reset new note text on close
  useEffect(() => {
    if (!isOpen) {
      setNewNoteText('');
      setEditingId(null);
    }
  }, [isOpen]);

  // Auto-focus textarea when tab switches to notes
  useEffect(() => {
    if (tab === 'notes' && textareaRef.current) {
      setTimeout(() => textareaRef.current?.focus(), 80);
    }
  }, [tab, isOpen]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={{ x: '100%', opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            className="fixed top-0 right-0 h-full z-[90] w-full sm:w-[420px] flex flex-col bg-slate-950 border-l border-slate-800 shadow-2xl shadow-black/60"
            role="dialog"
            aria-modal="true"
            aria-label="Notes & Bookmarks"
          >
            {/* Header */}
            <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/10 border border-violet-500/20">
                  <StickyNote className="h-4 w-4 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-100">Notes & Bookmarks</h2>
                  {fileName && (
                    <p className="text-[10px] text-slate-500 truncate max-w-[200px]">{fileName}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-violet-500"
                aria-label="Close panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Current page indicator */}
            {fileName && (
              <div className="shrink-0 flex items-center justify-between gap-2 px-5 py-2.5 border-b border-slate-800/60 bg-slate-950/40">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Layers className="h-3.5 w-3.5 text-slate-500" />
                  <span>
                    Page <span className="font-bold text-slate-200">{currentPage + 1}</span>
                    {totalPages > 0 && (
                      <> of <span className="text-slate-400">{totalPages}</span></>
                    )}
                  </span>
                </div>

                {/* Quick bookmark toggle for current page */}
                <button
                  onClick={onBookmarkToggle}
                  className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-lg border transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-violet-500 ${
                    currentPageIsBookmarked
                      ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200 hover:border-violet-500/40'
                  }`}
                  aria-label={currentPageIsBookmarked ? 'Remove bookmark from this page' : 'Bookmark this page'}
                >
                  {currentPageIsBookmarked ? (
                    <BookmarkCheck className="h-3.5 w-3.5" />
                  ) : (
                    <BookmarkPlus className="h-3.5 w-3.5" />
                  )}
                  {currentPageIsBookmarked ? 'Bookmarked' : 'Bookmark page'}
                </button>
              </div>
            )}

            {/* Tabs */}
            <div className="shrink-0 flex items-center gap-0 px-5 pt-4 pb-0">
              {[
                { key: 'bookmarks', label: 'Bookmarks', icon: Bookmark, count: docBookmarks.length },
                { key: 'notes', label: 'Notes', icon: FileText, count: docNotes.length },
              ].map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all duration-200 focus:outline-none ${
                    tab === key
                      ? 'text-violet-400 border-violet-500 bg-slate-800/40'
                      : 'text-slate-500 border-transparent hover:text-slate-300 hover:bg-slate-800/20'
                  }`}
                  aria-selected={tab === key}
                  role="tab"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                  {count > 0 && (
                    <span
                      className={`ml-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                        tab === key
                          ? 'bg-violet-500/20 text-violet-300'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Divider */}
            <div className="shrink-0 h-px bg-slate-800" />

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <AnimatePresence mode="wait">
                {tab === 'bookmarks' ? (
                  <motion.div
                    key="bm-tab"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="p-5 space-y-3"
                  >
                    {!fileName ? (
                      <EmptyState
                        icon={BookOpen}
                        title="No document loaded"
                        body="Open a document to start bookmarking pages."
                      />
                    ) : docBookmarks.length === 0 ? (
                      <EmptyState
                        icon={Bookmark}
                        title="No bookmarks yet"
                        body={'Click "Bookmark page" above to save your current reading position.'}
                      />
                    ) : (
                      docBookmarks.map((bm) => (
                        <motion.div
                          key={bm.id}
                          layout
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.94, height: 0 }}
                          transition={{ duration: 0.18 }}
                          className={`group flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all duration-200 ${
                            bm.page === currentPage + 1
                              ? 'bg-amber-500/8 border-amber-500/30 hover:bg-amber-500/12'
                              : 'bg-slate-900/60 border-slate-800/60 hover:bg-slate-800/60 hover:border-slate-700'
                          }`}
                          onClick={() => onJumpToPage(bm.page - 1)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => e.key === 'Enter' && onJumpToPage(bm.page - 1)}
                          aria-label={`Jump to page ${bm.page}`}
                        >
                          <div
                            className={`shrink-0 flex h-9 w-9 items-center justify-center rounded-xl font-bold text-sm ${
                              bm.page === currentPage + 1
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {bm.page}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-200 truncate">
                              {bm.label || `Page ${bm.page}`}
                            </p>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                              <CalendarDays className="h-2.5 w-2.5" />
                              {formatDate(bm.createdAt)} · {formatTime(bm.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeBookmark(bm.id);
                              }}
                              className="p-1 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none focus:ring-1 focus:ring-red-500"
                              aria-label="Delete bookmark"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="notes-tab"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="p-5 space-y-4"
                  >
                    {/* Add note form */}
                    {fileName && (
                      <div className="space-y-2">
                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          New note — Page {currentPage + 1}
                        </label>
                        <div className="relative rounded-xl border border-slate-700 bg-slate-900/60 focus-within:border-violet-500/60 focus-within:ring-1 focus-within:ring-violet-500/20 transition-all duration-200">
                          <textarea
                            ref={textareaRef}
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) addNote();
                            }}
                            placeholder="Type your note… (Ctrl+Enter to save)"
                            rows={3}
                            className="w-full bg-transparent text-sm text-slate-200 placeholder-slate-600 px-3.5 py-3 resize-none outline-none rounded-xl"
                          />
                          <div className="flex items-center justify-between px-3 pb-2.5">
                            <span className="text-[10px] text-slate-600">Ctrl+Enter to save</span>
                            <button
                              onClick={addNote}
                              disabled={!newNoteText.trim()}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                              aria-label="Save note"
                            >
                              <Plus className="h-3.5 w-3.5" />
                              Save note
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Notes list */}
                    {!fileName ? (
                      <EmptyState
                        icon={FileText}
                        title="No document loaded"
                        body="Open a document to start taking notes."
                      />
                    ) : docNotes.length === 0 ? (
                      <EmptyState
                        icon={StickyNote}
                        title="No notes yet"
                        body="Write your first note above to capture thoughts while reading."
                      />
                    ) : (
                      <div className="space-y-3">
                        {/* Notes on this page */}
                        {notesOnCurrentPage.length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-500" />
                              This page ({notesOnCurrentPage.length})
                            </p>
                            {notesOnCurrentPage.map((note) => (
                              <NoteCard
                                key={note.id}
                                note={note}
                                isEditing={editingId === note.id}
                                editText={editText}
                                onEditTextChange={setEditText}
                                onStartEdit={startEdit}
                                onCommitEdit={commitEdit}
                                onCancelEdit={() => setEditingId(null)}
                                onDelete={deleteNote}
                                highlight
                              />
                            ))}
                          </div>
                        )}

                        {/* Notes on other pages */}
                        {docNotes.filter((n) => n.page !== currentPage + 1).length > 0 && (
                          <div>
                            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-600" />
                              Other pages
                            </p>
                            {docNotes
                              .filter((n) => n.page !== currentPage + 1)
                              .map((note) => (
                                <NoteCard
                                  key={note.id}
                                  note={note}
                                  isEditing={editingId === note.id}
                                  editText={editText}
                                  onEditTextChange={setEditText}
                                  onStartEdit={startEdit}
                                  onCommitEdit={commitEdit}
                                  onCancelEdit={() => setEditingId(null)}
                                  onDelete={deleteNote}
                                  onJumpToPage={onJumpToPage}
                                  highlight={false}
                                />
                              ))}
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Note Card sub-component ──────────────────────────────────────────────────
function NoteCard({
  note,
  isEditing,
  editText,
  onEditTextChange,
  onStartEdit,
  onCommitEdit,
  onCancelEdit,
  onDelete,
  onJumpToPage,
  highlight,
}) {
  const editRef = useRef(null);

  useEffect(() => {
    if (isEditing && editRef.current) {
      editRef.current.focus();
      editRef.current.setSelectionRange(editText.length, editText.length);
    }
  }, [isEditing]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.18 }}
      className={`group rounded-xl border p-3.5 mb-2.5 transition-all duration-200 ${
        highlight
          ? 'bg-violet-500/5 border-violet-500/20 hover:border-violet-500/35'
          : 'bg-slate-900/50 border-slate-800/60 hover:bg-slate-800/40 hover:border-slate-700'
      }`}
    >
      {/* Page badge + date */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => onJumpToPage && onJumpToPage(note.page - 1)}
          disabled={!onJumpToPage}
          className={`flex items-center gap-1 text-[10px] font-bold rounded-md px-2 py-0.5 transition-colors ${
            highlight
              ? 'bg-violet-500/15 text-violet-400'
              : 'bg-slate-800 text-slate-500 hover:text-slate-300 hover:bg-slate-700'
          } ${!onJumpToPage ? 'pointer-events-none' : 'cursor-pointer'}`}
          aria-label={`Go to page ${note.page}`}
        >
          <BookOpen className="h-2.5 w-2.5" />
          Page {note.page}
        </button>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {isEditing ? (
            <>
              <button
                onClick={() => onCommitEdit(note.id)}
                className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-colors focus:outline-none"
                aria-label="Save edit"
              >
                <Check className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onCancelEdit}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/60 transition-colors focus:outline-none"
                aria-label="Cancel edit"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onStartEdit(note)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors focus:outline-none"
                aria-label="Edit note"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete(note.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none"
                aria-label="Delete note"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Note text / edit textarea */}
      {isEditing ? (
        <textarea
          ref={editRef}
          value={editText}
          onChange={(e) => onEditTextChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onCommitEdit(note.id);
            if (e.key === 'Escape') onCancelEdit();
          }}
          rows={3}
          className="w-full bg-slate-800 border border-violet-500/40 rounded-lg text-sm text-slate-200 px-3 py-2 resize-none outline-none focus:ring-1 focus:ring-violet-500/50 transition-all"
        />
      ) : (
        <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap break-words">
          {note.text}
        </p>
      )}

      {/* Timestamps */}
      <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-600">
        <CalendarDays className="h-2.5 w-2.5 shrink-0" />
        <span>Created {formatDate(note.createdAt)} {formatTime(note.createdAt)}</span>
        {note.updatedAt !== note.createdAt && (
          <span className="text-slate-700">· edited</span>
        )}
      </div>
    </motion.div>
  );
}
