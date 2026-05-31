import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import {
  X,
  Clock,
  FileText,
  BookOpen,
  Gauge,
  Mic2,
  Flame,
  TrendingUp,
  CalendarDays,
  RotateCcw,
  Activity,
  Layers,
  BarChart3,
  Trophy,
  Target,
  Lock,
  CheckCircle2,
  Pencil,
  Check,
  FolderPlus,
  Zap,
  Bookmark
} from 'lucide-react';
import { ACHIEVEMENTS_LIST } from '../hooks/useGoalsAchievements';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds <= 0) return '0m';
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short', day: 'numeric',
    });
  } catch { return ''; }
}

function fmtTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return ''; }
}

function dayLabel(dateStr) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString(undefined, {
      weekday: 'short',
    });
  } catch { return dateStr; }
}

// ─── Icon Map for Achievements ────────────────────────────────────────────────
const AchievementIcon = ({ name, className }) => {
  const icons = {
    BookOpen: BookOpen,
    Clock: Clock,
    FolderPlus: FolderPlus,
    Bookmark: Bookmark,
    Flame: Flame,
    Zap: Zap,
  };
  const IconComponent = icons[name] || Trophy;
  return <IconComponent className={className} />;
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = 'violet', delay = 0 }) {
  const colorMap = {
    violet: 'from-violet-500/15 to-violet-600/5 border-violet-500/20 text-violet-400',
    amber:  'from-amber-500/15 to-amber-600/5 border-amber-500/20 text-amber-400',
    emerald:'from-emerald-500/15 to-emerald-600/5 border-emerald-500/20 text-emerald-400',
    sky:    'from-sky-500/15 to-sky-600/5 border-sky-500/20 text-sky-400',
    rose:   'from-rose-500/15 to-rose-600/5 border-rose-500/20 text-rose-400',
    indigo: 'from-indigo-500/15 to-indigo-600/5 border-indigo-500/20 text-indigo-400',
  };
  const cls = colorMap[color] || colorMap.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.06, duration: 0.3 }}
      className={`rounded-2xl border bg-gradient-to-br ${cls} p-4 sm:p-5 flex flex-col gap-2`}
    >
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/60">
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">{value}</p>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </motion.div>
  );
}

// ─── Custom Recharts Tooltip ──────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-2 shadow-xl text-xs">
      <p className="font-bold text-slate-200 mb-0.5">{label}</p>
      <p className="text-violet-400 font-semibold">{fmtDuration(payload[0].value)}</p>
    </div>
  );
}

