import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Square,
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
  onStop,
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
      className="fixed bottom-0 left-0 right-0 z-50"
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
        aria-label="Audiobook playback progress"
      >
        <motion.div
          className="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-cyan-400"
          style={{ boxShadow: '0 0 10px rgba(139, 92, 246, 0.5)' }}
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'easeOut', duration: 0.3 }}
        />
      </div>

      {/* ── Sticky glassmorphic control bar ── */}
      <div className="bg-slate-950/85 backdrop-blur-2xl border-t border-slate-800/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">

          {/* Desktop: single row | Mobile: stack rows */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full">

            {/* ── Left: Voice + Status ── */}
            <div className="flex w-full sm:w-auto justify-between sm:justify-start items-center gap-3 flex-1 min-w-0 border-b sm:border-0 border-slate-800/60 pb-3 sm:pb-0">
              {/* Status indicator */}
              <div className="flex items-center gap-1.5 shrink-0" role="status" aria-live="polite">
                {isPlaying ? (
                  <Volume2 className="h-3.5 w-3.5 text-emerald-400 animate-pulse" aria-hidden="true" />
                ) : (
                  <VolumeX className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
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

              {/* Voice selector */}
              <div className="flex items-center gap-2 min-w-0 flex-1 max-w-[260px]">
                <Languages className="h-4 w-4 text-violet-400 shrink-0" aria-hidden="true" />
                <select
                  disabled={disabled || voices.length === 0}
                  value={selectedVoice ? selectedVoice.name : ''}
                  aria-label="Select AI Reader Voice"
                  onChange={(e) => {
                    const voice = voices.find((v) => v.name === e.target.value);
                    onVoiceChange(voice);
                  }}
                  className="w-full text-[11px] font-medium text-slate-300 bg-slate-900/80 border border-slate-800 rounded-lg px-2 py-1.5 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors disabled:opacity-40 truncate"
                >
                  {voices.length === 0 ? (
                    <option>No voices found</option>
                  ) : (
                    voices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* ── Center: Playback controls ── */}
            <div className="flex items-center justify-center w-full sm:w-auto gap-3 sm:gap-4">
              {/* Previous */}
              <button
                disabled={disabled}
                onClick={onPrev}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none"
                title="Previous Sentence"
                aria-label="Go back five words"
              >
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>

              {/* Central Play / Pause — animated button */}
              <div className="relative">
                {/* Pulsing ring when playing */}
                <AnimatePresence>
                  {isPlaying && (
                    <motion.div
                      initial={{ scale: 1, opacity: 0.5 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                      className="absolute inset-0 rounded-2xl bg-violet-500/20"
                      aria-hidden="true"
                    />
                  )}
                </AnimatePresence>

                <motion.button
                  disabled={disabled}
                  onClick={onPlayPause}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className={`relative flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl text-white shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-30 disabled:pointer-events-none ${
                    isPlaying
                      ? 'bg-gradient-to-tr from-amber-500 to-orange-600 shadow-orange-500/25 ring-1 ring-orange-400/20'
                      : 'bg-gradient-to-tr from-violet-600 to-indigo-600 shadow-violet-500/25 ring-1 ring-violet-400/20'
                  }`}
                  title={isPlaying ? 'Pause' : speechStatus === 'paused' ? 'Resume' : 'Play'}
                  aria-label={isPlaying ? 'Pause audiobook playback' : 'Start audiobook playback'}
                >
                  <AnimatePresence mode="wait">
                    {isPlaying ? (
                      <motion.div
                        key="pause"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Pause className="h-5 w-5 sm:h-6 sm:w-6 fill-white" aria-hidden="true" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="play"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-white ml-0.5" aria-hidden="true" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              </div>

              {/* Stop */}
              <button
                disabled={disabled}
                onClick={onStop}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none"
                title="Stop Playing"
                aria-label="Stop audiobook playback"
              >
                <Square className="h-3.5 w-3.5" aria-hidden="true" />
              </button>

              {/* Next */}
              <button
                disabled={disabled}
                onClick={onNext}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none"
                title="Next Sentence"
                aria-label="Skip forward five words"
              >
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>

              {/* Waveform visualization */}
              <div className="hidden sm:flex items-center gap-[3px] h-5 ml-1" aria-hidden="true">
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

            {/* ── Right: Speed + Progress + Reset ── */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-end w-full sm:w-auto pt-1 sm:pt-0">
              {/* Speed presets */}
              <div className="flex items-center gap-1" role="radiogroup" aria-label="Speech playback speed">
                <Gauge className="h-3.5 w-3.5 text-violet-400 mr-1 hidden sm:block" aria-hidden="true" />
                {SPEED_PRESETS.map((speed) => (
                  <button
                    key={speed}
                    disabled={disabled}
                    onClick={() => onRateChange(speed)}
                    role="radio"
                    aria-checked={rate === speed}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all duration-200 disabled:opacity-30 disabled:pointer-events-none ${
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

              {/* Progress percentage */}
              <span
                className="text-violet-400 font-bold text-xs tabular-nums hidden sm:inline-flex items-center gap-1 bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded-lg"
                aria-label={`Read progress: ${Math.round(progress)}%`}
              >
                {Math.round(progress)}%
              </span>

              {/* Reset progress */}
              {!disabled && (
                <button
                  onClick={onResetProgress}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-500 hover:text-slate-300 border border-slate-800 hover:border-slate-700 transition-all duration-200 focus:outline-none focus:ring-1 focus:ring-violet-500"
                  title="Reset progress"
                  aria-label="Reset saved reading progress"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
          </div>

          {/* ── Mobile-only: Voice selector row ── */}
          <div className="flex sm:hidden items-center gap-2 mt-2 pt-2 border-t border-slate-800/40">
            <div className="flex items-center gap-1.5 shrink-0" role="status" aria-live="polite">
              <span className="relative flex h-2 w-2">
                {currentStatus.ring && (
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${currentStatus.dot} opacity-75`} />
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${currentStatus.dot}`} />
              </span>
              <span className={`text-[9px] font-bold uppercase tracking-wider ${currentStatus.color}`}>
                {currentStatus.label}
              </span>
            </div>

            <select
              disabled={disabled || voices.length === 0}
              value={selectedVoice ? selectedVoice.name : ''}
              aria-label="Select AI Reader Voice"
              onChange={(e) => {
                const voice = voices.find((v) => v.name === e.target.value);
                onVoiceChange(voice);
              }}
              className="flex-1 text-[11px] font-medium text-slate-300 bg-slate-900/80 border border-slate-800 rounded-lg px-2 py-1.5 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none transition-colors disabled:opacity-40 truncate"
            >
              {voices.length === 0 ? (
                <option>No voices</option>
              ) : (
                voices.map((voice) => (
                  <option key={voice.name} value={voice.name}>
                    {voice.name}
                  </option>
                ))
              )}
            </select>

            <span
              className="text-violet-400 font-bold text-[11px] tabular-nums bg-violet-500/10 border border-violet-500/20 px-2 py-1 rounded-lg"
              aria-label={`Read progress: ${Math.round(progress)}%`}
            >
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </div>
    </section>
  );
});

export default AudioControls;
