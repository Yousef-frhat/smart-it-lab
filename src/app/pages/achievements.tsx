import { useState, useEffect, ReactElement } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { 
  Trophy, Award, Target, Zap, Shield, Star, Crown, 
  CheckCircle, Lock, TrendingUp, Calendar, Flame
} from "lucide-react";
import api from "@/app/services/api";
import { useLabs } from "@/app/contexts/labs-context";
import { useLanguage } from "@/app/contexts/language-context";
import { toast } from "sonner";
import { LoadingSpinner } from "@/app/components/loading-spinner";
import { PageHeader } from "@/app/components/page-header";
import { StatCard } from "@/app/components/stat-card";
import { useRefreshOnNavigate } from "@/app/hooks/useRefreshOnNavigate";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt?: string;
  category: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  progress?: number;
  maxProgress?: number;
}

// Map backend icon strings to Lucide components
const iconMap: Record<string, ReactElement> = {
  zap: <Zap className="w-6 h-6" />,
  target: <Target className="w-6 h-6" />,
  award: <Award className="w-6 h-6" />,
  star: <Star className="w-6 h-6" />,
  shield: <Shield className="w-6 h-6" />,
  trophy: <Trophy className="w-6 h-6" />,
  flame: <Flame className="w-6 h-6" />,
  crown: <Crown className="w-6 h-6" />,
  'check-circle': <CheckCircle className="w-6 h-6" />,
};

function getIcon(iconName: string): ReactElement {
  return iconMap[iconName?.toLowerCase()] ?? <Award className="w-6 h-6" />;
}

// Static tier color lookup — avoids Tailwind purging dynamic class names
const TIER_COLORS: Record<string, { border: string; bg: string; text: string }> = {
  bronze:   { border: 'border-amber-600',  bg: 'bg-amber-600/10',   text: 'text-amber-600' },
  silver:   { border: 'border-slate-400',  bg: 'bg-slate-400/10',   text: 'text-slate-400' },
  gold:     { border: 'border-yellow-400', bg: 'bg-yellow-400/10',  text: 'text-yellow-400' },
  platinum: { border: 'border-cyan-400',   bg: 'bg-cyan-400/10',    text: 'text-cyan-400' },
};
const TIER_FALLBACK = { border: 'border-slate-600', bg: 'bg-slate-600/10', text: 'text-slate-400' };
const getTierClasses = (tier: string) => TIER_COLORS[tier] ?? TIER_FALLBACK;

// ── Client-side achievement unlock overlay ───────────────────────
// When the backend has no UserAchievement record (e.g. labs completed
// without a backend session), we compute progress locally from lab data
// so the page never shows all-zeros.
//
// Rules are derived directly from the seeded achievement definitions:
//   ach-1  First Steps          maxProgress:1   complete >= 1 lab
//   ach-2  Speed Runner         maxProgress:1   cannot detect locally (no timing data)
//   ach-3  OSPF Expert          maxProgress:1   complete any lab in "Routing Protocols" category
//   ach-4  Lab Marathon         maxProgress:10  complete >= 10 labs
//   ach-5  Consistent Learner   maxProgress:5   cannot detect locally (no date history)
//   ach-6  Network Architect    maxProgress:25  complete >= 25 labs
//   ach-7  BGP Master           maxProgress:1   complete lab-4 (BGP lab)
//   ach-8  Automation Guru      maxProgress:4   complete labs in "Automation" category
//   ach-9  Team Player          maxProgress:3   social — cannot detect locally
//   ach-ccna-m1  CCNA Module Complete  maxProgress:1  complete all labs in any single module
//   ach-ccna-m3  Routing Master        maxProgress:6  complete all 6 IP Connectivity labs
//   ach-ccna-m5  Security Champion     maxProgress:5  complete all 5 Security Fundamentals labs
//   ach-ccna-ready CCNA Ready          maxProgress:40 complete >= 40 labs

import type { Lab } from "@/app/services/lab-api";

