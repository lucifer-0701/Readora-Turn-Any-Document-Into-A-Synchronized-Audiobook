import React from 'react';
import { motion } from 'framer-motion';
import { 
  Headphones, 
  FileText, 
  Mic2, 
  Zap, 
  Shield, 
  BookOpen, 
  Sparkles,
  ArrowRight,
  Cpu,
  Eye,
  Clock,
  Globe,
  ChevronRight,
  Play,
  RotateCcw,
  Languages
} from 'lucide-react';

const FEATURES = [
  {
    icon: FileText,
    title: 'Multi-Format File Support',
    description: 'Directly upload PDF documents, plain text files, or standard images with full drag-and-drop simplicity.',
    color: 'from-violet-500 to-indigo-500',
    glow: 'rgba(139, 92, 246, 0.15)'
  },
  {
    icon: Cpu,
    title: 'Local Tesseract.js OCR',
    description: 'Extract raw text structures from images and photos using client-side optical character recognition models.',
    color: 'from-cyan-500 to-blue-500',
    glow: 'rgba(6, 182, 212, 0.15)'
  },
  {
    icon: Mic2,
    title: 'Neural Speech Synthesis',
    description: 'Convert document segments into natural-sounding speech dynamically using local Web Speech API synthesis.',
    color: 'from-emerald-500 to-teal-500',
    glow: 'rgba(16, 185, 129, 0.15)'
  },
  {
    icon: Eye,
    title: 'Synchronized Word Tracker',
    description: 'Highlights every single word in real-time as it is spoken aloud, preserving focus and comprehension.',
    color: 'from-amber-500 to-orange-500',
    glow: 'rgba(245, 158, 11, 0.15)'
  },
  {
    icon: Clock,
    title: 'Auto-Saved Reading State',
    description: 'Automatically preserves reading progress, voice selections, and rate speeds across browser reloads.',
    color: 'from-pink-500 to-rose-500',
    glow: 'rgba(236, 72, 153, 0.15)'
  },
  {
    icon: Shield,
    title: '100% Client-Side Privacy',
    description: 'Runs entirely in your local sandbox. No data, files, or documents are ever uploaded to a server.',
    color: 'from-slate-400 to-slate-500',
    glow: 'rgba(148, 163, 184, 0.15)'
  }
];

const METRICS = [
  { value: '100%', label: 'Local Processing' },
  { value: '0ms', label: 'Server Latency' },
  { value: 'Zero', label: 'Data Uploaded' },
  { value: 'Free', label: 'Open-Access Tools' }
];

// Framer motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
  }
};

