import React from 'react';
import Logo from './Logo';

const Footer = React.memo(function Footer() {
  return (
    <footer className="relative z-20 border-t border-slate-900/80 bg-slate-950/80 py-10 mt-12 select-none" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-900">
          {/* Branding Column */}
          <div className="text-left space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md">
                <Logo className="h-4 w-4" />
              </div>
              <span className="text-base font-bold text-white tracking-tight">Readora</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
              Private, serverless document text-to-speech converter using client-side OCR model architectures.
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="text-left space-y-2.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Features</h5>
            <ul className="text-xs text-slate-500 space-y-2 font-normal" role="list">
              <li>• Optical Character Recognition (OCR)</li>
              <li>• Interactive Reading Guide highlights</li>
              <li>• Local Web Speech synthesis models</li>
              <li>• Cross-device JSON Library storage</li>
            </ul>
          </div>

          {/* Technical Highlights Column */}
          <div className="text-left space-y-2.5">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Architecture</h5>
            <ul className="text-xs text-slate-500 space-y-2 font-normal" role="list">
              <li className="flex items-center gap-1.5 text-emerald-500">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                No external analytics tracked
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                Local sandbox execution
              </li>
              <li className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
                Encrypted localStorage cache
              </li>
            </ul>
          </div>
        </div>

        {/* Subfooter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-[11px] text-slate-600 text-center sm:text-left">
          <div className="space-y-1">
            <p className="m-0">
              Academic Research Project – Readora 2026
            </p>
            <p className="m-0 text-slate-500 font-medium">
              Created by Abdul Hussain
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span>Client Sandbox</span>
            <span>•</span>
            <span>Readora v2.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;