function applyLocalProgress(
  achievements: Achievement[],
  labs: Lab[],
): Achievement[] {
  const completedLabs = labs.filter((l) => l.status === 'completed');
  const completedCount = completedLabs.length;
  const maxScore = labs.reduce((m, l) => Math.max(m, l.score ?? 0), 0);

  // Count completed labs per category
  const completedByCategory: Record<string, number> = {};
  for (const l of completedLabs) {
    completedByCategory[l.category] = (completedByCategory[l.category] ?? 0) + 1;
  }

  // Count completed labs per module (module field on Lab)
  const completedByModule: Record<string, number> = {};
  for (const l of completedLabs) {
    const mod = (l as Lab & { module?: string }).module ?? l.category;
    completedByModule[mod] = (completedByModule[mod] ?? 0) + 1;
  }

  // Total labs per module (for "complete ALL labs in module" checks)
  const totalByModule: Record<string, number> = {};
  for (const l of labs) {
    const mod = (l as Lab & { module?: string }).module ?? l.category;
    totalByModule[mod] = (totalByModule[mod] ?? 0) + 1;
  }

  const bgpCompleted = completedLabs.some((l) => l.id === 'lab-4');

  return achievements.map((ach): Achievement => {
    // Always trust a server-side unlock
    if (ach.unlocked) return ach;

    let localProgress = ach.progress ?? 0;

    switch (ach.id) {
      case 'ach-1': // First Steps — complete 1 lab
        localProgress = Math.min(completedCount, 1);
        break;

      case 'ach-3': // OSPF Expert — complete any Routing Protocols lab
        localProgress = Math.min(
          completedByCategory['Routing Protocols'] ?? 0,
          1,
        );
        break;

      case 'ach-4': // Lab Marathon — complete 10 labs
        localProgress = Math.min(completedCount, 10);
        break;

      case 'ach-6': // Network Architect — complete 25 labs
        localProgress = Math.min(completedCount, 25);
        break;

      case 'ach-7': // BGP Master — complete the BGP lab
        localProgress = bgpCompleted ? 1 : 0;
        break;

      case 'ach-8': // Automation Guru — complete 4 Automation labs
        localProgress = Math.min(
          completedByCategory['Automation'] ?? 0,
          4,
        );
        break;

      case 'ach-ccna-m1': { // CCNA Module Complete — all labs in any single module
        const anyModuleComplete = Object.entries(totalByModule).some(
          ([mod, total]) => (completedByModule[mod] ?? 0) >= total && total > 0,
        );
        localProgress = anyModuleComplete ? 1 : 0;
        break;
      }

      case 'ach-ccna-m3': // Routing Master — all 6 IP Connectivity labs
        localProgress = Math.min(
          completedByModule['IP Connectivity'] ?? 0,
          6,
        );
        break;

      case 'ach-ccna-m5': // Security Champion — all 5 Security Fundamentals labs
        localProgress = Math.min(
          completedByModule['Security Fundamentals'] ?? 0,
          5,
        );
        break;

      case 'ach-ccna-ready': // CCNA Ready — complete 40 labs
        localProgress = Math.min(completedCount, 40);
        break;

      // ach-2 (Speed Runner), ach-5 (Consistent Learner), ach-9 (Team Player)
      // cannot be determined from lab list alone — leave at server value
      default:
        // Generic fallback: if description mentions a score threshold
        if (
          (ach.description.toLowerCase().includes('perfect') ||
            ach.description.includes('100%')) &&
          maxScore >= 100
        ) {
          localProgress = Math.min(1, ach.maxProgress ?? 1);
        }
        break;
    }

    // Use the higher of server progress and local estimate
    const effectiveProgress = Math.max(localProgress, ach.progress ?? 0);

    // BUG-08 fix: NEVER set unlocked or unlockedAt client-side.
    // Only backend UserAchievement records can unlock an achievement.
    // Setting unlocked:true here caused a flicker: page load shows unlocked,
    // next fetch returns unlocked:false (no DB record) → flips back to locked.
    return {
      ...ach,
      progress: effectiveProgress,
      // unlocked and unlockedAt are intentionally left as-is from the server
    };
  });
}

