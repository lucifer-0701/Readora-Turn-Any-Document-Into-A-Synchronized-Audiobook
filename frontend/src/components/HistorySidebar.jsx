import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  FileText,
  Trash2,
  Clock,
  Search,
  ArrowUpDown,
  Star,
  BookOpen,
  FileImage,
  Layers,
  ChevronRight,
  TrendingUp,
  BookmarkCheck
} from 'lucide-react';

export default function HistorySidebar({
  isOpen,
  onClose,
  history = [],
  onClearHistory,
  onSelectHistoryItem,
  onToggleFavorite,
  onDeleteHistoryItem
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'name' | 'progress'
  const [filterFavorite, setFilterFavorite] = useState(false);

  // Close on escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const getFormattedDate = (dateStr) => {
    try {
      if (!dateStr) return 'Recently';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Recently';
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };

  // Sort and filter logic
  const filteredAndSortedList = useMemo(() => {
    let result = [...history];

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        (item.fileName || item.name || '').toLowerCase().includes(q)
      );
    }

    // Filter by favorite
    if (filterFavorite) {
      result = result.filter(item => item.isFavorite);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.fileName || a.name || '').localeCompare(b.fileName || b.name || '');
      }
      if (sortBy === 'progress') {
        const progA = a.progress || 0;
        const progB = b.progress || 0;
        return progB - progA;
      }
      // default: recent
      const dateA = new Date(a.date || a.uploadedAt || 0).getTime();
      const dateB = new Date(b.date || b.uploadedAt || 0).getTime();
      return dateB - dateA;
    });

    return result;
  }, [history, searchQuery, sortBy, filterFavorite]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] overflow-hidden"
      role="dialog"
      aria-modal="true"
      aria-labelledby="library-sidebar-title"
    >
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Container */}
      <div className="absolute inset-y-0 right-0 pl-4 sm:pl-10 max-w-full flex">
        <div className="w-screen max-w-md glass-panel border-l border-slate-800 bg-slate-950/95 shadow-2xl flex flex-col h-full relative">
          
          {/* Header */}
          <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/20">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-violet-400" aria-hidden="true" />
              <div>
                <h2 id="library-sidebar-title" className="text-sm font-bold text-white tracking-tight">Personal Library</h2>
                <p className="text-[10px] text-slate-500">Your curated digital bookshelf</p>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              aria-label="Close library sidebar"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Search and Filters Bar */}
          <div className="px-5 py-3.5 border-b border-slate-900/80 bg-slate-950/50 space-y-2.5">
            <div className="relative rounded-xl border border-slate-800 bg-slate-900/40 focus-within:border-violet-500/50 transition-all duration-200">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-600 pl-9 pr-4 py-2.5 outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-semibold text-slate-300 px-2 py-1.5 outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value="recent">Sort: Recent</option>
                  <option value="name">Sort: Name</option>
                  <option value="progress">Sort: Progress</option>
                </select>
              </div>

              {/* Favorites Filter Toggle */}
              <button
                onClick={() => setFilterFavorite(!filterFavorite)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold transition-all duration-200 ${
                  filterFavorite 
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20' 
                    : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Star className={`h-3 w-3 ${filterFavorite ? 'fill-amber-400 text-amber-400' : ''}`} />
                <span>Favorites Only</span>
              </button>
            </div>
          </div>

          {/* Library Grid / List */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {filteredAndSortedList.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {filteredAndSortedList.map((item, index) => {
                  const progressPct = item.progress || 0;
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      key={item.id || index}
                      className="group relative rounded-xl border border-slate-900 bg-slate-900/30 hover:border-violet-500/20 hover:bg-violet-950/5 p-3.5 flex gap-3 transition-all duration-200"
                    >
                      {/* Document Cover Thumbnail */}
                      <div 
                        onClick={() => { onSelectHistoryItem(item); onClose(); }}
                        className="w-14 h-18 sm:w-16 sm:h-20 shrink-0 rounded-lg bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/60 shadow-inner flex flex-col items-center justify-center relative cursor-pointer overflow-hidden group-hover:border-violet-500/20 transition-all duration-200"
                      >
                        {/* Elegant CSS Thumbnail graphics */}
                        <div className="absolute inset-x-0 top-0 h-1 bg-violet-500/30" />
                        {item.type === 'pdf' ? (
                          <BookOpen className="h-6 w-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                        ) : item.type === 'image' ? (
                          <FileImage className="h-6 w-6 text-amber-400 group-hover:scale-110 transition-transform" />
                        ) : (
                          <FileText className="h-6 w-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                        )}
                        <span className="text-[7px] font-bold text-slate-500 uppercase mt-1">
                          {item.type || 'text'}
                        </span>

                        {/* Miniature progress bar at bottom of thumbnail */}
                        <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-800">
                          <div 
                            className="h-full bg-violet-500 transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Document Details */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div 
                          onClick={() => { onSelectHistoryItem(item); onClose(); }}
                          className="cursor-pointer"
                        >
                          <h4 className="text-xs font-semibold text-slate-200 truncate group-hover:text-violet-300 transition-colors">
                            {item.fileName || item.name}
                          </h4>
                          <p className="text-[9px] text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                            <Calendar className="h-2.5 w-2.5" />
                            <span>Last read: {getFormattedDate(item.date || item.uploadedAt)}</span>
                          </p>
                        </div>

                        {/* Badges & Actions */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5">
                            {/* File type badge */}
                            <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-bold border ${
                              item.type === 'pdf' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25' :
                              item.type === 'image' ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' :
                              'bg-emerald-500/10 text-emerald-400 border-emerald-500/25'
                            }`}>
                              {item.type || 'text'}
                            </span>

                            {/* Progress Badge */}
                            <span className="flex items-center gap-1 text-[8px] font-bold text-slate-400">
                              <TrendingUp className="h-2.5 w-2.5 text-violet-400" />
                              {progressPct}% read
                            </span>
                          </div>

                          {/* Quick Controls */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            {/* Favorite Button */}
                            <button
                              onClick={() => onToggleFavorite && onToggleFavorite(item.id)}
                              className={`p-1 rounded hover:bg-slate-800 transition-colors ${
                                item.isFavorite ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                              }`}
                              aria-label="Add to favorites"
                            >
                              <Star className={`h-3.5 w-3.5 ${item.isFavorite ? 'fill-amber-400' : ''}`} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => onDeleteHistoryItem && onDeleteHistoryItem(item.id)}
                              className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              aria-label="Delete document"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-700 shadow-inner" aria-hidden="true">
                  <BookOpen className="h-6 w-6" />
                </div>
                <div className="max-w-xs space-y-1">
                  <h4 className="text-xs font-semibold text-slate-300">
                    {searchQuery ? 'No documents match search' : 'Your Library is Empty'}
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-normal">
                    {searchQuery 
                      ? 'Try modifying your search query or clear the query to see all documents.' 
                      : 'Upload a PDF, document, or capture an image to build your secure offline reading collection.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Footer Controls */}
          {history.length > 0 && (
            <div className="p-4 border-t border-slate-900 bg-slate-950 flex gap-2">
              <button
                onClick={onClearHistory}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 py-2.5 text-[10px] font-semibold text-slate-400 hover:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-200"
                aria-label="Clear all documents"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Clear All Docs</span>
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
