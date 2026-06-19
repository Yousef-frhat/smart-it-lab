import { useState, useEffect } from "react";
import { useLocation } from "react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { 
  Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal, 
  Award, Target, Flame, Star, Loader2
} from "lucide-react";
import { useAuth } from "@/app/contexts/auth-context";
import { useLabs } from "@/app/contexts/labs-context";
import { useLanguage } from "@/app/contexts/language-context";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/components/ui/tabs";

interface LeaderboardEntry {
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

export default function Leaderboard() {
  const { user } = useAuth();
  const location = useLocation();
  const { weeklyLeaderboard, monthlyLeaderboard, isLoading, refresh } = useLabs();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("weekly");

  // Re-fetch on navigation (e.g. returning from a lab)
  useEffect(() => {
    refresh();
  }, [location.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-[#FFD700]" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-[#C0C0C0]" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-[#CD7F32]" />;
    return <span className="font-mono text-lg text-[#94A3B8]">#{rank}</span>;
  };

  const getTrendIcon = (trend: string, change?: number) => {
    if (trend === 'up') return (
      <div className="flex items-center gap-1 text-[#00FF41]">
        <TrendingUp className="w-4 h-4" />
        {change && <span className="text-xs">+{change}</span>}
      </div>
    );
    if (trend === 'down') return (
      <div className="flex items-center gap-1 text-[#EF4444]">
        <TrendingDown className="w-4 h-4" />
        {change && <span className="text-xs">-{change}</span>}
      </div>
    );
    return (
      <div className="flex items-center gap-1 text-[#94A3B8]">
        <Minus className="w-4 h-4" />
      </div>
    );
  };

  const renderLeaderboardTable = (data: LeaderboardEntry[]) => (
    <div className="space-y-3">
      {data.map((entry) => {
        const isCurrentUser = entry.isCurrentUser || entry.userId === user?.id;
        
        return (
          <div 
            key={entry.userId}
            className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
              isCurrentUser 
                ? 'bg-[#3B82F6]/10 border-[#3B82F6] ring-2 ring-[#3B82F6]/50' 
                : 'bg-[#0F172A] border-[#334155] hover:border-[#475569]'
            }`}
          >
            <div className="w-16 flex items-center justify-center">
              {getRankIcon(entry.rank)}
            </div>

            <div className="flex items-center gap-3 flex-1">
              <Avatar className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#00FF41]">
                <AvatarFallback className="bg-transparent text-white font-semibold">
                  {entry.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold">{entry.name}</h4>
                  {isCurrentUser && (
                    <Badge className="bg-[#00FF41] text-[#0F172A] text-xs">You</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-[#94A3B8] text-xs mb-1">{t('points')}</div>
                <div className="font-mono font-bold text-[#FFD700]">{entry.totalPoints}</div>
              </div>
              <div className="text-center">
                <div className="text-[#94A3B8] text-xs mb-1">{t('labs')}</div>
                <div className="font-mono font-bold">{entry.labsCompleted}</div>
              </div>
              <div className="text-center">
                <div className="text-[#94A3B8] text-xs mb-1">{t('avgScore')}</div>
                <div className="font-mono font-bold text-[#00FF41]">{Math.round(entry.avgScore || 0)}%</div>
              </div>
              <div className="text-center">
                <div className="text-[#94A3B8] text-xs mb-1 flex items-center gap-1">
                  <Flame className="w-3 h-3" />
                  {t('currentStreak')}
                </div>
                <div className="font-mono font-bold text-[#F59E0B]">{t('days').replace('{streak}', entry.streak.toString())}</div>
              </div>
            </div>

            <div className="w-16 flex items-center justify-center">
              {getTrendIcon(entry.trend, entry.trendChange)}
            </div>
          </div>
        );
      })}

      {data.length === 0 && (
        <div className="text-center py-8 text-[#94A3B8]">
          No entries yet
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-[#3B82F6] animate-spin" />
      </div>
    );
  }

  const currentBoard = activeTab === 'weekly' ? weeklyLeaderboard : monthlyLeaderboard;
  const currentUserEntry = currentBoard.find(e => e.isCurrentUser || e.userId === user?.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('leaderboardTitle')}</h1>
        <p className="text-[#94A3B8]">{t('leaderboardSubtitle')}</p>
      </div>

      {currentUserEntry && (
        <Card className="bg-gradient-to-r from-[#3B82F6]/20 to-[#00FF41]/20 border-[#3B82F6]">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#94A3B8] mb-2">{t('yourRank')}</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold font-mono">#{currentUserEntry.rank}</span>
                  {getTrendIcon(currentUserEntry.trend, currentUserEntry.trendChange)}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-sm text-[#94A3B8] mb-1">{t('points')}</p>
                  <p className="text-2xl font-bold font-mono text-[#FFD700]">{currentUserEntry.totalPoints}</p>
                </div>
                <div>
                  <p className="text-sm text-[#94A3B8] mb-1">{t('labs')}</p>
                  <p className="text-2xl font-bold font-mono">{currentUserEntry.labsCompleted}</p>
                </div>
                <div>
                  <p className="text-sm text-[#94A3B8] mb-1">{t('avgScore')}</p>
                  <p className="text-2xl font-bold font-mono text-[#00FF41]">{Math.round(currentUserEntry.avgScore || 0)}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-[#1E293B] border-[#334155]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#FFD700]" />
            <CardTitle>{t('rankings')}</CardTitle>
          </div>
          <CardDescription className="text-[#94A3B8]">
            {t('trackPerformance')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weekly" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-[#0F172A] mb-6">
              <TabsTrigger value="weekly">{t('thisWeek')}</TabsTrigger>
              <TabsTrigger value="monthly">{t('thisMonth')}</TabsTrigger>
            </TabsList>
            <TabsContent value="weekly">
              {renderLeaderboardTable(weeklyLeaderboard)}
            </TabsContent>
            <TabsContent value="monthly">
              {renderLeaderboardTable(monthlyLeaderboard)}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-[#FFD700] mt-1" />
              <div>
                <h4 className="font-semibold mb-1">{t('earnPoints')}</h4>
                <p className="text-sm text-[#94A3B8]">Complete labs, maintain streaks, and score high to earn points</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-[#3B82F6] mt-1" />
              <div>
                <h4 className="font-semibold mb-1">{t('weeklyReset')}</h4>
                <p className="text-sm text-[#94A3B8]">Weekly leaderboard resets every Sunday at midnight UTC</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[#1E293B] border-[#334155]">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-[#00FF41] mt-1" />
              <div>
                <h4 className="font-semibold mb-1">{t('rewards')}</h4>
                <p className="text-sm text-[#94A3B8]">Top 3 players each week earn special profile badges</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
