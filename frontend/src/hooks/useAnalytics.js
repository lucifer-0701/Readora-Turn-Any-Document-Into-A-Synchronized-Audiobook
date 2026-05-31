/**
 * useAnalytics — Lightweight, localStorage-backed reading analytics tracker.
 *
 * DATA ARCHITECTURE
 * ─────────────────
 * All data lives in a single localStorage key: "voxreader_analytics"
 *
 * Shape:
 * {
 *   totalReadingSeconds:  number,   // cumulative speech-playing time
 *   totalPagesRead:       number,   // distinct pages visited
 *   totalFilesProcessed:  number,   // unique file loads
 *   totalSessions:        number,   // app-open count
 *   speedUsage:           { [rate]: count },  // histogram of speed selections
 *   voiceUsage:           { [voiceName]: count },
 *   weeklyActivity:       { [YYYY-MM-DD]: seconds },  // per-day reading time
 *   streak:               { current: number, lastActiveDate: "YYYY-MM-DD" },
 *   sessions:             [ { id, startedAt, durationSeconds, fileName, pagesRead } ],
 *   processedFiles:       [ fileName, ... ],    // dedup set
 *   visitedPages:         { [fileName]: [pageIndex, ...] },  // per-doc page set
 * }
 *
 * The hook exposes pure functions that App.jsx calls at the right moments:
 *   trackSessionStart()        → on app mount / welcome dismiss
 *   trackReadingTime(seconds)  → periodically while speech is playing
 *   trackPageVisit(fileName, pageIndex)
 *   trackFileProcessed(fileName)
 *   trackSpeedUsed(rate)
 *   trackVoiceUsed(voiceName)
 *   endSession()               → on unmount
 *   getAnalytics()             → returns the full analytics object
 *   resetAnalytics()           → clears all data
 */

import { useRef, useCallback } from 'react';

const LS_KEY = 'voxreader_analytics';

function today() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function save(data) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Analytics save failed', e);
  }
}

function defaults() {
  return {
    totalReadingSeconds: 0,
    totalPagesRead: 0,
    totalFilesProcessed: 0,
    totalSessions: 0,
    speedUsage: {},
    voiceUsage: {},
    weeklyActivity: {},
    streak: { current: 0, lastActiveDate: '' },
    sessions: [],
    processedFiles: [],
    visitedPages: {},
  };
}

function getOrCreate() {
  return load() || defaults();
}

/** Calculate streak from weeklyActivity map */
function computeStreak(weeklyActivity) {
  const d = new Date();
  let streak = 0;
  // Check today first
  const todayStr = today();
  if (weeklyActivity[todayStr] && weeklyActivity[todayStr] > 0) {
    streak = 1;
  } else {
    // If today has no activity, check if yesterday did (grace period)
    d.setDate(d.getDate() - 1);
    const yesterday = d.toISOString().slice(0, 10);
    if (!weeklyActivity[yesterday] || weeklyActivity[yesterday] <= 0) {
      return 0;
    }
    streak = 1;
    // continue counting backwards from yesterday
  }

  // Count consecutive days backwards
  const startDate = new Date();
  if (!(weeklyActivity[todayStr] > 0)) {
    startDate.setDate(startDate.getDate() - 1);
  }
  for (let i = 1; i <= 365; i++) {
    startDate.setDate(startDate.getDate() - 1);
    const key = startDate.toISOString().slice(0, 10);
    if (weeklyActivity[key] && weeklyActivity[key] > 0) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}

export default function useAnalytics() {
  const sessionRef = useRef({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    startedAt: new Date().toISOString(),
    durationSeconds: 0,
    fileName: '',
    pagesRead: 0,
  });

  const trackSessionStart = useCallback(() => {
    const data = getOrCreate();
    data.totalSessions += 1;
    save(data);
  }, []);

  const trackReadingTime = useCallback((seconds) => {
    if (!seconds || seconds <= 0) return;
    const data = getOrCreate();
    data.totalReadingSeconds += seconds;

    // Weekly activity
    const key = today();
    data.weeklyActivity[key] = (data.weeklyActivity[key] || 0) + seconds;

    // Streak
    data.streak = {
      current: computeStreak(data.weeklyActivity),
      lastActiveDate: key,
    };

    // Session tracking
    sessionRef.current.durationSeconds += seconds;

    save(data);
  }, []);

  const trackPageVisit = useCallback((fileName, pageIndex) => {
    if (!fileName) return;
    const data = getOrCreate();

    if (!data.visitedPages[fileName]) {
      data.visitedPages[fileName] = [];
    }
    if (!data.visitedPages[fileName].includes(pageIndex)) {
      data.visitedPages[fileName].push(pageIndex);
      data.totalPagesRead += 1;
    }

    sessionRef.current.pagesRead = data.visitedPages[fileName]?.length || 0;
    sessionRef.current.fileName = fileName;

    save(data);
  }, []);

  const trackFileProcessed = useCallback((fileName) => {
    if (!fileName) return;
    const data = getOrCreate();
    if (!data.processedFiles.includes(fileName)) {
      data.processedFiles.push(fileName);
      data.totalFilesProcessed += 1;
    }
    sessionRef.current.fileName = fileName;
    save(data);
  }, []);

  const trackSpeedUsed = useCallback((rate) => {
    const data = getOrCreate();
    const key = String(rate);
    data.speedUsage[key] = (data.speedUsage[key] || 0) + 1;
    save(data);
  }, []);

  const trackVoiceUsed = useCallback((voiceName) => {
    if (!voiceName) return;
    const data = getOrCreate();
    data.voiceUsage[voiceName] = (data.voiceUsage[voiceName] || 0) + 1;
    save(data);
  }, []);

  const endSession = useCallback(() => {
    const data = getOrCreate();
    const s = sessionRef.current;
    if (s.durationSeconds > 0 || s.pagesRead > 0) {
      data.sessions = [
        { ...s },
        ...(data.sessions || []),
      ].slice(0, 100); // keep last 100 sessions
    }
    save(data);
  }, []);

  const getAnalytics = useCallback(() => {
    const data = getOrCreate();
    // Recompute streak to keep it fresh
    data.streak.current = computeStreak(data.weeklyActivity);

    // Compute derived stats
    const avgSpeed = (() => {
      const entries = Object.entries(data.speedUsage || {});
      if (entries.length === 0) return 1;
      let totalWeight = 0;
      let totalCount = 0;
      entries.forEach(([rate, count]) => {
        totalWeight += parseFloat(rate) * count;
        totalCount += count;
      });
      return totalCount > 0 ? Math.round((totalWeight / totalCount) * 100) / 100 : 1;
    })();

    const mostUsedVoice = (() => {
      const entries = Object.entries(data.voiceUsage || {});
      if (entries.length === 0) return 'None';
      entries.sort((a, b) => b[1] - a[1]);
      return entries[0][0];
    })();

    return { ...data, avgSpeed, mostUsedVoice };
  }, []);

  const resetAnalytics = useCallback(() => {
    save(defaults());
  }, []);

  return {
    trackSessionStart,
    trackReadingTime,
    trackPageVisit,
    trackFileProcessed,
    trackSpeedUsed,
    trackVoiceUsed,
    endSession,
    getAnalytics,
    resetAnalytics,
  };
}
