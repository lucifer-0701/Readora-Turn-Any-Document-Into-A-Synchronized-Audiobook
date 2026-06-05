import React, { useState, useEffect, useRef, Suspense, useCallback, useMemo } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import useAnalytics from './hooks/useAnalytics';
import { Sparkles, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { saveDocumentContent, getDocumentContent, deleteDocumentContent, clearAllDocuments } from './utils/libraryDb';
import useGoalsAchievements from './hooks/useGoalsAchievements';

// Highly-optimized Dynamic Lazy Imports to guarantee instant first paint (FCP/LCP) of WelcomeScreen
const Header = React.lazy(() => import('./components/Header'));
const UploadSection = React.lazy(() => import('./components/UploadSection'));
const TextDisplay = React.lazy(() => import('./components/TextDisplay'));
const AudioControls = React.lazy(() => import('./components/AudioControls'));
const Footer = React.lazy(() => import('./components/Footer'));
const HistorySidebar = React.lazy(() => import('./components/HistorySidebar'));
const NotesBookmarkPanel = React.lazy(() => import('./components/NotesBookmarkPanel'));
const AnalyticsDashboard = React.lazy(() => import('./components/AnalyticsDashboard'));
const AchievementNotification = React.lazy(() => import('./components/AchievementNotification'));

function App() {
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState('');
  const [wordRanges, setWordRanges] = useState([]);
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);

  // Custom Toast Notifications
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Page Pagination State
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [fullDocumentText, setFullDocumentText] = useState('');

  // History State
  const [history, setHistory] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Welcome Screen State
  const [showWelcome, setShowWelcome] = useState(true);

  // Notes & Bookmarks State
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      const raw = localStorage.getItem('readora_bookmarks');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [notes, setNotes] = useState(() => {
    try {
      const raw = localStorage.getItem('readora_notes');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [checkpoints, setCheckpoints] = useState(() => {
    try {
      const raw = localStorage.getItem('readora_checkpoints');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  // Image Upload State
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // TTS State
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechStatus, setSpeechStatus] = useState('idle'); // 'idle' | 'playing' | 'paused' | 'stopped'
  const [rate, setRate] = useState(1);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrError, setOcrError] = useState(null);
  const [readingSeconds, setReadingSeconds] = useState(0);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  const utteranceRef = useRef(null);
  const currentChunkStartIndexRef = useRef(0);
  const chunkEndIndexRef = useRef(0);
  const trackerIntervalRef = useRef(null);

  
  // Stale-closure safe reference container to share real-time state with Web Speech boundary/end events
  const stateRef = useRef({
    currentPage: 0,
    pages: [],
    speechStatus: 'idle',
    isPlaying: false,
    fileName: '',
    rate: 1,
    selectedVoice: null
  });

  // Keep stateRef perfectly synchronized on every render
  useEffect(() => {
    stateRef.current = {
      currentPage,
      pages,
      speechStatus,
      isPlaying,
      fileName,
      rate,
      selectedVoice
    };
  }, [currentPage, pages, speechStatus, isPlaying, fileName, rate, selectedVoice]);

  // Chromium SpeechSynthesis 15s timeout heartbeat fix (disabled on mobile to avoid audio stutter)
  useEffect(() => {
    let heartbeat = null;
    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (speechStatus === 'playing' && !isMobile) {
      heartbeat = setInterval(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000); // Pulse every 10 seconds to refresh synthesis guard
    }
    return () => {
      if (heartbeat) clearInterval(heartbeat);
    };
  }, [speechStatus]);

  // ── Analytics tracking hook ──
  const analytics = useAnalytics();

  const [activeAchievement, setActiveAchievement] = useState(null);

  // ── Goals & Achievements Hook ──
  const goalsAchievements = useGoalsAchievements(
    analytics.getAnalytics(),
    history,
    bookmarks,
    (ach) => {
      setActiveAchievement(ach);
      addToast(`🏆 Achievement unlocked: ${ach.title}!`, 'success');
    }
  );

  // ✅ FIXED: Load browser Speech Synthesis Voices
  // Deferred until welcome screen is dismissed to keep startup thread 100% free
  useEffect(() => {
    if (showWelcome) return;

    const updateVoices = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // prev = current selectedVoice value, read without declaring as dep
        setSelectedVoice(prev => {
          if (prev) return prev; // already set — keep user's choice
          return (
            availableVoices.find(v => v.lang.startsWith('en')) ||
            availableVoices[0] ||
            null
          );
        });
      }
    };

    updateVoices();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, [showWelcome]); // ✅ Runs when welcome screen is dismissed

  // Clean up synthesis on unmount + load history + restore progress
  // Defer database/history operations using requestIdleCallback to guarantee instant rendering of WelcomeScreen
  useEffect(() => {
    if (showWelcome) return;

    const initApp = () => {
      // Load reading history on mount
      const saved = localStorage.getItem('readora_history');
      if (saved) {
        try {
          setHistory(JSON.parse(saved));
        } catch (err) {
          console.error("Failed to load history:", err);
        }
      }

      // Restore saved reading progress on mount
      const savedProgress = localStorage.getItem('readora_progress');
      if (savedProgress) {
        try {
          const p = JSON.parse(savedProgress);
          if (p.fullDocumentText && p.fileName) {
            const isOcr = p.fileName && p.fileName.startsWith('OCR:');
            const chunkedPages = isOcr ? [p.fullDocumentText] : chunkTextIntoPages(p.fullDocumentText);
            setPages(chunkedPages);
            setFullDocumentText(p.fullDocumentText);
            setFileName(p.fileName);
            let currentHistory = [];
            try {
              if (saved) currentHistory = JSON.parse(saved);
            } catch {}
            const matchedHist = currentHistory.find(h => h.fileName === p.fileName);
            setActiveId(p.activeId || (matchedHist ? matchedHist.id : null));

            const restoredPage = Math.min(p.currentPage || 0, chunkedPages.length - 1);
            setCurrentPage(restoredPage);

            if (p.rate) setRate(p.rate);

            // Load the restored page text and compute word boundaries
            const pageText = chunkedPages[restoredPage] || '';
            setText(pageText);
            const ranges = [];
            const wordsOnly = [];
            const regex = /\S+/g;
            let match;
            while ((match = regex.exec(pageText)) !== null) {
              const wText = match[0];
              if (wText === '#') continue;
              ranges.push({ text: wText, start: match.index, end: match.index + wText.length });
              wordsOnly.push(wText);
            }
            setWordRanges(ranges);
            setWords(wordsOnly);

            // Restore word index if valid
            const restoredWordIndex = p.currentWordIndex >= 0 && p.currentWordIndex < wordsOnly.length
              ? p.currentWordIndex : -1;
            setCurrentWordIndex(restoredWordIndex);
            if (restoredWordIndex >= 0 && wordsOnly.length > 1) {
              setProgress((restoredWordIndex / (wordsOnly.length - 1)) * 100);
            }
          }
        } catch (err) {
          console.error("Failed to restore progress:", err);
        }
      }
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(initApp);
    } else {
      setTimeout(initApp, 100);
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [showWelcome]);

  // Track elapsed reading time when speech is active + push to analytics
  useEffect(() => {
    let interval = null;
    if (speechStatus === 'playing') {
      interval = setInterval(() => {
        setReadingSeconds((s) => s + 1);
        analytics.trackReadingTime(1); // track 1 second per tick
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [speechStatus, analytics]);

  // Auto-save progress to localStorage whenever key values change + sync library progress
  useEffect(() => {
    if (!fullDocumentText || !fileName) return;
    
    const timeoutId = setTimeout(() => {
      const progressData = {
        fileName,
        fullDocumentText,
        currentPage,
        currentWordIndex,
        rate,
        activeId
      };
      localStorage.setItem('readora_progress', JSON.stringify(progressData));

      // Update real-time progress percentage in Personal Library metadata list
      setHistory(prev => {
        const activeItem = prev.find(item => item.fileName === fileName);
        if (activeItem) {
          const pagePct = pages.length > 0 ? Math.round(((currentPage + 1) / pages.length) * 100) : 0;
          if (activeItem.progress !== pagePct) {
            const updated = prev.map(item =>
              item.fileName === fileName ? { ...item, progress: pagePct, date: new Date().toISOString() } : item
            );
            try { localStorage.setItem('readora_history', JSON.stringify(updated)); } catch {}
            return updated;
          }
        }
        return prev;
      });
    }, 1000); // 1-second debounce

    return () => clearTimeout(timeoutId);
  }, [fileName, fullDocumentText, currentPage, currentWordIndex, rate, pages.length, activeId]);

  // Helper to split text naturally into pages
  const chunkTextIntoPages = (fullText) => {
    if (!fullText) return [];

    let parts = [];
    if (fullText.includes('\f')) {
      parts = fullText.split('\f');
    } else if (fullText.includes('---')) {
      parts = fullText.split('---');
    } else {
      // Dynamic paragraph-aware splitter to avoid breaking sentences mid-page
      const paragraphs = fullText.split(/\n\n+/);
      let currentPageText = '';

      paragraphs.forEach(para => {
        if (currentPageText.length + para.length > 800 && currentPageText.length > 0) {
          parts.push(currentPageText.trim());
          currentPageText = para;
        } else {
          currentPageText += (currentPageText ? '\n\n' : '') + para;
        }
      });
      if (currentPageText.trim()) {
        parts.push(currentPageText.trim());
      }
    }
    return parts.filter(p => p.trim().length > 0);
  };

  // Load a single page text and compute word boundaries
  const loadPageText = (pageText, pageIndex, allPages = pages, targetWordIndex = -1, startSpeech = false) => {
    setText(pageText);

    const ranges = [];
    const wordsOnly = [];
    const regex = /\S+/g;
    let match;
    while ((match = regex.exec(pageText)) !== null) {
      const wText = match[0];
      if (wText === '#') continue;
      ranges.push({
        text: wText,
        start: match.index,
        end: match.index + wText.length
      });
      wordsOnly.push(wText);
    }

    setWordRanges(ranges);
    setWords(wordsOnly);
    setCurrentWordIndex(targetWordIndex);
    setProgress(0);

    // Keep speech state correct when switching pages!
    if (startSpeech || speechStatus === 'playing' || isPlaying) {
      speakPageText(ranges, targetWordIndex >= 0 ? targetWordIndex : 0);
    } else {
      setIsPlaying(false);
      setSpeechStatus('idle');
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  };

  // Centralized helper to save files to local reading history logs
  const saveToHistory = async (name, loadedText, fileType = '', existingId = null) => {
    let type = fileType;
    if (!type) {
      const lowerName = name.toLowerCase();
      if (lowerName.startsWith('ocr:') || lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
        type = 'image';
      } else if (lowerName.endsWith('.pdf')) {
        type = 'pdf';
      } else {
        type = 'text';
      }
    }

    const id = existingId || Date.now().toString();
    setActiveId(id);

    // Store full content in IndexedDB to prevent localStorage limit issues
    try {
      await saveDocumentContent(id, loadedText);
    } catch (err) {
      console.error('Failed to write text to IndexedDB:', err);
    }

    const newEntry = {
      id,
      fileName: name,
      name: name,
      type: type,
      date: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
      isFavorite: false,
      progress: 0
    };

    setHistory(prev => {
      const existing = prev.find(item => item.id === id || item.fileName === name);
      let updated;
      if (existing) {
        const merged = { ...newEntry, isFavorite: existing.isFavorite, progress: existing.progress };
        const filtered = prev.filter(item => item.id !== existing.id && item.fileName !== name);
        updated = [merged, ...filtered];
      } else {
        updated = [newEntry, ...prev];
      }
      updated = updated.slice(0, 50); // limit to 50 logs
      try {
        localStorage.setItem('readora_history', JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to save history to localStorage:", err);
      }
      return updated;
    });
    return id;
  };

  // Compute word boundaries when full document changes
  const handleTextLoaded = (loadedText, name, existingId = null, targetPageIndex = 0, targetWordIndex = -1, startSpeech = false) => {
    setIsLoading(true);

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const isOcr = name && name.startsWith('OCR:');
    const chunkedPages = isOcr ? [loadedText] : chunkTextIntoPages(loadedText);
    setPages(chunkedPages);
    setCurrentPage(targetPageIndex);
    setFullDocumentText(loadedText);
    setFileName(name);

    // Centralized history saving
    saveToHistory(name, loadedText, '', existingId);

    loadPageText(chunkedPages[targetPageIndex] || '', targetPageIndex, chunkedPages, targetWordIndex, startSpeech);
    setIsLoading(false);
    addToast(`"${name}" loaded successfully!`, 'success');

    // Analytics: track file + initial page visit
    analytics.trackFileProcessed(name);
    analytics.trackPageVisit(name, targetPageIndex);
  };

  const handleUpdatePageText = async (pageIndex, newPageText) => {
    if (pageIndex < 0 || pageIndex >= pages.length) return;

    const updatedPages = [...pages];
    updatedPages[pageIndex] = newPageText;
    setPages(updatedPages);

    let separator = '\n\n---\n\n';
    if (fullDocumentText.includes('\f')) {
      separator = '\f';
    } else if (fullDocumentText.includes('---')) {
      separator = '---';
    }
    const newFullText = updatedPages.join(separator);
    setFullDocumentText(newFullText);

    loadPageText(newPageText, pageIndex, updatedPages, -1, false);

    const histItem = history.find(item => item.fileName === fileName);
    const docId = activeId || (histItem ? histItem.id : null);
    if (docId) {
      try {
        await saveDocumentContent(docId, newFullText);
      } catch (err) {
        console.error("Failed to save edited document to IndexedDB:", err);
      }
    }
  };

  // PDF.js Text Extraction Handler
  const handlePdfSelected = async (file) => {
    setIsLoading(true);
    setOcrProgress(0);
    setOcrError(null);
    setFileName(file.name);

    addToast(`Extracting PDF text: "${file.name}"`, 'info');
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          
          // Dynamically load PDF.js only when a PDF is selected
          const pdfjsLib = await import('pdfjs-dist');
          const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.min.js?url');
          pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker.default;
          
          const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
          const pdf = await loadingTask.promise;
          const numPages = pdf.numPages;
          const extractedPages = [];

          for (let i = 1; i <= numPages; i++) {
            // Update page-by-page progress in UI
            setOcrProgress(Math.round((i / numPages) * 100));

            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            extractedPages.push(pageText.trim());
            
            // Yield to main thread every few pages to prevent UI freezing on large PDFs
            if (i % 5 === 0) {
              await new Promise(resolve => setTimeout(resolve, 0));
            }
          }

          const hasText = extractedPages.some(pageStr => pageStr.trim().length > 0);
          if (!hasText) {
            const errorMsg = "No readable text discovered inside this PDF. Try image OCR!";
            setOcrError(errorMsg);
            setIsLoading(false);
            addToast(errorMsg, 'error');
            return;
          }

          // Clear any active image previews
          if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
          }
          setImagePreview(null);
          setImageFile(null);

          setPages(extractedPages);
          setCurrentPage(0);
          const pdfFullText = extractedPages.join('\n\n');
          setFullDocumentText(pdfFullText);

          // Save PDF text to centralized history log
          saveToHistory(file.name, pdfFullText, 'pdf');

          // Sync PDF load with reading analytics
          analytics.trackFileProcessed(file.name);
          analytics.trackPageVisit(file.name, 0);

          loadPageText(extractedPages[0] || '', 0, extractedPages);
          addToast("PDF text extracted successfully!", "success");
        } catch (err) {
          console.error("PDF Parsing inner error:", err);
          const errorMsg = "Failed to parse PDF pages: " + err.message;
          setOcrError(errorMsg);
          addToast(errorMsg, 'error');
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (err) {
      console.error("FileReader PDF error:", err);
      const errorMsg = "Failed to read PDF file buffer: " + err.message;
      setOcrError(errorMsg);
      setIsLoading(false);
      addToast(errorMsg, 'error');
    }
  };

  const handleImageSelected = (file, previewUrl) => {
    setImageFile(file);
    setImagePreview(previewUrl);
    setFileName(file.name);
    setOcrError(null);
    setOcrProgress(0);
    addToast('Image uploaded! Click "Extract Text (OCR)" to begin.', 'info');
  };

  const cleanOcrText = (text) => {
    if (!text) return '';

    const rawLines = text.split(/\n/);
    const cleaned = [];

    for (let i = 0; i < rawLines.length; i++) {
      let line = rawLines[i];

      // ── STEP 1: Strip ALL noise symbols ──
      // Remove isolated noise characters and common OCR garbage
      line = line.replace(/[|\\/_~+=<>{}[\]@#$%^&*]+/g, ' ');
      // Remove isolated single letters that are noise (but keep "I" and "a")
      line = line.replace(/(?<!\w)([b-hj-np-rt-zB-HJ-NP-RT-Z])(?!\w)/g, ' ');
      // Remove isolated digits that aren't part of real numbers/dates
      line = line.replace(/(?<!\w)(\d{1,2})(?!\w|\.|\d)/g, (match, num) => {
        // Keep numbers that look like page numbers or years
        if (parseInt(num) > 31) return match;
        return ' ';
      });
      // Remove sequences of dots that aren't ellipsis (4+ dots)
      line = line.replace(/\.{4,}/g, '');
      // Remove colons and semicolons that appear at start/end or isolated
      line = line.replace(/(?:^|(?<=\s))[:;](?:\s|$)/g, ' ');
      // Remove "EF" OCR noise pattern
      line = line.replace(/\bEF\b/gi, ' ');

      // ── STEP 2: Fix broken words ──
      // Rejoin hyphenated line breaks: "morn- ing" → "morning"
      line = line.replace(/(\w+)-\s+(\w+)/g, '$1$2');
      // Fix spaced-out letters: "h e l l o" (3+ single chars with spaces)
      line = line.replace(/\b(\w)\s+(?=\w\s+\w\b)/g, (match, ch) => ch);

      // ── STEP 3: Normalize whitespace ──
      line = line.replace(/\s+/g, ' ').trim();

      // Skip empty or very short garbage lines (1-2 chars of junk)
      if (!line || line.length < 3) continue;
      // Skip lines that are mostly non-alphabetic (noise lines)
      const alphaCount = (line.match(/[a-zA-Z]/g) || []).length;
      if (alphaCount / line.length < 0.5) continue;

      cleaned.push(line);
    }

    // ── STEP 4: Detect structure (headings vs paragraphs) ──
    const structured = [];
    let currentParagraph = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        structured.push(currentParagraph.join(' '));
        currentParagraph = [];
      }
    };

    for (let i = 0; i < cleaned.length; i++) {
      const line = cleaned[i];
      const wordCount = line.split(/\s+/).length;

      // Detect headings: chapter keywords, ALL CAPS short lines, or title-cased short lines
      const isChapter = /^(chapter|section|part|book|prologue|epilogue|introduction|conclusion)\b/i.test(line);
      const isAllCaps = line === line.toUpperCase() && wordCount <= 10 && /[A-Z]{2,}/.test(line);
      const isShortTitle = wordCount <= 8 && !line.endsWith('.') && !line.endsWith(',');

      if (isChapter || isAllCaps) {
        flushParagraph();
        structured.push('# ' + line);
      } else if (isShortTitle && wordCount >= 2) {
        // Check if it's title-cased (most words start uppercase)
        const words = line.split(/\s+/);
        const capsWords = words.filter(w => /^[A-Z]/.test(w)).length;
        const minorWords = words.filter(w => /^(of|a|the|and|in|to|for|on|with|at|by|from|but|or|so|yet|an|is|it)$/i.test(w)).length;
        if ((capsWords + minorWords) >= words.length * 0.8) {
          flushParagraph();
          structured.push('# ' + line);
        } else {
          currentParagraph.push(line);
        }
      } else {
        // Regular text line — accumulate into paragraph
        if (currentParagraph.length > 0) {
          const lastLine = currentParagraph[currentParagraph.length - 1];
          // If previous line ended with sentence-ending punctuation, start new paragraph
          if (/[.?!'""]$/.test(lastLine) && /^[A-Z]/.test(line)) {
            flushParagraph();
          }
        }
        currentParagraph.push(line);
      }
    }
    flushParagraph();

    // ── STEP 5: Final cleanup pass on each block ──
    const finalBlocks = structured.map(block => {
      // Remove any remaining double spaces
      block = block.replace(/\s+/g, ' ').trim();
      // Fix common OCR substitutions
      block = block.replace(/\bl\b(?=[a-z])/g, 'I'); // lowercase L before lowercase = likely "I"
      block = block.replace(/\s+([.,;:!?])/g, '$1'); // remove space before punctuation
      return block;
    }).filter(b => b.length > 0);

    return finalBlocks.join('\n\n');
  };

  // Tesseract.js OCR extraction — uses direct recognize call to avoid worker postMessage cloning errors
  const handleExtractOCR = async () => {
    if (!imageFile) return;

    setIsLoading(true);
    setOcrProgress(0);
    setOcrError(null);
    addToast('Extracting text with Tesseract.js OCR...', 'info');

    try {
      // Dynamically load Tesseract only when OCR is needed
      const Tesseract = await import('tesseract.js');
      
      addToast('Running OCR recognition...', 'info');
      const result = await Tesseract.recognize(imageFile, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });

      const rawText = result.data.text || '';
      const extractedText = cleanOcrText(rawText);

      if (!extractedText) {
        const errorMsg = 'No readable text could be detected in this image. Try a clearer image.';
        setOcrError(errorMsg);
        setIsLoading(false);
        addToast(errorMsg, 'error');
        return;
      }

      // Clear image preview and load extracted text into the reader
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
      setImagePreview(null);
      setImageFile(null);
      handleTextLoaded(extractedText, `OCR: ${fileName}`);
      addToast('Image text extracted successfully!', 'success');
    } catch (err) {
      console.error('Tesseract OCR error:', err);
      const errorMsg = err.message || 'An unexpected error occurred during OCR processing.';
      setOcrError(errorMsg);
      addToast(errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setText('');
    setFileName('');
    setWordRanges([]);
    setWords([]);
    setPages([]);
    setCurrentPage(0);
    setFullDocumentText('');
    setCurrentWordIndex(-1);
    setProgress(0);
    setIsPlaying(false);
    setSpeechStatus('idle');
    setOcrError(null);
    setOcrProgress(0);

    // Kill word tracker timer
    if (trackerIntervalRef.current) {
      clearInterval(trackerIntervalRef.current);
      trackerIntervalRef.current = null;
    }

    // Clean up image preview URL
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);

    // Clear saved progress from localStorage
    localStorage.removeItem('readora_progress');

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (utteranceRef.current) {
        utteranceRef.current.onstart = null;
        utteranceRef.current.onboundary = null;
        utteranceRef.current.onend = null;
        utteranceRef.current.onerror = null;
      }
      window.speechSynthesis.cancel();
      if (window.activeUtterance) {
        window.activeUtterance = null;
      }
    }
    addToast("Document cleared", "info");
  };

  const resumeTimerTracking = () => {
    if (trackerIntervalRef.current) {
      clearInterval(trackerIntervalRef.current);
    }
    
    const activeRate = rate;
    const baseWpm = 175;
    const currentWpm = baseWpm * activeRate;
    const delayPerWord = (60 * 1000) / currentWpm;
    
    let timerIndex = currentWordIndex >= 0 ? currentWordIndex : currentChunkStartIndexRef.current;
    const endLimit = chunkEndIndexRef.current || wordRanges.length;

    trackerIntervalRef.current = setInterval(() => {
      if (timerIndex < endLimit - 1) {
        timerIndex++;
        setCurrentWordIndex(timerIndex);
        const percentage = wordRanges.length > 1 
          ? (timerIndex / (wordRanges.length - 1)) * 100 
          : 100;
        setProgress(percentage);
      } else {
        clearInterval(trackerIntervalRef.current);
      }
    }, delayPerWord);
  };

  // Global speak Page text helper
  const speakPageText = (rangesToUse, startIndex, rateOverride = null) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    currentChunkStartIndexRef.current = startIndex;

    // 1. Prevent overlapping speech: Cancel any active/paused speech first.
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    // Safely detach all listeners from the previous utterance to prevent state race-conditions
    if (utteranceRef.current) {
      utteranceRef.current.onstart = null;
      utteranceRef.current.onboundary = null;
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
    }

    // Clear any active tracking intervals
    if (trackerIntervalRef.current) {
      clearInterval(trackerIntervalRef.current);
    }

    window.speechSynthesis.cancel();

    // Group remaining words starting from startIndex into a stable text chunk (sentence-chunking)
    const maxWords = 25; // Safe word-limit per utterance for mobile engines
    const maxChars = 150; // Safe character-limit per utterance for mobile engines
    
    let currentIndex = startIndex;
    let wordCount = 0;
    let charCount = 0;
    
    while (currentIndex < rangesToUse.length) {
      const wordObj = rangesToUse[currentIndex];
      const wordText = wordObj.text;
      
      wordCount++;
      charCount += wordText.length + 1; // accounting for space divider
      currentIndex++;
      
      // Avoid splitting on common abbreviations like Mr., Mrs., Dr.
      const isAbbreviation = /^(mr|mrs|dr|ms|eg|ie|vs)\.$/i.test(wordText);
      const endsWithPunctuation = /[.?!]$/.test(wordText) && !isAbbreviation;
      
      if (endsWithPunctuation) {
        break;
      }
      
      if (wordCount >= maxWords || charCount >= maxChars) {
        break;
      }
    }
    
    const chunkEndIndex = currentIndex;
    chunkEndIndexRef.current = chunkEndIndex;

    const spokenWords = rangesToUse.slice(startIndex, chunkEndIndex);
    const textToSpeak = spokenWords.map(w => w.text).join(' ');

    if (!textToSpeak.trim()) {
      setIsPlaying(false);
      setSpeechStatus('idle');
      utteranceRef.current = null;
      if (window.activeUtterance) {
        window.activeUtterance = null;
      }
      return;
    }

    const activeRate = rateOverride !== null ? rateOverride : rate;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = activeRate;

    // iOS Safari aggressive garbage collection prevention
    if (typeof window !== 'undefined') {
      window.activeUtterance = utterance;
    }

    // Timer progression setup
    let timerIndex = startIndex;
    const baseWpm = 175; // Average human reading speed
    const currentWpm = baseWpm * activeRate;
    const delayPerWord = (60 * 1000) / currentWpm;

    const startTrackerTimer = () => {
      if (trackerIntervalRef.current) {
        clearInterval(trackerIntervalRef.current);
      }
      trackerIntervalRef.current = setInterval(() => {
        if (timerIndex < chunkEndIndex - 1) {
          timerIndex++;
          setCurrentWordIndex(timerIndex);
          const percentage = rangesToUse.length > 1 
            ? (timerIndex / (rangesToUse.length - 1)) * 100 
            : 100;
          setProgress(percentage);
        } else {
          clearInterval(trackerIntervalRef.current);
        }
      }, delayPerWord);
    };

    utterance.onstart = () => {
      if (utteranceRef.current !== utterance) return;
      setIsPlaying(true);
      setSpeechStatus('playing');
      startTrackerTimer();
    };

    // Word tracker timer drives the progression. Browser boundaries are ignored to prevent micro-jitter.

    utterance.onend = () => {
      if (utteranceRef.current !== utterance) {
        return;
      }

      if (trackerIntervalRef.current) {
        clearInterval(trackerIntervalRef.current);
      }

      // If we have more chunks on the current page, speak the next chunk
      if (chunkEndIndex < rangesToUse.length) {
        speakPageText(rangesToUse, chunkEndIndex, rateOverride);
      } else {
        // Read real-time values from stale-closure safe stateRef container
        const { currentPage: livePage, pages: livePages } = stateRef.current;
        const nextIdx = livePage + 1;
        
        if (nextIdx < livePages.length) {
          setCurrentPage(nextIdx);
          loadPageText(livePages[nextIdx], nextIdx, livePages);
        } else {
          setIsPlaying(false);
          setSpeechStatus('idle');
          setCurrentWordIndex(-1);
          setProgress(0);
          utteranceRef.current = null;
          if (window.activeUtterance) {
            window.activeUtterance = null;
          }
        }
      }
    };

    utterance.onerror = (e) => {
      if (utteranceRef.current !== utterance) {
        return;
      }

      if (trackerIntervalRef.current) {
        clearInterval(trackerIntervalRef.current);
      }

      // Ignore manual interruptions / cancellations (which throw interrupted/canceled/etc. error codes)
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.error('SpeechSynthesis error:', e);
        setIsPlaying(false);
        setSpeechStatus('stopped');
        addToast(`Speech error: ${e.error || 'unknown error'}`, 'error');
        utteranceRef.current = null;
        if (window.activeUtterance) {
          window.activeUtterance = null;
        }
      }
    };

    utteranceRef.current = utterance;
    setIsPlaying(true);
    setSpeechStatus('playing');
    window.speechSynthesis.speak(utterance);
  };

  // Speak text from index helper
  const speak = (startIndex, rateOverride = null) => {
    speakPageText(wordRanges, startIndex, rateOverride);
  };

  const handlePlayPause = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isPlaying) {
      saveCheckpoint();

      // Stop the word tracker timer on pause
      if (trackerIntervalRef.current) {
        clearInterval(trackerIntervalRef.current);
        trackerIntervalRef.current = null;
      }

      if (isMobile) {
        // On mobile browsers, standard pause/resume is buggy. We cancel and save position instead.
        window.speechSynthesis.cancel();
        if (window.activeUtterance) {
          window.activeUtterance = null;
        }
        setIsPlaying(false);
        setSpeechStatus('paused');
        addToast('Playback paused', 'info');
      } else {
        window.speechSynthesis.pause();
        setIsPlaying(false);
        setSpeechStatus('paused');
        addToast('Playback paused', 'info');
      }
    } else {
      if (isMobile && speechStatus === 'paused') {
        // On mobile, resume from the current word index by starting a fresh speech utterance
        const resumeIndex = currentWordIndex >= 0 ? currentWordIndex : currentChunkStartIndexRef.current;
        speak(resumeIndex);
        addToast('Playback resumed', 'success');
      } else if (speechStatus === 'paused' || window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
        setIsPlaying(true);
        setSpeechStatus('playing');

        // Restart the word tracker timer on resume
        resumeTimerTracking();

        addToast('Playback resumed', 'success');

        // Browser fallback helper: if resume hangs, re-trigger
        setTimeout(() => {
          if (window.speechSynthesis.paused && speechStatus === 'playing') {
            window.speechSynthesis.resume();
          }
        }, 100);
      } else {
        const resumeIndex = currentWordIndex >= 0 ? currentWordIndex : currentChunkStartIndexRef.current;
        speak(resumeIndex);
        addToast('Reading playback started!', 'success');
      }
    }
  };

  const handleStop = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    // Kill word tracker timer
    if (trackerIntervalRef.current) {
      clearInterval(trackerIntervalRef.current);
      trackerIntervalRef.current = null;
    }

    if (utteranceRef.current) {
      utteranceRef.current.onstart = null;
      utteranceRef.current.onboundary = null;
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
    }
    window.speechSynthesis.cancel();
    if (window.activeUtterance) {
      window.activeUtterance = null;
    }
    setIsPlaying(false);
    setSpeechStatus('stopped');
    setCurrentWordIndex(-1);
    setProgress(0);
    addToast('Playback stopped', 'info');
  };

  const handleBackToHome = () => {
    handleStop();
    setShowWelcome(true);
  };

  const handlePrev = () => {
    const activeIndex = currentWordIndex >= 0 ? currentWordIndex : currentChunkStartIndexRef.current;
    const targetIndex = Math.max(0, activeIndex - 5);
    setCurrentWordIndex(targetIndex);
    if (isPlaying) {
      speak(targetIndex);
    } else {
      setProgress(wordRanges.length > 1 ? (targetIndex / (wordRanges.length - 1)) * 100 : 0);
    }
  };

  const handleNext = () => {
    const activeIndex = currentWordIndex >= 0 ? currentWordIndex : currentChunkStartIndexRef.current;
    const targetIndex = Math.min(wordRanges.length - 1, activeIndex + 5);
    setCurrentWordIndex(targetIndex);
    if (isPlaying) {
      speak(targetIndex);
    } else {
      setProgress(wordRanges.length > 1 ? (targetIndex / (wordRanges.length - 1)) * 100 : 100);
    }
  };

  const handleWordClick = (index, demoText = null) => {
    if (demoText) {
      handleTextLoaded(demoText, 'Readora Demo.txt');
      return;
    }

    if (index >= 0) {
      setCurrentWordIndex(index);
      if (isPlaying || speechStatus === 'playing') {
        speakPageText(wordRanges, index);
      } else {
        setProgress(wordRanges.length > 1 ? (index / (wordRanges.length - 1)) * 100 : 0);
      }
    }
  };

  const handlePageChange = (pageIndex) => {
    if (pageIndex < 0 || pageIndex >= pages.length) return;
    setCurrentPage(pageIndex);
    loadPageText(pages[pageIndex], pageIndex, pages);
    addToast(`Skipped to Page ${pageIndex + 1}`, 'info');
    analytics.trackPageVisit(fileName, pageIndex);
  };

  const handleClearHistory = async () => {
    setHistory([]);
    localStorage.removeItem('readora_history');
    try {
      await clearAllDocuments();
    } catch (err) {
      console.error('Failed to clear IndexedDB docs:', err);
    }
    addToast('Personal Library cleared', 'success');
  };

  const handleResetProgress = () => {
    localStorage.removeItem('readora_progress');
    setReadingSeconds(0);
    if (pages.length > 0) {
      setCurrentPage(0);
      loadPageText(pages[0], 0, pages);
    }
    setRate(1);
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (utteranceRef.current) {
        utteranceRef.current.onboundary = null;
        utteranceRef.current.onend = null;
        utteranceRef.current.onerror = null;
      }
      window.speechSynthesis.cancel();
      if (window.activeUtterance) {
        window.activeUtterance = null;
      }
    }
    setIsPlaying(false);
    setSpeechStatus('idle');
    addToast('Reading progress has been reset', 'info');
  };

  const handleSelectHistoryItem = async (item) => {
    setIsLoading(true);
    try {
      const content = await getDocumentContent(item.id);
      if (content) {
        handleTextLoaded(content, item.fileName, item.id);
      } else if (item.text) {
        // Fallback for legacy items that might still store text in localStorage
        handleTextLoaded(item.text, item.fileName, item.id);
      } else {
        addToast('Document content not found in database.', 'error');
      }
    } catch (err) {
      console.error('Error fetching document from IndexedDB:', err);
      if (item.text) {
        handleTextLoaded(item.text, item.fileName, item.id);
      } else {
        addToast('Error opening library document.', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleFavorite = (id) => {
    setHistory(prev => {
      const updated = prev.map(item =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      );
      try { localStorage.setItem('readora_history', JSON.stringify(updated)); } catch {}
      return updated;
    });
    addToast('Favorite status updated!', 'success');
  };

  const handleDeleteHistoryItem = async (id) => {
    setHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      try { localStorage.setItem('readora_history', JSON.stringify(updated)); } catch {}
      return updated;
    });
    try {
      await deleteDocumentContent(id);
    } catch (err) {
      console.error('Failed to delete document from IndexedDB:', err);
    }
    addToast('Document deleted from Library', 'info');
  };

  const handleRateChange = (newRate) => {
    setRate(newRate);
    if (isPlaying || speechStatus === 'playing') {
      const resumeIndex = currentWordIndex >= 0 ? currentWordIndex : currentChunkStartIndexRef.current;
      speak(resumeIndex, newRate);
    }
    addToast(`Playback speed set to ${newRate}x`, 'info');
    analytics.trackSpeedUsed(newRate);
  };

  const handleGetStarted = () => {
    setShowWelcome(false);
    analytics.trackSessionStart();
  };

  // ── Notes, Bookmarks & Checkpoints helpers ───────────────────────────
  const docBookmarks = bookmarks.filter((b) => b.fileName === fileName);
  const docNotes = notes.filter((n) => n.fileName === fileName);
  const currentPageIsBookmarked = docBookmarks.some((b) => b.page === currentPage + 1);

  const handleBookmarkToggle = () => {
    setBookmarks((prev) => {
      const existing = prev.find((b) => b.fileName === fileName && b.page === currentPage + 1);
      let next;
      if (existing) {
        next = prev.filter((b) => b.id !== existing.id);
        addToast(`Removed bookmark from page ${currentPage + 1}`, 'info');
      } else {
        const bm = {
          id: `${Date.now()}-${Math.random()}`,
          fileName,
          page: currentPage + 1,
          label: `Page ${currentPage + 1}`,
          createdAt: new Date().toISOString(),
        };
        next = [...prev, bm];
        addToast(`Bookmarked page ${currentPage + 1}`, 'success');
      }
      try { localStorage.setItem('readora_bookmarks', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleBookmarkSelection = (selectedText) => {
    if (!fileName) return;
    setBookmarks((prev) => {
      const bm = {
        id: `${Date.now()}-${Math.random()}`,
        fileName,
        page: currentPage + 1,
        label: `Page ${currentPage + 1}`,
        selectedText,
        createdAt: new Date().toISOString(),
      };
      const next = [...prev, bm];
      try { localStorage.setItem('readora_bookmarks', JSON.stringify(next)); } catch {}
      return next;
    });
    addToast(`Bookmarked selection on page ${currentPage + 1}`, 'success');
  };

  const handleNoteSelection = (selectedText, noteText) => {
    if (!fileName) return;
    setNotes((prev) => {
      const note = {
        id: `${Date.now()}-${Math.random()}`,
        fileName,
        page: currentPage + 1,
        text: noteText.trim(),
        selectedText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const next = [note, ...prev];
      try { localStorage.setItem('readora_notes', JSON.stringify(next)); } catch {}
      return next;
    });
    addToast(`Saved note on page ${currentPage + 1}`, 'success');
  };

  const handleAddNote = (text, pageOffset = 0, selectedText = '') => {
    if (!fileName) return;
    const note = {
      id: `${Date.now()}-${Math.random()}`,
      fileName,
      page: currentPage + 1 + pageOffset,
      text: text.trim(),
      selectedText,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => {
      const next = [note, ...prev];
      try { localStorage.setItem('readora_notes', JSON.stringify(next)); } catch {}
      return next;
    });
    addToast('Note added', 'success');
  };

  const handleEditNote = (id, newText) => {
    setNotes((prev) => {
      const next = prev.map((n) =>
        n.id === id ? { ...n, text: newText.trim(), updatedAt: new Date().toISOString() } : n
      );
      try { localStorage.setItem('readora_notes', JSON.stringify(next)); } catch {}
      return next;
    });
    addToast('Note updated', 'success');
  };

  const handleDeleteNote = (id) => {
    setNotes((prev) => {
      const next = prev.filter((n) => n.id !== id);
      try { localStorage.setItem('readora_notes', JSON.stringify(next)); } catch {}
      return next;
    });
    addToast('Note deleted', 'info');
  };

  const handleDeleteBookmark = (id) => {
    setBookmarks((prev) => {
      const next = prev.filter((b) => b.id !== id);
      try { localStorage.setItem('readora_bookmarks', JSON.stringify(next)); } catch {}
      return next;
    });
    addToast('Bookmark removed', 'info');
  };

  const saveCheckpoint = () => {
    if (!fileName || !words || words.length === 0) return;
    const wordIndex = currentWordIndex >= 0 ? currentWordIndex : 0;
    const textSnippet = words.slice(wordIndex, wordIndex + 12).map(w => w.text).join(' ');

    const newCp = {
      id: `${Date.now()}-${Math.random()}`,
      fileName,
      pageIndex: currentPage,
      wordIndex,
      textSnippet,
      timestamp: new Date().toISOString(),
    };

    setCheckpoints((prev) => {
      const filtered = prev.filter(cp => !(cp.fileName === fileName && cp.pageIndex === currentPage));
      const next = [newCp, ...filtered].slice(0, 15);
      try { localStorage.setItem('readora_checkpoints', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleResumeCheckpoint = async (cp) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (window.activeUtterance) {
      window.activeUtterance = null;
    }
    setIsPlaying(false);
    setSpeechStatus('idle');

    if (cp.fileName !== fileName) {
      const histItem = history.find(h => h.fileName === cp.fileName);
      if (histItem) {
        setIsLoading(true);
        try {
          const content = await getDocumentContent(histItem.id);
          const docText = content || histItem.text;
          if (docText) {
            handleTextLoaded(docText, histItem.fileName, histItem.id, cp.pageIndex, cp.wordIndex, true);
          } else {
            addToast('Content not found in history database', 'error');
          }
        } catch (err) {
          console.error(err);
          if (histItem.text) {
            handleTextLoaded(histItem.text, histItem.fileName, histItem.id, cp.pageIndex, cp.wordIndex, true);
          } else {
            addToast('Failed to retrieve content', 'error');
          }
        } finally {
          setIsLoading(false);
        }
      } else {
        addToast('Document not found in library', 'error');
      }
    } else {
      setCurrentPage(cp.pageIndex);
      loadPageText(pages[cp.pageIndex], cp.pageIndex, pages, cp.wordIndex, true);
    }

    setIsAnalyticsOpen(false);
    addToast('Resumed from checkpoint', 'success');
  };

  const handleDeleteCheckpoint = (id) => {
    setCheckpoints(prev => {
      const next = prev.filter(cp => cp.id !== id);
      try { localStorage.setItem('readora_checkpoints', JSON.stringify(next)); } catch {}
      return next;
    });
    addToast('Checkpoint removed', 'info');
  };

  // Show welcome screen if user hasn't dismissed it
  if (showWelcome) {
    return <WelcomeScreen onGetStarted={handleGetStarted} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-violet-500/30 selection:text-violet-200">
      <Suspense fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-violet-500 mb-4"></div>
          <p className="text-sm font-semibold">Loading Readora Workspace...</p>
        </div>
      }>
        <Header
          onHistoryToggle={() => setIsHistoryOpen(true)}
          onNotesToggle={() => setIsNotesOpen(true)}
          onAnalyticsToggle={() => setIsAnalyticsOpen(true)}
          bookmarkCount={docBookmarks.length}
          notesCount={docNotes.length}
          onBackToHome={handleBackToHome}
        />

        <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-36 sm:pb-36 space-y-6 sm:space-y-8">

          {/* Banner Section */}
          <div className="relative rounded-2xl overflow-hidden glass-panel border-violet-500/10 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-indigo-950/10 to-violet-950/20 shadow-2xl animate-fade-in">
            <div className="text-left space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-400 ring-1 ring-violet-500/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Transform Documents into Audio</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white leading-tight">
                Listen to books seamlessly.
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed font-normal">
                Readora processes files purely in your browser, preserving privacy. It highlights words live and synchronizes reading seamlessly.
              </p>
            </div>
          </div>

          {/* Core Sections Grid */}
          <div className="space-y-6">
            <UploadSection
              onTextLoaded={handleTextLoaded}
              onImageSelected={handleImageSelected}
              onPdfSelected={handlePdfSelected}
              onExtractOCR={handleExtractOCR}
              imagePreview={imagePreview}
              isLoading={isLoading}
              ocrProgress={ocrProgress}
              ocrError={ocrError}
              fileName={fileName}
              onClear={handleClear}
            />

             <TextDisplay
              text={text}
              words={words}
              currentWordIndex={currentWordIndex}
              onWordClick={handleWordClick}
              currentPage={currentPage}
              totalPages={pages.length}
              onPageChange={handlePageChange}
              readingSeconds={readingSeconds}
              isTimerRunning={speechStatus === 'playing'}
              onToggleTimer={handlePlayPause}
              onAddSelectionBookmark={handleBookmarkSelection}
              onAddSelectionNote={handleNoteSelection}
              onUpdatePageText={handleUpdatePageText}
              onStartEditing={handleStop}
            />

            <AudioControls
              isPlaying={isPlaying}
              speechStatus={speechStatus}
              onPlayPause={handlePlayPause}
              onStop={handleStop}
              rate={rate}
              onRateChange={handleRateChange}
              voices={voices}
              selectedVoice={selectedVoice}
              onVoiceChange={setSelectedVoice}
              progress={progress}
              onPrev={handlePrev}
              onNext={handleNext}
              disabled={!text}
              onResetProgress={handleResetProgress}
            />
          </div>
        </main>

        {/* Slide-over Library sidebar */}
        <Suspense fallback={<div className="text-center py-4 text-slate-400">Loading library...</div>}>
          <HistorySidebar
            isOpen={isHistoryOpen}
            onClose={() => setIsHistoryOpen(false)}
            history={history}
            onClearHistory={handleClearHistory}
            onSelectHistoryItem={handleSelectHistoryItem}
            onToggleFavorite={handleToggleFavorite}
            onDeleteHistoryItem={handleDeleteHistoryItem}
          />
        </Suspense>

        {/* Notes & Bookmarks panel — only mount when opened to avoid loading chunk eagerly */}
        {isNotesOpen && (
          <Suspense fallback={null}>
            <NotesBookmarkPanel
              isOpen={isNotesOpen}
              onClose={() => setIsNotesOpen(false)}
              currentPage={currentPage}
              totalPages={pages.length}
              fileName={fileName}
              onJumpToPage={handlePageChange}
              currentPageIsBookmarked={currentPageIsBookmarked}
              onBookmarkToggle={handleBookmarkToggle}
              bookmarks={bookmarks}
              notes={notes}
              onDeleteBookmark={handleDeleteBookmark}
              onAddNote={handleAddNote}
              onEditNote={handleEditNote}
              onDeleteNote={handleDeleteNote}
            />
          </Suspense>
        )}

        {/* Analytics Dashboard (History Panel) — only mount when opened to avoid loading chart chunk eagerly */}
        {isAnalyticsOpen && (
          <Suspense fallback={null}>
            <AnalyticsDashboard
              isOpen={isAnalyticsOpen}
              onClose={() => setIsAnalyticsOpen(false)}
              analytics={analytics.getAnalytics()}
              onReset={() => { analytics.resetAnalytics(); setCheckpoints([]); localStorage.removeItem('readora_checkpoints'); addToast('History and checkpoints cleared', 'info'); }}
              checkpoints={checkpoints}
              onResumeCheckpoint={handleResumeCheckpoint}
              onDeleteCheckpoint={handleDeleteCheckpoint}
            />
          </Suspense>
        )}

        {/* Achievements pop-up notification with celebration animation */}
        {activeAchievement && (
          <Suspense fallback={null}>
            <AchievementNotification
              achievement={activeAchievement}
              onClose={() => setActiveAchievement(null)}
            />
          </Suspense>
        )}

        <Footer />
      </Suspense>





      {/* Floating Toast Notification Container */}
      <div
        className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
        role="status"
        aria-live="polite"
      >
        {toasts.map(t => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-xl border shadow-2xl animate-slide-in backdrop-blur-md ${isSuccess
                  ? 'bg-slate-900/90 border-emerald-500/30 text-slate-200 shadow-emerald-950/20'
                  : isError
                    ? 'bg-slate-900/90 border-red-500/30 text-slate-200 shadow-red-950/20'
                    : 'bg-slate-900/90 border-violet-500/30 text-slate-200 shadow-slate-950/20'
                }`}
            >
              <div className="flex items-center gap-2.5 text-xs font-semibold">
                {isSuccess ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" aria-hidden="true" />
                ) : isError ? (
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" aria-hidden="true" />
                ) : (
                  <Info className="h-4 w-4 text-violet-400 shrink-0" aria-hidden="true" />
                )}
                <span>{t.message}</span>
              </div>
              <button
                onClick={() => setToasts(prev => prev.filter(item => item.id !== t.id))}
                className="text-slate-500 hover:text-slate-300 p-0.5 rounded-lg hover:bg-slate-800/40 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;