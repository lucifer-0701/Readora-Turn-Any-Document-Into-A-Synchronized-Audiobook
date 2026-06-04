import React from 'react';
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Languages,
  Volume2,
  VolumeX,
  RotateCcw,
} from 'lucide-react';

const SPEED_PRESETS = [1, 1.25, 1.5, 1.75, 2];

const AudioControls = React.memo(function AudioControls({
  isPlaying,
  speechStatus = 'idle',
  onPlayPause,
  onStop, // Retained for prop-signature compatibility
  rate,
  onRateChange,
  voices = [],
  selectedVoice,
  onVoiceChange,
  progress = 0,
  onPrev,
  onNext,
  disabled = false,
  onResetProgress,
}) {
  // Status config
  const statusConfig = {
    idle:    { label: 'Ready',   color: 'text-slate-400', dot: 'bg-slate-600',    ring: false },
    playing: { label: 'Playing', color: 'text-emerald-400', dot: 'bg-emerald-500', ring: true },
    paused:  { label: 'Paused',  color: 'text-amber-400', dot: 'bg-amber-500',    ring: false },
    stopped: { label: 'Stopped', color: 'text-red-400',   dot: 'bg-red-500',      ring: false },
  };
  const currentStatus = statusConfig[speechStatus] || statusConfig.idle;

  return (
    <section
      className="fixed bottom-0 left-0 right-0 z-50 animate-fade-in"
      style={{ animationDuration: '0.4s' }}
      aria-labelledby="audio-controls-title"
    >
      <h2 id="audio-controls-title" className="sr-only">
        Speech Playback Controls
      </h2>

      {/* ── Full-width progress bar at the very top ── */}
      <div
        className="h-[3px] w-full bg-slate-900/80"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-label="Reading playback progress"
      >
        <div
          className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400 transition-all duration-300 ease-out"
          style={{ 
            width: `${progress}%`,
            boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)' 
          }}
        />
      </div>

      {/* ── Sticky glassmorphic control bar ── */}
      <div className="bg-slate-950/90 backdrop-blur-2xl border-t border-slate-900/60 shadow-2xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
          {/* Main flex container: stacked on mobile, inline on desktop */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full justify-between">
            
            {/* 1. LEFT COLUMN: Voice Select & Status Indicator */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start min-w-0 md:max-w-xs flex-1">
              {/* Status Badge */}
              <div 
                className="flex items-center gap-1.5 shrink-0 bg-slate-900/80 border border-slate-800/80 rounded-xl px-3 py-1.5 shadow-sm" 
                role="status" 
                aria-live="polite"
              >
                {isPlaying ? (
                  <Volume2 className="h-4 w-4 text-emerald-400 animate-pulse" aria-hidden="true" />
                ) : (
                  <VolumeX className="h-4 w-4 text-slate-500" aria-hidden="true" />
                )}
                <span className="relative flex h-2 w-2">
                  {currentStatus.ring && (
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${currentStatus.dot} opacity-75`} />
                  )}
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${currentStatus.dot}`} />
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStatus.color}`}>
                  {currentStatus.label}
                </span>
              </div>

              {/* Voice Dropdown */}
              <div className="flex items-center gap-2 min-w-0 flex-1 max-w-[200px] md:max-w-[185px]">
                <Languages className="h-4 w-4 text-violet-400 shrink-0" aria-hidden="true" />
                <select
                  disabled={disabled || voices.length === 0}
                  value={selectedVoice ? selectedVoice.name : ''}
                  aria-label="Select AI Reader Voice"
                  onChange={(e) => {
                    const voice = voices.find((v) => v.name === e.target.value);
                    onVoiceChange(voice);
                  }}
                  className="w-full text-xs font-semibold text-slate-300 bg-slate-900/80 border border-slate-800 rounded-xl px-2.5 py-1.5 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors disabled:opacity-40 truncate"
                >
                  {voices.length === 0 ? (
                    <option>No voices found</option>
                  ) : (
                    voices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* 2. CENTER COLUMN: Playback Navigation (Prev, Play/Pause, Next) */}
            <div className="flex items-center justify-center gap-5 sm:gap-6 w-full md:w-auto py-1">
              {/* Prev Button */}
              <button
                disabled={disabled}
                onClick={onPrev}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none active:scale-90 shadow-md"
                title="Previous Sentence"
                aria-label="Go back five words"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </button>

              {/* Play / Pause Toggle Button */}
              <div className="relative">
                {isPlaying && (
                  <div
                    className="absolute -inset-1 rounded-2xl bg-violet-500/20 blur-sm animate-pulse pointer-events-none"
                    aria-hidden="true"
                  />
                )}
                <button
                  disabled={disabled}
                  onClick={onPlayPause}
                  className={`relative flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-xl focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 active:scale-95 hover:scale-105 ${
                    isPlaying
                      ? 'bg-gradient-to-tr from-amber-500 to-orange-600 shadow-orange-500/20 ring-1 ring-orange-400/20'
                      : 'bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-violet-500/20 ring-1 ring-violet-400/20'
                  }`}
                  title={isPlaying ? 'Pause' : speechStatus === 'paused' ? 'Resume' : 'Play'}
                  aria-label={isPlaying ? 'Pause reading playback' : 'Start reading playback'}
                >
                  {isPlaying ? (
                    <Pause className="h-6 w-6 fill-white" aria-hidden="true" />
                  ) : (
                    <Play className="h-6 w-6 fill-white ml-0.5" aria-hidden="true" />
                  )}
                </button>
              </div>

              {/* Next Button */}
              <button
                disabled={disabled}
                onClick={onNext}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none active:scale-90 shadow-md"
                title="Next Sentence"
                aria-label="Skip forward five words"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </button>

              {/* Waveform Visualization (Desktop only) */}
              <div className="hidden lg:flex items-center gap-[3px] h-5 ml-2" aria-hidden="true">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`w-[3px] rounded-full transition-all duration-200 ${
                      isPlaying ? 'bg-violet-400' : 'bg-slate-700'
                    }`}
                    style={{
                      height: isPlaying ? '16px' : '4px',
                      animation: isPlaying
                        ? `waveform 0.6s ${i * 0.1}s ease-in-out infinite alternate`
                        : 'none',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 3. RIGHT COLUMN: Speed Control, Progress Badge & Reset */}
            <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto border-t md:border-0 border-slate-900/60 pt-3 md:pt-0">
              {/* Speed Preset Radio Group */}
              <div className="flex items-center gap-1.5 flex-1 md:flex-initial" role="radiogroup" aria-label="Speech playback speed">
                <Gauge className="h-4 w-4 text-violet-400 shrink-0 hidden lg:block" aria-hidden="true" />
                <div className="flex items-center gap-1 w-full justify-between md:justify-start">
                  {SPEED_PRESETS.map((speed) => (
                    <button
                      key={speed}
                      disabled={disabled}
                      onClick={() => onRateChange(speed)}
                      role="radio"
                      aria-checked={rate === speed}
                      className={`flex-1 md:flex-initial px-2.5 py-1.5 rounded-lg text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none active:scale-95 hover:scale-105 text-center ${
                        rate === speed
                          ? 'bg-violet-600 text-white shadow-md shadow-violet-500/20 ring-1 ring-violet-400/30 scale-105'
                          : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
                      }`}
                      title={`Set speed to ${speed}x`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress & Reset Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className="text-violet-400 font-bold text-xs tabular-nums inline-flex items-center gap-1 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1.5 rounded-xl"
                  aria-label={`Read progress: ${Math.round(progress)}%`}
                >
                  {Math.round(progress)}%
                </span>

                {!disabled && (
                  <button
                    onClick={onResetProgress}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-500 hover:text-slate-300 border border-slate-800 hover:border-slate-700 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-violet-500 active:scale-90 shadow-sm"
                    title="Reset progress"
                    aria-label="Reset saved reading progress"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
});

export default AudioControls;
