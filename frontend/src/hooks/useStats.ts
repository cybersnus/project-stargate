import { useState, useEffect, useCallback } from 'react';
import type { Stats, SessionResult, TrainingMode } from '../types';
import { DEFAULT_STATS } from '../types';

const STORAGE_KEY = 'rv-training-stats';

export function useStats() {
  const [stats, setStats] = useState<Stats>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return DEFAULT_STATS;
      }
    }
    return DEFAULT_STATS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  const recordResult = useCallback((result: SessionResult) => {
    setStats(prev => {
      const newStats = { ...prev };
      const mode = result.mode;

      if (mode === 'location') {
        newStats.location = {
          total: prev.location.total + 1,
          totalRating: prev.location.totalRating + (result.rating || 0),
          history: [...prev.location.history, result].slice(-100)
        };
      } else {
        newStats[mode] = {
          total: prev[mode].total + 1,
          correct: prev[mode].correct + (result.correct ? 1 : 0),
          history: [...prev[mode].history, result].slice(-100)
        };
      }

      return newStats;
    });
  }, []);

  const clearStats = useCallback(() => {
    setStats(DEFAULT_STATS);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const getHitRate = useCallback((mode: 'shape' | 'image'): number => {
    const modeStats = stats[mode];
    if (modeStats.total === 0) return 0;
    return modeStats.correct / modeStats.total;
  }, [stats]);

  const getAverageRating = useCallback((): number => {
    if (stats.location.total === 0) return 0;
    return stats.location.totalRating / stats.location.total;
  }, [stats]);

  const getZScore = useCallback((mode: 'shape' | 'image'): number => {
    const modeStats = stats[mode];
    if (modeStats.total < 10) return 0; // Need at least 10 trials

    const expected = mode === 'shape' ? 0.2 : 0.25;
    const observed = modeStats.correct / modeStats.total;
    const n = modeStats.total;

    // z = (observed - expected) / sqrt(expected * (1 - expected) / n)
    const standardError = Math.sqrt((expected * (1 - expected)) / n);
    return (observed - expected) / standardError;
  }, [stats]);

  const getExpectedChance = useCallback((mode: TrainingMode): number => {
    switch (mode) {
      case 'shape': return 0.2; // 1/5
      case 'image': return 0.25; // 1/4
      case 'location': return 3; // Middle of 1-5 scale
    }
  }, []);

  return {
    stats,
    recordResult,
    clearStats,
    getHitRate,
    getAverageRating,
    getZScore,
    getExpectedChance
  };
}