export default function Achievements() {
  const { labs, isLoading: labsLoading, refresh } = useLabs();
  const { t } = useLanguage();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useRefreshOnNavigate(refresh);

  useEffect(() => {
    setIsLoading(true);
    api
      .get('/achievements')
      .then((res) => {
        const raw = res.data.data?.achievements ?? res.data.achievements ?? [];
        const enriched = applyLocalProgress(raw as Achievement[], labs);
        setAchievements(enriched);
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to load achievements');
      })
      .finally(() => setIsLoading(false));
  }, [labs]); // re-run whenever labs data updates

  useEffect(() => {
    const points = achievements
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);
    setTotalPoints(points);
  }, [achievements]);


  if (isLoading) {
    return <LoadingSpinner />;
  }

  const unlockedAchievements = achievements.filter(a => a.unlocked);
  const lockedAchievements = achievements.filter(a => !a.unlocked);
  const completionRate = achievements.length > 0 
    ? Math.floor((unlockedAchievements.length / achievements.length) * 100)
    : 0;

  const categories = Array.from(new Set(achievements.map(a => a.category)));

  return (
    <div className="space-y-6">
      <PageHeader title={t('achievementsTitle')} subtitle={t('achievementsSubtitle')} />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label={t('totalPoints')}
          value={totalPoints.toString()}
          icon={<Trophy className="w-10 h-10 text-[#FFD700]" />}
          cardClassName="bg-gradient-to-br from-[#FFD700]/20 to-[#F59E0B]/20 border-[#FFD700]"
          valueClassName="text-3xl text-[#FFD700]"
        />
        <StatCard
          label={t('unlocked')}
          value={unlockedAchievements.length.toString()}
          icon={<CheckCircle className="w-10 h-10 text-accent" />}
          valueClassName="text-3xl text-accent"
          subtext={`/ ${achievements.length}`}
        />
        <StatCard
          label={t('completion')}
          value={`${completionRate}%`}
          icon={<TrendingUp className="w-10 h-10 text-primary" />}
          valueClassName="text-3xl text-primary"
        />
        <StatCard
          label={t('inProgress')}
          value={lockedAchievements.filter(a => (a.progress || 0) > 0).length.toString()}
          icon={<Target className="w-10 h-10 text-[#F59E0B]" />}
          valueClassName="text-3xl text-[#F59E0B]"
        />
      </div>

      {/* Recent Unlocks */}
      {unlockedAchievements.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#FFD700]" />
              {t('unlocked')}
            </CardTitle>
            <CardDescription className="text-muted-foreground"></CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unlockedAchievements.slice(0, 4).map((achievement) => (
                <div 
                  key={achievement.id}
                  className={`p-4 rounded-lg border-2 ${getTierClasses(achievement.tier).border} ${getTierClasses(achievement.tier).bg}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={getTierClasses(achievement.tier).text}>
                      {getIcon(achievement.icon)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{achievement.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge className="bg-background border-border">
                          +{achievement.points} {t('pts')}
                        </Badge>
                        {achievement.unlockedAt && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(achievement.unlockedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Achievements by Category */}
      {categories.map(category => {
        const categoryAchievements = achievements.filter(a => a.category === category);
        const categoryUnlocked = categoryAchievements.filter(a => a.unlocked).length;
        
        return (
          <Card key={category} className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{category}</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t('ofUnlocked').replace('{unlocked}', categoryUnlocked.toString()).replace('{total}', categoryAchievements.length.toString())}
                  </CardDescription>
                </div>
                <Badge className="bg-background border-border text-accent">
                  {Math.floor((categoryUnlocked / categoryAchievements.length) * 100)}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryAchievements.map((achievement) => (
                  <div 
                    key={achievement.id}
                    className={`p-4 rounded-lg border ${
                      achievement.unlocked 
                        ? `${getTierClasses(achievement.tier).border} ${getTierClasses(achievement.tier).bg}` 
                        : 'border-border bg-background/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      {achievement.unlocked ? (
                        <div className={getTierClasses(achievement.tier).text}>
                          {getIcon(achievement.icon)}
                        </div>
                      ) : (
                        <div className="text-muted-foreground">
                          <Lock className="w-6 h-6" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className={`font-semibold mb-1 ${achievement.unlocked ? '' : 'text-muted-foreground'}`}>
                          {achievement.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                      </div>
                    </div>
                    
                    {achievement.maxProgress && achievement.maxProgress > 1 && (
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{t('progress')}</span>
                          <span className="font-mono text-accent">
                            {achievement.progress || 0}/{achievement.maxProgress}
                          </span>
                        </div>
                        <Progress 
                          value={((achievement.progress || 0) / achievement.maxProgress) * 100} 
                          className="h-1.5"
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <Badge className={`${getTierClasses(achievement.tier).bg} ${getTierClasses(achievement.tier).text} border-0`}>
                        {achievement.tier}
                      </Badge>
                      <span className="text-sm font-mono font-semibold">
                        {achievement.points} {t('pts')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