const AnalyticsDashboard = React.memo(function AnalyticsDashboard({
  isOpen,
  onClose,
  analytics,
  onReset,
  goalsProgress,
  unlockedIds = [],
  onUpdateGoal,
  onResetAchievements
}) {
  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'goals'
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null); // 'daily' | 'weekly' | 'monthly' | null
  const [goalInputVal, setGoalInputVal] = useState('');

  // Build 7-day chart data
  const chartData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: key,
        label: dayLabel(key),
        seconds: analytics?.weeklyActivity?.[key] || 0,
      });
    }
    return days;
  }, [analytics]);

  const totalWeekSeconds = chartData.reduce((s, d) => s + d.seconds, 0);
  const activeDaysThisWeek = chartData.filter(d => d.seconds > 0).length;

  // Recent sessions (last 8)
  const recentSessions = (analytics?.sessions || []).slice(0, 8);

  const handleStartEditGoal = (type, currentVal) => {
    setEditingGoal(type);
    setGoalInputVal(String(currentVal));
  };

  const handleSaveGoal = (type) => {
    const parsed = parseInt(goalInputVal, 10);
    if (!isNaN(parsed) && parsed > 0) {
      onUpdateGoal(type, parsed);
    }
    setEditingGoal(null);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="analytics-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.aside
            key="analytics-panel"
            initial={{ x: '100%', opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className="fixed top-0 right-0 h-full z-[90] w-full sm:w-[480px] flex flex-col bg-slate-950 border-l border-slate-800 shadow-2xl shadow-black/60"
            role="dialog"
            aria-modal="true"
            aria-label="Reading Analytics Dashboard"
          >
            {/* Header */}
            <div className="shrink-0 flex flex-col border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-indigo-500/10 border border-violet-500/20">
                    <BarChart3 className="h-4 w-4 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-100">Reading Dashboard</h2>
                    <p className="text-[10px] text-slate-500">Your statistics & achievements</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors focus:outline-none"
                    aria-label="Reset all statistics"
                    title="Reset all stats and goals"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-1 focus:ring-violet-500"
                    aria-label="Close analytics panel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Tab Toggles */}
              <div className="flex px-4 border-t border-slate-900 bg-slate-950/40">
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 text-center flex items-center justify-center gap-1.5 ${
                    activeTab === 'stats' 
                      ? 'border-violet-500 text-violet-400' 
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span>Stats & History</span>
                </button>
                <button
                  onClick={() => setActiveTab('goals')}
                  className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 text-center flex items-center justify-center gap-1.5 ${
                    activeTab === 'goals' 
                      ? 'border-violet-500 text-violet-400' 
                      : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Trophy className="h-3.5 w-3.5" />
                  <span>Goals & Badges</span>
                  {unlockedIds.length > 0 && (
                    <span className="bg-violet-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      {unlockedIds.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-5">
              
              <AnimatePresence mode="wait">
                {activeTab === 'stats' ? (
                  /* TAB 1: STATISTICS */
                  <motion.div
                    key="tab-stats"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-6"
                  >
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      <StatCard
                        icon={Clock}
                        label="Reading Time"
                        value={fmtDuration(analytics?.totalReadingSeconds || 0)}
                        sub={`${Math.round((analytics?.totalReadingSeconds || 0) / 60)} total minutes`}
                        color="violet"
                        delay={0}
                      />
                      <StatCard
                        icon={BookOpen}
                        label="Pages Read"
                        value={analytics?.totalPagesRead || 0}
                        sub="Unique pages visited"
                        color="emerald"
                        delay={1}
                      />
                      <StatCard
                        icon={FileText}
                        label="Files Processed"
                        value={analytics?.totalFilesProcessed || 0}
                        sub="Documents uploaded"
                        color="sky"
                        delay={2}
                      />
                      <StatCard
                        icon={Gauge}
                        label="Avg Speed"
                        value={`${analytics?.avgSpeed || 1}x`}
                        sub="Average speech rate"
                        color="amber"
                        delay={3}
                      />
                      <StatCard
                        icon={Layers}
                        label="Sessions"
                        value={analytics?.totalSessions || 0}
                        sub="Total app sessions"
                        color="indigo"
                        delay={4}
                      />
                      <StatCard
                        icon={Mic2}
                        label="Top Voice"
                        value={
                          (analytics?.mostUsedVoice || 'None').length > 14
                            ? (analytics?.mostUsedVoice || 'None').slice(0, 14) + '…'
                            : analytics?.mostUsedVoice || 'None'
                        }
                        sub="Most used voice"
                        color="rose"
                        delay={5}
                      />
                    </div>

                    {/* Streak indicator */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      <div className="flex-1 rounded-2xl border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-amber-600/5 p-3 sm:p-4 flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-500/15">
                          <Flame className="h-5 w-5 text-orange-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xl sm:text-2xl font-extrabold text-slate-100">
                            {analytics?.streak?.current || 0}
                          </p>
                          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Day streak</p>
                        </div>
                      </div>

                      <div className="flex-1 rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/10 to-indigo-600/5 p-3 sm:p-4 flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-500/15">
                          <TrendingUp className="h-5 w-5 text-violet-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xl sm:text-2xl font-extrabold text-slate-100">
                            {activeDaysThisWeek}/7
                          </p>
                          <p className="text-[10px] sm:text-[11px] text-slate-500 font-medium truncate">Active this week</p>
                        </div>
                      </div>
                    </div>

                    {/* Recharts chart */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Activity className="h-4 w-4 text-violet-400" />
                          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                            Weekly Activity
                          </h3>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {fmtDuration(totalWeekSeconds)} this week
                        </span>
                      </div>

                      {totalWeekSeconds > 0 ? (
                        <ResponsiveContainer width="100%" height={160}>
                          <BarChart data={chartData} barCategoryGap="20%">
                            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                            <XAxis
                              dataKey="label"
                              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                              axisLine={false}
                              tickLine={false}
                            />
                            <YAxis
                              tick={{ fill: '#475569', fontSize: 10 }}
                              axisLine={false}
                              tickLine={false}
                              tickFormatter={(v) => (v >= 60 ? `${Math.round(v / 60)}m` : `${v}s`)}
                              width={35}
                            />
                            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.08)' }} />
                            <Bar
                              dataKey="seconds"
                              radius={[6, 6, 0, 0]}
                              fill="url(#barGradient)"
                              maxBarSize={32}
                            />
                            <defs>
                              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.9} />
                                <stop offset="100%" stopColor="#6366f1" stopOpacity={0.5} />
                              </linearGradient>
                            </defs>
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
                          <Activity className="h-8 w-8 text-slate-700" />
                          <p className="text-xs text-slate-500">No activity this week yet.</p>
                          <p className="text-[10px] text-slate-600">Start reading to see your chart!</p>
                        </div>
                      )}
                    </div>

                    {/* Session History */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <CalendarDays className="h-4 w-4 text-violet-400" />
                        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                          Recent Sessions
                        </h3>
                        {recentSessions.length > 0 && (
                          <span className="ml-auto text-[10px] text-slate-600 font-medium">
                            Last {recentSessions.length}
                          </span>
                        )}
                      </div>

                      {recentSessions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                          <CalendarDays className="h-6 w-6 text-slate-700" />
                          <p className="text-xs text-slate-500">No sessions recorded yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {recentSessions.map((sess, i) => (
                            <div
                              key={sess.id || i}
                              className="flex items-center gap-3 rounded-xl bg-slate-800/40 border border-slate-800/60 px-3.5 py-2.5 transition-colors hover:bg-slate-800/60"
                            >
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/60 text-violet-400 text-[10px] font-bold shrink-0">
                                #{i + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-300 truncate">
                                  {sess.fileName || 'Unknown'}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {fmtDate(sess.startedAt)} · {fmtTime(sess.startedAt)}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs font-bold text-slate-200">
                                  {fmtDuration(sess.durationSeconds || 0)}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {sess.pagesRead || 0} pg{sess.pagesRead !== 1 ? 's' : ''}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  /* TAB 2: GOALS & ACHIEVEMENTS */
                  <motion.div
                    key="tab-goals"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-6"
                  >
                    {/* Goals progress */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-4">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-violet-400" />
                        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                          Reading Targets
                        </h3>
                      </div>

                      {goalsProgress && ['daily', 'weekly', 'monthly'].map((type) => {
                        const progress = goalsProgress[type];
                        const isEditing = editingGoal === type;

                        return (
                          <div key={type} className="space-y-1.5 p-3 rounded-xl bg-slate-900/50 border border-slate-900">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-slate-400 capitalize">{type} Target</span>
                              
                              <div className="flex items-center gap-1.5">
                                {isEditing ? (
                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      value={goalInputVal}
                                      onChange={(e) => setGoalInputVal(e.target.value)}
                                      className="w-14 bg-slate-950 border border-slate-800 rounded px-1 py-0.5 text-center text-xs text-violet-400 focus:outline-none"
                                      min="1"
                                      autoFocus
                                    />
                                    <span className="text-[10px] text-slate-500">mins</span>
                                    <button
                                      onClick={() => handleSaveGoal(type)}
                                      className="p-1 rounded bg-violet-600 text-slate-950 hover:bg-violet-500"
                                    >
                                      <Check className="h-3 w-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <span className="text-xs font-bold text-slate-200">
                                      {progress.current} / {progress.target} mins
                                    </span>
                                    <button
                                      onClick={() => handleStartEditGoal(type, progress.target)}
                                      className="p-1 text-slate-500 hover:text-slate-300 rounded hover:bg-slate-800 transition-colors"
                                      title="Edit target"
                                    >
                                      <Pencil className="h-3 w-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden relative border border-slate-900">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  progress.percentage >= 100 
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                                    : 'bg-gradient-to-r from-violet-500 to-indigo-500'
                                }`}
                                style={{ width: `${progress.percentage}%` }}
                              />
                            </div>
                            
                            <div className="flex justify-between text-[9px] text-slate-500">
                              <span>Progress: {progress.percentage}%</span>
                              {progress.percentage >= 100 && (
                                <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                                  <CheckCircle2 className="h-2.5 w-2.5" /> Goal Achieved!
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Achievements grid */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-violet-400" />
                          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                            Achievement Badges
                          </h3>
                        </div>
                        <span className="text-[10px] font-bold bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20 text-violet-400">
                          {unlockedIds.length} / {ACHIEVEMENTS_LIST.length} Unlocked
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {ACHIEVEMENTS_LIST.map((ach) => {
                          const isUnlocked = unlockedIds.includes(ach.id);

                          return (
                            <div
                              key={ach.id}
                              className={`rounded-xl border p-3.5 flex gap-3.5 transition-all duration-300 relative overflow-hidden ${
                                isUnlocked
                                  ? `bg-gradient-to-br ${ach.color}`
                                  : 'bg-slate-900/10 border-slate-900 text-slate-500 grayscale opacity-50'
                              }`}
                            >
                              {/* Left Icon Badge container */}
                              <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center border shadow-inner ${
                                isUnlocked 
                                  ? 'bg-slate-950/80 border-slate-800' 
                                  : 'bg-slate-950 border-slate-950'
                              }`}>
                                <AchievementIcon name={ach.icon} className="h-5 w-5" />
                              </div>

                              {/* Text details */}
                              <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                  <h4 className={`text-xs font-bold ${isUnlocked ? 'text-slate-100' : 'text-slate-400'}`}>
                                    {ach.title}
                                  </h4>
                                  <p className="text-[10px] text-slate-500 leading-relaxed mt-0.5">
                                    {ach.description}
                                  </p>
                                </div>
                                <span className={`text-[8px] font-bold uppercase tracking-wider mt-2.5 ${
                                  isUnlocked ? 'text-violet-400' : 'text-slate-600'
                                }`}>
                                  Req: {ach.requirement}
                                </span>
                              </div>

                              {/* Right status icon */}
                              <div className="shrink-0 self-center">
                                {isUnlocked ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                                ) : (
                                  <Lock className="h-4 w-4 text-slate-700" />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* Reset confirmation */}
            <AnimatePresence>
              {showResetConfirm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute bottom-0 left-0 right-0 bg-slate-900 border-t border-red-500/30 p-5 z-[100]"
                >
                  <p className="text-sm font-semibold text-slate-200 mb-1">Reset stats and achievements?</p>
                  <p className="text-xs text-slate-500 mb-4">
                    This will permanently clear your reading duration history, weekly progress, unlocked achievements, and return all metrics to zero.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { 
                        onReset(); 
                        onResetAchievements(); 
                        setShowResetConfirm(false); 
                      }}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors focus:outline-none"
                    >
                      Yes, reset everything
                    </button>
                    <button
                      onClick={() => setShowResetConfirm(false)}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors focus:outline-none"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
});

export default AnalyticsDashboard;
