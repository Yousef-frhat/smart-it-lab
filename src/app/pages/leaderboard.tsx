import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Avatar, AvatarFallback } from "@/app/components/ui/avatar";
import { 
  Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal, 
  Award, Target, Flame, Star
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
import { LoadingSpinner } from "@/app/components/loading-spinner";
import { PageHeader } from "@/app/components/page-header";
import { useRefreshOnNavigate } from "@/app/hooks/useRefreshOnNavigate";

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
  const { weeklyLeaderboard, monthlyLeaderboard, isLoading, refresh } = useLabs();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("weekly");

  useRefreshOnNavigate(refresh);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-[#FFD700]" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-[#C0C0C0]" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-[#CD7F32]" />;
    return <span className="font-mono text-lg text-muted-foreground">#{rank}</span>;
  };

  const getTrendIcon = (trend: string, change?: number) => {
    if (trend === 'up') return (
      <div className="flex items-center gap-1 text-accent">
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
      <div className="flex items-center gap-1 text-muted-foreground">
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
                ? 'bg-[#3B82F6]/10 border-primary ring-2 ring-[#3B82F6]/50' 
                : 'bg-background border-border hover:border-[#475569]'
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
                <div className="text-muted-foreground text-xs mb-1">{t('points')}</div>
                <div className="font-mono font-bold text-[#FFD700]">{entry.totalPoints}</div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground text-xs mb-1">{t('labs')}</div>
                <div className="font-mono font-bold">{entry.labsCompleted}</div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground text-xs mb-1">{t('avgScore')}</div>
                <div className="font-mono font-bold text-accent">{Math.round(entry.avgScore || 0)}%</div>
              </div>
              <div className="text-center">
                <div className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
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
        <div className="text-center py-8 text-muted-foreground">
          No entries yet
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const currentBoard = activeTab === 'weekly' ? weeklyLeaderboard : monthlyLeaderboard;
  const currentUserEntry = currentBoard.find(e => e.isCurrentUser || e.userId === user?.id);

  return (
    <div className="space-y-6">
      <PageHeader title={t('leaderboardTitle')} subtitle={t('leaderboardSubtitle')} />

      {currentUserEntry && (
        <Card className="bg-gradient-to-r from-[#3B82F6]/20 to-[#00FF41]/20 border-primary">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{t('yourRank')}</p>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold font-mono">#{currentUserEntry.rank}</span>
                  {getTrendIcon(currentUserEntry.trend, currentUserEntry.trendChange)}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('points')}</p>
                  <p className="text-2xl font-bold font-mono text-[#FFD700]">{currentUserEntry.totalPoints}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('labs')}</p>
                  <p className="text-2xl font-bold font-mono">{currentUserEntry.labsCompleted}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t('avgScore')}</p>
                  <p className="text-2xl font-bold font-mono text-accent">{Math.round(currentUserEntry.avgScore || 0)}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-[#FFD700]" />
            <CardTitle>{t('rankings')}</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground">
            {t('trackPerformance')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weekly" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 bg-background mb-6">
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
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 text-[#FFD700] mt-1" />
              <div>
                <h4 className="font-semibold mb-1">{t('earnPoints')}</h4>
                <p className="text-sm text-muted-foreground">Complete labs, maintain streaks, and score high to earn points</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-primary mt-1" />
              <div>
                <h4 className="font-semibold mb-1">{t('weeklyReset')}</h4>
                <p className="text-sm text-muted-foreground">Weekly leaderboard resets every Sunday at midnight UTC</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-accent mt-1" />
              <div>
                <h4 className="font-semibold mb-1">{t('rewards')}</h4>
                <p className="text-sm text-muted-foreground">Top 3 players each week earn special profile badges</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
