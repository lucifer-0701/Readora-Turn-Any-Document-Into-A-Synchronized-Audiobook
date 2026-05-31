import React from 'react';
import { Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="glass-panel border-t border-slate-900 bg-slate-950/40 pt-12 pb-6 mt-16 text-left" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-900">
          {/* Description column */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wider">VoxReader</span>
              <span className="inline-flex items-center rounded-md bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-400 ring-1 ring-inset ring-violet-500/20">
                AI
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-normal">
              A browser‑native, highly private intelligent reading companion designed for final‑year college showcasing. Powered by local Tesseract OCR & PDF parsers, it guarantees offline privacy with zero server‑side latency.
            </p>
          </div>

          {/* Tech stack column */}
          <div className="space-y-3">
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Core Technologies</h4>
            <ul className="text-xs text-slate-400 space-y-2 font-normal" role="list">
              <li>Web Speech API (TTS Synthesis)</li>
              <li>Tesseract.js (Client‑Side OCR)</li>
              <li>PDF.js (Offline Document Parsing)</li>
              <li>React, Vite & Tailwind CSS</li>
            </ul>
          </div>

          {/* Features column */}
          <div className="space-y-3">
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Core Benefits</h4>
            <ul className="text-xs text-slate-400 space-y-2 font-normal" role="list">
              <li>100% Secure Client‑Side Privacy</li>
              <li>Synchronized Word Highlights</li>
              <li>Persisted Progress Restore</li>
              <li>Comprehensive Reading History</li>
            </ul>
          </div>

          {/* Project Metadata */}
          <div className="space-y-3">
            <h4 className="text-[11px] uppercase tracking-wider font-bold text-slate-500">Project Metadata</h4>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-400 ring-1 ring-violet-500/20">
                <Sparkles className="h-3 w-3" />
                <span>College Viva Ready</span>
              </div>
              <p className="text-xs text-slate-400 leading-normal font-normal">
                Private codebase, developed with performance and full browser‑native compatibility.
              </p>
            </div>
          </div>
        </div>
        <p className="text-[11px] text-slate-600 text-center mt-4">
          Final Year Project · AI‑Assisted Intelligent Reading System · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
