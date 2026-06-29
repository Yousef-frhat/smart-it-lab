import { useMemo } from "react";
import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import {
  Trophy, Clock, Play, CircleDot,
  BookOpen, Award, Loader2, CheckCircle,
} from "lucide-react";
import { useAuth } from "@/app/contexts/auth-context";
import { useLabs } from "@/app/contexts/labs-context";
import { useLanguage } from "@/app/contexts/language-context";

export default function StudentDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { labs, isLoading, error, completedCount, unlockedAchievementsCount, myRank } = useLabs();

  const totalHours = Math.floor(
    labs
      .filter((l) => l.status === 'completed')
      .reduce((acc, lab) => acc + (parseInt(lab.estimatedTime) || 0), 0) / 60
  );

  const userStreak    = user?.streak;
  const streakDisplay = typeof userStreak === 'number' && userStreak > 0 ? `${userStreak} days` : '—';
  const activeLabs    = labs.filter((l) => l.status === 'running' || l.status === 'stopped');
  const completedLabs = labs.filter((l) => l.status === 'completed');
  const recentCompleted = completedLabs.slice(0, 5);

  const avgProgress =
    labs.length > 0
      ? Math.floor(labs.reduce((acc, lab) => acc + lab.progress, 0) / labs.length)
      : 0;

  const currentTrack = useMemo(() => {
    const done = labs.filter((l) => l.status === 'completed');
    if (done.length === 0) return 'CCNA';
    const counts = done.reduce((acc, l) => {
      const cat = l.category ?? 'General';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).sort(([, a], [, b]) => b - a)[0]?.[0] ?? 'CCNA';
  }, [labs]);

  const stats = [
    { label: t('labsSolved'),        value: completedCount.toString(),        icon: <BookOpen className="w-5 h-5" />, color: 'text-primary',     href: undefined },
    { label: t('globalRank'),        value: myRank > 0 ? `#${myRank}` : '—', icon: <Trophy   className="w-5 h-5" />, color: 'text-accent',      href: '/dashboard/leaderboard' },
    { label: t('hoursSpent'),        value: `${totalHours}h`,                 icon: <Clock    className="w-5 h-5" />, color: 'text-yellow-500',  href: undefined },
    { label: t('achievementsCount'), value: String(unlockedAchievementsCount),icon: <Award    className="w-5 h-5" />, color: 'text-purple-500',  href: '/dashboard/achievements' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Welcome Widget ────────────────────────────────────── */}
      <Card className="border-border bg-gradient-to-r from-primary/10 to-accent/10">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-2 text-foreground">
                {t('welcomeBack').replace('{name}', user?.name || 'Student')}
              </h1>
              <p className="text-muted-foreground">
                {t('ccnaTrack').replace('{percent}', avgProgress.toString()).replace('{track}', currentTrack)}
              </p>
              <Progress value={avgProgress} className="w-64 mt-3" />
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">{t('currentStreak')}</div>
              <div className="text-3xl font-bold text-accent">{streakDisplay}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Stats Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) =>
          stat.href ? (
            <Link key={i} to={stat.href} className="block group">
              <Card className="bg-card border-border group-hover:border-primary transition-colors cursor-pointer card-hover">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className={stat.color}>{stat.icon}</div>
                    <span className="text-2xl font-bold font-mono text-card-foreground">{stat.value}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <Card key={i} className="bg-card border-border card-hover">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <div className={stat.color}>{stat.icon}</div>
                  <span className="text-2xl font-bold font-mono text-card-foreground">{stat.value}</span>
                </div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          )
        )}
      </div>

      {/* ── Active Labs ───────────────────────────────────────── */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-card-foreground">{t('activeLabs')}</CardTitle>
              <CardDescription className="text-muted-foreground">{t('continueJourney')}</CardDescription>
            </div>
            <Link to="/dashboard/labs">
              <Button className="bg-accent hover:bg-accent/80 text-accent-foreground font-semibold">
                <Play className="w-4 h-4 mr-2" />
                {t('newLab')}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeLabs.map((lab) => (
              <div
                key={lab.id}
                className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      lab.status === 'running' ? 'bg-accent' :
                      lab.status === 'stopped'  ? 'bg-yellow-500' :
                      'bg-muted-foreground'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold mb-1 text-foreground truncate">{lab.name}</h4>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                      <span className="font-mono">
                        {t('status')}:{' '}
                        <span className={
                          lab.status === 'running' ? 'text-accent' :
                          lab.status === 'stopped'  ? 'text-yellow-500' :
                          'text-muted-foreground'
                        }>
                          {lab.status === 'completed' ? t('completed') :
                           lab.status === 'running'   ? t('running') :
                           t('stopped')}
                        </span>
                      </span>
                      <span>•</span>
                      <span className="font-mono">{t('score')}: {lab.score}%</span>
                      <span>•</span>
                      <span>{t('progress')}: {lab.progress}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {lab.score > 0 && (
                    <Badge variant="outline" className="font-mono text-accent border-accent/30">
                      {lab.score}%
                    </Badge>
                  )}
                  <Link to={`/lab/${lab.labId}`}>
                    <Button
                      size="sm"
                      className={
                        lab.status === 'running'
                          ? 'bg-primary hover:bg-primary/80 text-primary-foreground'
                          : 'bg-accent hover:bg-accent/80 text-accent-foreground'
                      }
                    >
                      {lab.status === 'running'
                        ? <CircleDot className="w-4 h-4 mr-2" />
                        : <Play      className="w-4 h-4 mr-2" />}
                      {lab.status === 'running' ? t('resume') : t('start')}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            {activeLabs.length === 0 && !error && (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-3">{t('noActiveLabs')}</p>
                <Link to="/dashboard/labs">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                    <Play className="w-4 h-4 mr-2" />
                    {t('browseLabs')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Completed Labs ────────────────────────────────────── */}
      {completedLabs.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-card-foreground">{t('completedLabs')}</CardTitle>
                <CardDescription className="text-muted-foreground">{t('reviewCompleted')}</CardDescription>
              </div>
              {completedLabs.length > 5 && (
                <Link to="/dashboard/labs">
                  <Button variant="ghost" className="text-primary hover:text-primary/80">
                    {t('viewAll')}
                  </Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCompleted.map((lab) => (
                <div
                  key={lab.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold mb-1 text-foreground truncate">{lab.name}</h4>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                        <span className="font-mono">
                          {t('status')}:{' '}
                          <span className="text-accent">{t('completed')}</span>
                        </span>
                        <span>•</span>
                        <span className="font-mono">{t('score')}: {lab.score}%</span>
                        <span>•</span>
                        <span>{t('progress')}: 100%</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-auto">
                    {lab.score > 0 && (
                      <Badge variant="outline" className="font-mono text-accent border-accent/30">
                        {lab.score}%
                      </Badge>
                    )}
                    <Link to={`/lab/${lab.labId}`}>
                      <Button size="sm" variant="secondary">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t('reviewLab')}
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
