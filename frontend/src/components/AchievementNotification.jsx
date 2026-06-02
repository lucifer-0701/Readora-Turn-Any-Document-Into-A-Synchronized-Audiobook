import React, { useEffect } from 'react';
import { Trophy, CheckCircle2 } from 'lucide-react';

export default function AchievementNotification({ achievement, onClose }) {
  useEffect(() => {
    if (!achievement) return;
    const timer = setTimeout(() => {
      onClose();
    }, 5500);
    return () => clearTimeout(timer);
  }, [achievement, onClose]);

  if (!achievement) return null;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm pointer-events-none animate-slide-in-up">
      <div
        className="pointer-events-auto rounded-2xl border border-amber-500/30 bg-slate-900/90 backdrop-blur-md p-4 flex gap-4 shadow-2xl shadow-amber-500/10 overflow-hidden relative"
      >
        {/* Glowing background highlights */}
        <div className="absolute -top-10 -left-10 h-24 w-24 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 h-24 w-24 rounded-full bg-violet-500/10 blur-2xl pointer-events-none" />

        {/* Confetti Particles using lightweight high-performance CSS animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => {
            const left = (i * 12.5) + (Math.random() * 5);
            const delay = i * 0.15;
            const size = 4 + Math.random() * 4;
            const colors = ['bg-amber-500', 'bg-violet-500', 'bg-emerald-500', 'bg-blue-500', 'bg-pink-500'];
            const bg = colors[i % colors.length];
            
            return (
              <div
                key={i}
                className={`absolute rounded-sm animate-bounce ${bg}`}
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  left: `${left}%`,
                  top: '-10px',
                  animationDelay: `${delay}s`,
                  animationDuration: `${1.8 + Math.random()}s`,
                  opacity: 0.7
                }}
              />
            );
          })}
        </div>

        {/* Left Trophy Container */}
        <div className="relative shrink-0 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/25 to-yellow-500/10 border border-amber-500/30 text-amber-400">
          <Trophy className="h-6 w-6 animate-bounce" />
          <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white ring-2 ring-slate-900">
            <CheckCircle2 className="h-3 w-3" />
          </span>
        </div>

        {/* Texts */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">
            Achievement Unlocked!
          </p>
          <h3 className="text-xs font-bold text-slate-100 mt-0.5 truncate">
            {achievement.title}
          </h3>
          <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
            {achievement.description}
          </p>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="shrink-0 self-start p-0.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          aria-label="Dismiss unlock notification"
        >
          <XCloseIcon className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// Inline mini X icon helper to prevent missing imports
const XCloseIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2.5}
    stroke="currentColor"
    className={className}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
