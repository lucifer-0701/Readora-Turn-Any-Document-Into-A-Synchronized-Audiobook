import { useState, useEffect, useCallback } from 'react';

const GOALS_LS_KEY = 'readora_goals';
const UNLOCKED_LS_KEY = 'readora_unlocked_achievements';

const DEFAULT_GOALS = {
  daily: 15, // in minutes
  weekly: 60, // in minutes
  monthly: 300, // in minutes
};

export const ACHIEVEMENTS_LIST = [
  {
    id: 'first_doc',
    title: 'First Step',
    description: 'Complete your first document reading to 100%',
    icon: 'BookOpen',
    requirement: '1 document completed',
    color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400',
  },
  {
    id: 'one_hour',
    title: 'Dedicated Reader',
    description: 'Read for a cumulative total of 1 hour',
    icon: 'Clock',
    requirement: '1 hour cumulative reading time',
    color: 'from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-400',
  },
  {
    id: 'five_docs',
    title: 'Avid Collector',
    description: 'Process 5 documents in your library',
    icon: 'FolderPlus',
    requirement: '5 documents processed',
    color: 'from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-400',
  },
  {
    id: 'ten_bookmarks',
    title: 'Memory Master',
    description: 'Create 10 bookmarks across pages',
    icon: 'Bookmark',
    requirement: '10 bookmarks saved',
    color: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400',
  },
  {
    id: 'streak_3',
    title: 'Habit Builder',
    description: 'Reach a 3-day reading streak',
    icon: 'Flame',
    requirement: '3-day active streak',
    color: 'from-orange-500/20 to-red-500/10 border-orange-500/30 text-orange-400',
  },
  {
    id: 'streak_7',
    title: 'Unstoppable Focus',
    description: 'Reach a 7-day reading streak',
    icon: 'Zap',
    requirement: '7-day active streak',
    color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-400',
  }
];

export default function useGoalsAchievements(analytics, history, bookmarks, onAchievementUnlock) {
  const [goals, setGoals] = useState(() => {
    try {
      const raw = localStorage.getItem(GOALS_LS_KEY);
      return raw ? JSON.parse(raw) : DEFAULT_GOALS;
    } catch {
      return DEFAULT_GOALS;
    }
  });

  const [unlockedIds, setUnlockedIds] = useState(() => {
    try {
      const raw = localStorage.getItem(UNLOCKED_LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Save goals
  const updateGoal = useCallback((type, minutes) => {
    setGoals((prev) => {
      const updated = { ...prev, [type]: Math.max(1, minutes) };
      localStorage.setItem(GOALS_LS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Check achievements condition
  const checkAchievements = useCallback(() => {
    if (!analytics) return;

    // Derived statistics
    const docsCompleted = history.filter(item => (item.progress || 0) >= 100).length;
    const totalReadingSeconds = analytics.totalReadingSeconds || 0;
    const totalFilesProcessed = history.length;
    const totalBookmarksCreated = bookmarks.length;
    const streak = (analytics.streak && analytics.streak.current) || 0;

    const stats = {
      docsCompleted,
      totalReadingSeconds,
      totalFilesProcessed,
      totalBookmarksCreated,
      streak,
    };

    const newUnlocks = [];

    ACHIEVEMENTS_LIST.forEach((ach) => {
      if (unlockedIds.includes(ach.id)) return;

      let isConditionMet = false;
      if (ach.id === 'first_doc') isConditionMet = stats.docsCompleted >= 1;
      else if (ach.id === 'one_hour') isConditionMet = stats.totalReadingSeconds >= 3600;
      else if (ach.id === 'five_docs') isConditionMet = stats.totalFilesProcessed >= 5;
      else if (ach.id === 'ten_bookmarks') isConditionMet = stats.totalBookmarksCreated >= 10;
      else if (ach.id === 'streak_3') isConditionMet = stats.streak >= 3;
      else if (ach.id === 'streak_7') isConditionMet = stats.streak >= 7;

      if (isConditionMet) {
        newUnlocks.push(ach.id);
      }
    });

    if (newUnlocks.length > 0) {
      setUnlockedIds((prev) => {
        const next = [...prev, ...newUnlocks];
        localStorage.setItem(UNLOCKED_LS_KEY, JSON.stringify(next));
        return next;
      });

      newUnlocks.forEach(id => {
        const achievement = ACHIEVEMENTS_LIST.find(a => a.id === id);
        if (achievement && onAchievementUnlock) {
          onAchievementUnlock(achievement);
        }
      });
    }
  }, [analytics, history, bookmarks, unlockedIds, onAchievementUnlock]);

  // Run achievement checks when stats change
  useEffect(() => {
    checkAchievements();
  }, [checkAchievements]);

  // Compute goals progress
  const getGoalsProgress = useCallback(() => {
    if (!analytics) return { daily: 0, weekly: 0, monthly: 0 };

    // Today's reading seconds
    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySeconds = analytics.weeklyActivity?.[todayStr] || 0;
    const todayMins = todaySeconds / 60;

    // Weekly reading seconds
    let weeklySeconds = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      weeklySeconds += analytics.weeklyActivity?.[key] || 0;
    }
    const weeklyMins = weeklySeconds / 60;

    // Monthly reading seconds
    let monthlySeconds = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      monthlySeconds += analytics.weeklyActivity?.[key] || 0;
    }
    const monthlyMins = monthlySeconds / 60;

    return {
      daily: {
        target: goals.daily,
        current: Math.round(todayMins * 10) / 10,
        percentage: Math.min(100, Math.round((todayMins / goals.daily) * 100)),
      },
      weekly: {
        target: goals.weekly,
        current: Math.round(weeklyMins * 10) / 10,
        percentage: Math.min(100, Math.round((weeklyMins / goals.weekly) * 100)),
      },
      monthly: {
        target: goals.monthly,
        current: Math.round(monthlyMins * 10) / 10,
        percentage: Math.min(100, Math.round((monthlyMins / goals.monthly) * 100)),
      },
    };
  }, [analytics, goals]);

  const resetAchievements = useCallback(() => {
    localStorage.removeItem(UNLOCKED_LS_KEY);
    setUnlockedIds([]);
  }, []);

  return {
    goals,
    unlockedIds,
    updateGoal,
    getGoalsProgress,
    resetAchievements,
  };
}