const pulseGlow = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export default function WelcomeScreen({ onGetStarted }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-violet-500/30 overflow-x-hidden relative">

      {/* ══════════════ Background Aesthetic Elements ══════════════ */}
      {/* Drifting glowing radial background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{
            y: [0, -35, 0],
            x: [0, 20, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[130px]" 
        />
        <motion.div 
          animate={{
            y: [0, 45, 0],
            x: [0, -25, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 -right-32 w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[110px]" 
        />
        <motion.div 
          animate={{
            y: [0, -25, 0],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-40 left-1/3 w-[550px] h-[550px] rounded-full bg-cyan-600/8 blur-[120px]" 
        />
      </div>

      {/* Futuristic Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Gradient Ambient Line Overlay */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/30 to-transparent z-10" />

      {/* ══════════════ Navigation Header ══════════════ */}
      <nav className="relative z-20 w-full border-b border-slate-900/80 bg-slate-950/60 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20 ring-1 ring-violet-400/20">
                <Headphones className="h-5 w-5" />
              </div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5 m-0 leading-none">
                Readora
                <span className="inline-flex items-center rounded-md bg-violet-500/10 px-1.5 py-0.5 text-[10px] font-bold text-violet-400 ring-1 ring-inset ring-violet-500/20">
                  AI
                </span>
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-semibold text-slate-400 ring-1 ring-slate-800">
                <Globe className="h-3 w-3 text-emerald-400" />
                <span>Local Sandbox</span>
              </span>
              <motion.button 
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onGetStarted}
                className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-600/20 transition-all cursor-pointer"
              >
                <span>Launch App</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* ══════════════ Main Hero Area ══════════════ */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 py-14 sm:py-24">
        <div className="w-full max-w-6xl mx-auto text-center space-y-20">

          {/* Hero text section */}
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Glowing tag badge */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full bg-violet-500/10 border border-violet-500/20 px-4 py-1.5 text-xs font-bold text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.1)] mx-auto"
            >
              <Sparkles className="h-3.5 w-3.5 text-violet-400 animate-pulse" />
              <span>Next-Gen Document Intelligence Hub</span>
            </motion.div>

            <motion.h2 
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1]"
            >
              Turn any document into a
              <br />
              <span className="bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                synchronized audiobook.
              </span>
            </motion.h2>

            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 leading-relaxed font-normal"
            >
              Upload images, scan PDFs, or paste raw text. Readora extracts the elements with local OCR, then reads them aloud with real-time word highlighting. Completely offline.
            </motion.p>

            {/* Hero CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={onGetStarted}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 px-8 py-4 font-bold text-white shadow-xl shadow-violet-600/25 ring-1 ring-violet-400/20 transition-all group cursor-pointer"
              >
                <span>Get Started Free</span>
                <ChevronRight className="h-4.5 w-4.5 transition-transform duration-200 group-hover:translate-x-1" />
              </motion.button>

              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-900/40 border border-slate-800/60 rounded-xl px-4 py-2">
                <Zap className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
                <span>No registration required · Sandbox execution</span>
              </div>
            </motion.div>
          </div>

          {/* Interactive Simulated Reader Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-4xl mx-auto rounded-3xl border border-slate-800/80 bg-slate-950/60 p-4 sm:p-6 shadow-3xl overflow-hidden group"
          >
            {/* Visual glow element behind the mockup */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-2/3 h-24 bg-gradient-to-r from-violet-600/10 to-indigo-600/10 blur-2xl rounded-full" />
            
            {/* Mockup toolbar */}
            <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-4 select-none">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/40" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/40" />
                <span className="w-3 h-3 rounded-full bg-green-500/40" />
                <span className="text-[10px] text-slate-600 font-bold ml-2 font-mono uppercase tracking-wider">Demo_Interface.jsx</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Reader Demo
                </span>
              </div>
            </div>

            {/* Mockup content area simulating active reading */}
            <div className="text-left space-y-6 px-2 py-4">
              <div className="space-y-3 leading-[1.8] text-sm sm:text-base font-light text-slate-400">
                <span className="text-slate-500">Readora converts document elements locally.</span>{' '}
                <span className="bg-gradient-to-r from-violet-500/15 to-indigo-500/15 border-l-2 border-violet-500 pl-2 rounded-r py-1 text-slate-300">
                  Try clicking words in the reader board to{' '}
                  <span className="bg-gradient-to-r from-violet-500 to-indigo-500 text-white font-semibold px-1 rounded shadow-lg shadow-violet-500/30 ring-1 ring-violet-400/20 scale-105 inline-block">
                    jump
                  </span>{' '}
                  straight to any point in speech playback.
                </span>{' '}
                <span className="text-slate-400">Everything runs natively inside the client environment, maintaining strict data privacy standards.</span>
              </div>

              {/* Simulated mini sticky audiobar controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 border border-slate-900 bg-slate-950/80 rounded-2xl p-3 shadow-inner select-none">
                <div className="flex items-center gap-2">
                  <Languages className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-[10px] text-slate-500 font-semibold">AI Neural Voice (English)</span>
                </div>
                <div className="flex items-center gap-2 mx-auto sm:mx-0">
                  <span className="p-1 rounded-lg bg-slate-900 text-slate-400 text-[10px] font-bold">Prev</span>
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md">
                    <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
                  </div>
                  <span className="p-1 rounded-lg bg-slate-900 text-slate-400 text-[10px] font-bold">Next</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-violet-400 font-bold bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">1.25x</span>
                  <span className="text-[10px] text-slate-500 font-medium">Page 1 / 4</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Metrics / Highlights Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto select-none pt-4">
            {METRICS.map((metric, i) => (
              <div key={i} className="glass-panel rounded-2xl p-4 border-slate-900 bg-slate-900/10 text-center space-y-1">
                <div className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                  {metric.value}
                </div>
                <div className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-500">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>

          {/* Features Grid Section */}
          <div className="space-y-12 pt-8">
            <div className="space-y-3">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Engineered for Privacy & Efficiency</h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
                By combining client-side execution frameworks with the Web Speech API, Readora loads documents locally without servers.
              </p>
            </div>

            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left"
            >
              {FEATURES.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="group relative glass-panel rounded-3xl p-6 border-slate-900 hover:border-violet-500/30 transition-all duration-300 hover:shadow-2xl overflow-hidden cursor-default"
                  >
                    {/* Glowing highlight orb on card hover */}
                    <div 
                      className="absolute top-0 right-0 -mt-8 -mr-8 h-24 w-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none"
                      style={{ backgroundColor: feature.glow }}
                    />

                    <div className="space-y-4">
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr ${feature.color} text-white shadow-lg`}>
                        <Icon className="h-5.5 w-5.5" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                        {feature.title}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Tech Stack Pills Section */}
          <div className="space-y-4 pt-6">
            <span className="text-[10px] uppercase tracking-[0.2em] font-extrabold text-slate-600 block">System Components</span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {['React 19', 'Vite', 'Tailwind CSS', 'Tesseract.js OCR', 'PDF.js Core', 'HTML5 Speech Synthesis'].map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3.5 py-1.5 text-xs font-bold text-slate-400 ring-1 ring-slate-800 hover:ring-slate-700 hover:text-slate-300 transition-colors cursor-default"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* ══════════════ Professional Footer ══════════════ */}
      <footer className="relative z-20 border-t border-slate-900/80 bg-slate-950/80 py-10 mt-12 select-none">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-slate-900">
            {/* Branding Column */}
            <div className="text-left space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-md">
                  <Headphones className="h-4 w-4" />
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
              <ul className="text-xs text-slate-500 space-y-2">
                <li>• Optical Character Recognition (OCR)</li>
                <li>• Interactive Reading Guide highlights</li>
                <li>• Local Web Speech synthesis models</li>
                <li>• Cross-device JSON Library storage</li>
              </ul>
            </div>

            {/* Technical Highlights Column */}
            <div className="text-left space-y-2.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Architecture</h5>
              <ul className="text-xs text-slate-500 space-y-2">
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
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-[11px] text-slate-600">
            <p>
              Academic Research Project · AI-Assisted Intelligent Reading System · {new Date().getFullYear()}
            </p>
            <div className="flex items-center gap-4">
              <span>Client Sandbox</span>
              <span>•</span>
              <span>Readora v2.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
