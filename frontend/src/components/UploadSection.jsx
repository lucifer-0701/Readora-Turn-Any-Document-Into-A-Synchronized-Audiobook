import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  ArrowRight, 
  Clipboard, 
  Trash2, 
  CheckCircle2, 
  Image as ImageIcon, 
  Loader2, 
  AlertTriangle, 
  FolderOpen,
  FileCheck,
  Sparkles
} from 'lucide-react';

const UploadSection = React.memo(function UploadSection({ 
  onTextLoaded, 
  onImageSelected,
  onPdfSelected,
  onExtractOCR,
  imagePreview,
  isLoading, 
  ocrProgress,
  ocrError,
  fileName, 
  onClear 
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [manualText, setManualText] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [fileType, setFileType] = useState('');
  
  const fileInputRef = useRef(null);
  const replaceFileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;

    // Strict file type validation
    const ext = file.name.toLowerCase().split('.').pop();
    const allowedExts = ['pdf', 'txt', 'png', 'jpg', 'jpeg', 'webp'];
    const isImage = file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
    const isPdf = file.type === 'application/pdf' || ext === 'pdf';
    const isTxt = file.type === 'text/plain' || ext === 'txt';

    if (!isImage && !isPdf && !isTxt) {
      alert("Unsupported file format! Please upload a PDF, TXT, or Image file (.png, .jpg, .jpeg, .webp).");
      return;
    }
    
    // Save metadata locally
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    setFileSize(sizeInMB > 0.1 ? `${sizeInMB} MB` : `${Math.round(file.size / 1024)} KB`);
    
    let type = 'Plain Text';
    if (isImage) {
      type = 'Image File';
    } else if (isPdf) {
      type = 'PDF Document';
    }
    setFileType(type);
    
    if (isImage) {
      const previewUrl = URL.createObjectURL(file);
      onImageSelected(file, previewUrl);
    } else if (isPdf) {
      onPdfSelected(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        onTextLoaded(text, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleClearClick = () => {
    setFileSize('');
    setFileType('');
    onClear();
  };

  const handleReplaceFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      e.target.value = '';
      setFileSize('');
      setFileType('');
      onClear();
      processFile(file);
    }
  };

  const triggerReplaceInput = () => {
    replaceFileInputRef.current.click();
  };

  const handlePasteSubmit = () => {
    if (manualText.trim()) {
      setFileType('Plain Text');
      setFileSize(`${(new Blob([manualText]).size / 1024).toFixed(1)} KB`);
      onTextLoaded(manualText, 'Pasted Document');
      setManualText('');
    }
  };

  const isPdfLoading = fileName && fileName.toLowerCase().endsWith('.pdf') && isLoading;
  const detectedType = fileName 
    ? (fileName.toLowerCase().endsWith('.pdf') 
        ? 'PDF' 
        : (fileName.startsWith('OCR:') || fileName.toLowerCase().match(/\.(png|jpe?g|gif|webp)$/)
          ? 'Image (OCR)' 
          : 'Text'))
    : '';

  return (
    <section className="w-full space-y-5" aria-labelledby="upload-hub-title">
      <h2 id="upload-hub-title" className="sr-only">Document Upload and Processing</h2>

      {/* OCR/PDF Error Banner outside loading states */}
      <AnimatePresence>
        {ocrError && !isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="flex items-start gap-3 rounded-2xl bg-red-500/10 border border-red-500/20 p-4 text-left w-full shadow-lg shadow-red-950/5"
            role="alert"
            aria-live="assertive"
          >
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <h4 className="text-sm font-bold text-red-400">Processing Failed</h4>
              <p className="text-xs text-red-400/80 mt-1 leading-relaxed">{ocrError}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!fileName && !imagePreview && !isLoading ? (
          /* State A: Drag & Drop + Paste Input Panel */
          <motion.div 
            key="empty-state"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Drag & Drop File Upload Panel */}
            <div className="lg:col-span-2">
              <motion.div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); triggerFileInput(); } }}
                tabIndex={0}
                role="button"
                aria-label="Upload document file. Supports PDF, TXT, and images"
                whileHover={{ scale: 1.002 }}
                animate={{ 
                  borderColor: isDragActive ? '#8b5cf6' : 'rgba(51, 65, 85, 0.4)',
                  backgroundColor: isDragActive ? 'rgba(124, 58, 237, 0.05)' : 'rgba(15, 23, 42, 0.15)'
                }}
                className="group relative flex flex-col items-center justify-center backdrop-blur-xl border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all duration-300 cursor-pointer min-h-[240px] sm:min-h-[280px] focus:outline-none focus:ring-2 focus:ring-violet-500 border-slate-800/80 hover:shadow-2xl hover:shadow-violet-500/5"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".txt,.pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  tabIndex={-1}
                />
                
                {/* Glowing mesh background orb */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-violet-600/10 blur-3xl pointer-events-none group-hover:bg-violet-600/20 transition-all duration-500" />
                
                <motion.div 
                  animate={{ y: isDragActive ? [0, -8, 0] : [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950/80 border border-slate-800 text-violet-400 shadow-xl group-hover:scale-105 group-hover:border-violet-500/40 group-hover:text-violet-300 transition-all duration-300"
                >
                  <Upload className="h-7 w-7" aria-hidden="true" />
                </motion.div>
                
                <h3 className="mt-4 text-base font-bold text-slate-200 group-hover:text-white">
                  Drag and drop your file here
                </h3>
                <p className="mt-1.5 text-xs text-slate-400 max-w-sm">
                  Select a document to begin. Readora converts it locally into a synchronized audio experience.
                </p>
                
                {/* File Type Badges */}
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full font-bold">
                    PDF
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full font-bold">
                    Plain Text
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2.5 py-1 rounded-full font-bold">
                    Image (OCR)
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Direct Text Paste Input Panel */}
            <div className="backdrop-blur-xl bg-slate-900/15 border border-slate-800/40 rounded-3xl p-5 sm:p-6 flex flex-col justify-between min-h-[240px] sm:min-h-[280px]">
              <div className="space-y-3 text-left">
                <label htmlFor="paste-textarea" className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <Clipboard className="h-4 w-4 text-violet-400" aria-hidden="true" />
                  <span>Quick Paste</span>
                </label>
                <textarea
                  id="paste-textarea"
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Type or paste your document contents here..."
                  aria-label="Paste custom document text here"
                  className="w-full h-[130px] bg-slate-950/40 border border-slate-800/60 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 rounded-2xl p-3 text-xs text-slate-300 placeholder-slate-500 resize-none font-sans outline-none transition-all duration-200"
                />
              </div>
              
              <button
                onClick={handlePasteSubmit}
                disabled={!manualText.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-2.5 text-xs font-semibold shadow-lg shadow-violet-600/15 disabled:opacity-40 disabled:pointer-events-none transition-all duration-300"
                aria-label="Process pasted text"
              >
                <span>Process Text</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        ) : imagePreview && !isLoading ? (
          /* State B: Image Preview Panel State – ready for OCR */
          <motion.div 
            key="image-preview"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
          >
            {/* Visual preview box */}
            <div className="md:col-span-2 backdrop-blur-xl bg-slate-900/15 border border-slate-800/40 rounded-3xl p-4 flex items-center justify-center min-h-[240px] sm:min-h-[280px] relative overflow-hidden group">
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-purple-500/15 text-purple-300 border border-purple-500/25 px-2.5 py-1 rounded-md text-[10px] font-bold z-10">
                <ImageIcon className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Image Preview</span>
              </div>
              <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/5 transition-all duration-300 pointer-events-none" />
              <img 
                src={imagePreview} 
                alt="Preview of uploaded image ready for text extraction" 
                className="max-h-full max-w-full rounded-xl object-contain shadow-2xl border border-slate-800/80 group-hover:scale-[1.02] transition-transform duration-300"
              />
            </div>

            {/* Actions & Details box */}
            <div className="backdrop-blur-xl bg-slate-900/15 border border-slate-800/40 rounded-3xl p-5 sm:p-6 flex flex-col justify-between min-h-[240px] sm:min-h-[280px]">
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Selected File</span>
                  <span className="inline-flex items-center gap-1 text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full font-semibold">
                    OCR Ready
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-200 truncate" aria-label={`Filename: ${fileName}`}>{fileName}</h4>
                <div className="space-y-1.5 text-xs text-slate-400">
                  {fileSize && <p>File Size: <span className="text-slate-300 font-semibold">{fileSize}</span></p>}
                  <p>Format: <span className="text-slate-300 font-semibold">Image File</span></p>
                  <p className="text-[11px] leading-relaxed mt-2 text-slate-400/80">
                    Image uploaded successfully. Click extract to run Tesseract.js OCR directly in your browser.
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={onExtractOCR}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white py-2.5 text-xs font-semibold shadow-lg shadow-violet-600/15 hover:shadow-violet-600/25 transition-all duration-300"
                  aria-label="Extract text from image using OCR"
                >
                  <Sparkles className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
                  <span>Extract Text (OCR)</span>
                </button>

                <button
                  onClick={handleClearClick}
                  className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-slate-950/60 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 py-2.5 text-xs font-semibold text-slate-400 hover:text-red-400 transition-all duration-200"
                  aria-label="Remove uploaded image"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Remove Image</span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : isLoading ? (
          /* State C: Processing / Loading State (PDF or OCR) */
          <motion.div 
            key="loading-state"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4 }}
            className="backdrop-blur-xl bg-slate-900/15 border border-slate-800/40 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center gap-6 min-h-[240px] sm:min-h-[280px] w-full relative overflow-hidden"
            role="status"
            aria-live="polite"
          >
            {/* Background accent glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-violet-600/10 blur-3xl pointer-events-none animate-pulse-glow" />

            <div className="relative flex items-center justify-center">
              <div className="absolute h-20 w-20 rounded-full border-2 border-transparent border-t-violet-500 border-b-violet-500/30 animate-spin" style={{ animationDuration: '1.5s' }} />
              <div className="absolute h-16 w-16 rounded-full border-2 border-transparent border-l-indigo-400 border-r-indigo-400/30 animate-spin" style={{ animationDuration: '1s', animationDirection: 'reverse' }} />
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 border border-slate-800 shadow-md">
                <Loader2 className="h-5 w-5 text-violet-400 animate-spin" aria-hidden="true" />
              </div>
            </div>

            <div className="text-center space-y-1.5 max-w-md z-10">
              <h3 className="text-base font-bold text-white">
                {isPdfLoading ? 'Extracting Text from PDF Pages' : 'Extracting Text with Tesseract.js OCR'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isPdfLoading 
                  ? 'Parsing PDF segments entirely inside your browser. This protects your data privacy.'
                  : 'Processing image structures locally. This may take a few seconds.'}
              </p>
            </div>

            {/* Progress Bar */}
            <div className="w-full max-w-sm space-y-2 z-10">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-slate-500 uppercase tracking-wider">Progress</span>
                <span className="text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-md">{Math.round(ocrProgress)}%</span>
              </div>
              <div className="relative h-3 w-full rounded-full bg-slate-950 border border-slate-800/80 overflow-hidden" aria-valuenow={Math.round(ocrProgress)} aria-valuemin="0" aria-valuemax="100">
                <motion.div 
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${ocrProgress}%` }}
                  transition={{ ease: "easeOut", duration: 0.3 }}
                />
              </div>
            </div>
          </motion.div>
        ) : (
          /* State D: Document Loaded Success State */
          <motion.div 
            key="success-state"
            initial={{ opacity: 0, y: 15, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full backdrop-blur-xl bg-slate-900/15 border border-slate-800/40 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-2xl relative overflow-hidden"
          >
            {/* Success Background Mesh Glow */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-48 h-48 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <motion.div 
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-white shadow-xl ${
                  detectedType === 'PDF' 
                    ? 'bg-gradient-to-tr from-red-600 to-orange-500 shadow-red-950/20 border border-red-500/20' 
                    : detectedType === 'Image (OCR)' 
                      ? 'bg-gradient-to-tr from-purple-600 to-pink-500 shadow-purple-950/20 border border-purple-500/20' 
                      : 'bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-blue-950/20 border border-blue-500/20'
                }`}
              >
                {detectedType === 'PDF' ? (
                  <FileText className="h-7 w-7" aria-hidden="true" />
                ) : detectedType === 'Image (OCR)' ? (
                  <ImageIcon className="h-7 w-7" aria-hidden="true" />
                ) : (
                  <FileCheck className="h-7 w-7" aria-hidden="true" />
                )}
              </motion.div>

              <div className="text-center sm:text-left space-y-1 max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-sm md:max-w-md" title={fileName}>
                    {fileName}
                  </span>
                  
                  {/* Ready Badge with green glow */}
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="flex items-center gap-1 text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold shadow-[0_0_12px_rgba(16,185,129,0.12)]"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
                    <span>Ready</span>
                  </motion.div>
                </div>
                
                <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-slate-400">
                  <span className={`inline-flex items-center font-bold px-2 py-0.5 rounded text-[10px] ${
                    detectedType === 'PDF' 
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                      : detectedType === 'Image (OCR)' 
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}>
                    {detectedType === 'PDF' ? 'PDF Document' : detectedType === 'Image (OCR)' ? 'Image (OCR)' : 'Text Document'}
                  </span>
                  {fileSize && <span>•</span>}
                  {fileSize && <span>Size: <strong className="text-slate-300 font-semibold">{fileSize}</strong></span>}
                </div>
              </div>
            </div>

            {/* Hidden file input for replacing the current file */}
            <input
              ref={replaceFileInputRef}
              type="file"
              className="hidden"
              accept=".txt,.pdf,.jpg,.jpeg,.png"
              onChange={handleReplaceFileChange}
              aria-hidden="true"
              tabIndex={-1}
            />

            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-center">
              <button
                onClick={triggerReplaceInput}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-violet-500/30 text-slate-300 hover:text-white px-4 py-2.5 text-xs font-semibold transition-all duration-205"
                aria-label="Upload a new file to replace the current document"
              >
                <FolderOpen className="h-4 w-4" aria-hidden="true" />
                <span>Upload New</span>
              </button>

              <button
                onClick={handleClearClick}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/20 text-slate-400 hover:text-red-400 px-4 py-2.5 text-xs font-semibold transition-all duration-205"
                aria-label="Delete loaded document and clear progress"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                <span>Remove File</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
});

export default UploadSection;
