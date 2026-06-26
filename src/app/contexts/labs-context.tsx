/**
 * LabsContext — Single source of truth for labs + achievements + leaderboard.
 *
 * All four main pages (Dashboard, My Labs, Achievements, Leaderboard) consume
 * this context instead of calling getLabs() independently. This guarantees that
 * completing a lab in any part of the app triggers a single coordinated refresh
 * that updates every page simultaneously.
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { getLabs, Lab } from '@/app/services/lab-api';
import api from '@/app/services/api';
import { useAuth } from '@/app/contexts/auth-context';

// ── Types ────────────────────────────────────────────────────────

export interface AchievementSummary {
  id: string;
  unlocked: boolean;
  points: number;
  progress?: number;
  maxProgress?: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar?: string;
  totalPoints: number;
  labsCompleted: number;
  avgScore: number;
  streak: number;
  trend: 'up' | 'down' | 'same';
  trendChange?: number;
  isCurrentUser?: boolean;
}

interface LabsContextType {
  // Data
  labs: Lab[];
  achievements: AchievementSummary[];
  weeklyLeaderboard: LeaderboardEntry[];
  monthlyLeaderboard: LeaderboardEntry[];

  // Loading / error state
  isLoading: boolean;
  error: string | null;

  // Derived stats (computed once, shared everywhere)
  completedCount: number;
  inProgressCount: number;
  unlockedAchievementsCount: number;
  totalPoints: number;
  myRank: number;
  avgScore: number;

  // Actions
  refresh: () => Promise<void>;
}

// ── Context ──────────────────────────────────────────────────────

const LabsContext = createContext<LabsContextType | undefined>(undefined);

// ── Provider ─────────────────────────────────────────────────────

export function LabsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();

  const [labs, setLabs] = useState<Lab[]>([]);
  const [achievements, setAchievements] = useState<AchievementSummary[]>([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);

    try {
      // Retroactive sync first — recalculates achievements + leaderboard from
      // existing UserLab records. Idempotent and safe to call on every refresh.
      // We await it so the subsequent fetches see the updated data.
      await api.post('/labs/sync-stats').catch((err) => {
        console.warn("Non-critical: sync-stats failed, continuing with stale data:", err);
      });

      const [labsData, achRes, weeklyRes, monthlyRes] = await Promise.allSettled([
        getLabs(),
        api.get('/achievements'),
        api.get('/leaderboard', { params: { period: 'weekly' } }),
        api.get('/leaderboard', { params: { period: 'monthly' } }),
      ]);

      if (labsData.status === 'fulfilled') {
        setLabs(labsData.value);
      } else {
        setError('Failed to load labs');
      }

      if (achRes.status === 'fulfilled') {
        const raw = achRes.value.data?.data?.achievements ?? [];
        setAchievements(
          raw.map((a: Record<string, unknown>) => ({
            id: a.id as string,
            unlocked: Boolean(a.unlocked),
            points: Number(a.points ?? 0),
            progress: a.progress as number | undefined,
            maxProgress: a.maxProgress as number | undefined,
          }))
        );
      }

      if (weeklyRes.status === 'fulfilled') {
        setWeeklyLeaderboard(weeklyRes.value.data?.data?.leaderboard ?? []);
      }

      if (monthlyRes.status === 'fulfilled') {
        setMonthlyLeaderboard(monthlyRes.value.data?.data?.leaderboard ?? []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Initial load when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      refresh();
    } else {
      // Clear data on logout
      setLabs([]);
      setAchievements([]);
      setWeeklyLeaderboard([]);
      setMonthlyLeaderboard([]);
    }
  }, [isAuthenticated, refresh]);

  // ── Derived stats ────────────────────────────────────────────
  const completedCount = labs.filter((l) => l.status === 'completed').length;
  const inProgressCount = labs.filter(
    (l) => l.status === 'running' || l.status === 'stopped'
  ).length;
  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length;
  const totalPoints = achievements
    .filter((a) => a.unlocked)
    .reduce((sum, a) => sum + a.points, 0);

  const currentUserWeekly = weeklyLeaderboard.find((e) => e.isCurrentUser);
  const myRank = currentUserWeekly?.rank ?? 0;

  const scoredLabs = labs.filter((l) => l.score > 0);
  const avgScore =
    scoredLabs.length > 0
      ? Math.floor(
          scoredLabs.reduce((acc, l) => acc + l.score, 0) / scoredLabs.length
        )
      : 0;

  const value: LabsContextType = {
    labs,
    achievements,
    weeklyLeaderboard,
    monthlyLeaderboard,
    isLoading,
    error,
    completedCount,
    inProgressCount,
    unlockedAchievementsCount,
    totalPoints,
    myRank,
    avgScore,
    refresh,
  };

  return <LabsContext.Provider value={value}>{children}</LabsContext.Provider>;
}

// ── Hook ─────────────────────────────────────────────────────────

export function useLabs() {
  const ctx = useContext(LabsContext);
  if (!ctx) throw new Error('useLabs must be used within a LabsProvider');
  return ctx;
}
