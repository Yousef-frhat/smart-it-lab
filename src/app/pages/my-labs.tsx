import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Input } from "@/app/components/ui/input";
import { Progress } from "@/app/components/ui/progress";
import {
  Play, CircleDot, Search,
  Clock, Award, BookOpen, CheckCircle, Circle,
} from "lucide-react";
import { useLabs } from "@/app/contexts/labs-context";
import { useLanguage } from "@/app/contexts/language-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { LoadingSpinner } from "@/app/components/loading-spinner";
import { PageHeader } from "@/app/components/page-header";
import { StatCard } from "@/app/components/stat-card";
import { getDifficultyColor } from "@/app/utils/color-helpers";
import { useRefreshOnNavigate } from "@/app/hooks/useRefreshOnNavigate";

export default function MyLabs() {
  const { labs, isLoading, avgScore, completedCount, inProgressCount, refresh } = useLabs();
  const { t } = useLanguage();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useRefreshOnNavigate(refresh);

  // Derived filtered list
  const filteredLabs = labs.filter((lab) => {
    if (
      searchQuery &&
      !lab.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !lab.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (statusFilter !== 'all' && lab.status !== statusFilter) return false;
    if (difficultyFilter !== 'all' && lab.difficulty !== difficultyFilter) return false;
    if (categoryFilter !== 'all' && lab.category !== categoryFilter) return false;
    return true;
  });

  const categories = Array.from(new Set(labs.map((lab) => lab.category)));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-accent" />;
      case 'running': return <CircleDot className="w-5 h-5 text-primary animate-pulse" />;
      case 'stopped': return <Clock className="w-5 h-5 text-[#F59E0B]" />;
      default: return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title={t('labsTitle')} subtitle={t('labsSubtitle')} />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label={t('totalLabs')}
          value={labs.length.toString()}
          icon={<BookOpen className="w-8 h-8 text-primary" />}
        />
        <StatCard
          label={t('completed')}
          value={completedCount.toString()}
          icon={<CheckCircle className="w-8 h-8 text-accent" />}
          valueClassName="text-accent"
        />
        <StatCard
          label={t('inProgress')}
          value={inProgressCount.toString()}
          icon={<CircleDot className="w-8 h-8 text-primary" />}
          valueClassName="text-primary"
        />
        <StatCard
          label={t('avgScore')}
          value={`${avgScore}%`}
          icon={<Award className="w-8 h-8 text-[#F59E0B]" />}
          valueClassName="text-[#F59E0B]"
        />
      </div>

      {/* Filters */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-background border-border">
                <SelectValue placeholder={t('allStatus')} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">{t('allStatus')}</SelectItem>
                <SelectItem value="not-started">{t('notCompleted')}</SelectItem>
                <SelectItem value="running">{t('running')}</SelectItem>
                <SelectItem value="stopped">{t('stopped')}</SelectItem>
                <SelectItem value="completed">{t('completed')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-background border-border">
                <SelectValue placeholder={t('allLevels')} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">{t('allLevels')}</SelectItem>
                <SelectItem value="beginner">{t('beginner')}</SelectItem>
                <SelectItem value="intermediate">{t('intermediate')}</SelectItem>
                <SelectItem value="advanced">{t('advanced')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px] bg-background border-border">
                <SelectValue placeholder={t('allCategories')} />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">{t('allCategories')}</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Labs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLabs.map((lab) => (
          <Card
            key={lab.id}
            className="bg-card border-border hover:border-primary transition-colors"
          >
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(lab.status)}
                  <CardTitle className="text-xl">{lab.name}</CardTitle>
                </div>
                <Badge className={getDifficultyColor(lab.difficulty)}>
                  {lab.difficulty}
                </Badge>
              </div>
              <CardDescription className="text-muted-foreground">
                {lab.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {lab.category}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {lab.estimatedTime}
                  </span>
                  {lab.score > 0 && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-[#F59E0B]" />
                        {lab.score}%
                      </span>
                    </>
                  )}
                </div>

                {lab.progress > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">{t('progress')}</span>
                      <span className="font-mono text-accent">{lab.progress}%</span>
                    </div>
                    <Progress value={lab.progress} className="h-2" />
                  </div>
                )}

                <div>
                  <p className="text-sm text-muted-foreground mb-2">{t('objectives')}:</p>
                  <ul className="space-y-1">
                    {lab.objectives.slice(0, 3).map((obj, idx) => (
                      <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                        <span className="text-accent mt-1">•</span>
                        <span>{obj}</span>
                      </li>
                    ))}
                    {lab.objectives.length > 3 && (
                      <li className="text-sm text-muted-foreground">
                        {t('more').replace('{count}', (lab.objectives.length - 3).toString())}
                      </li>
                    )}
                  </ul>
                </div>

                <Link to={`/lab/${lab.labId}`}>
                  <Button
                    className={`w-full ${
                      lab.status === 'running'
                        ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white'
                        : lab.status === 'completed'
                        ? 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                        : 'bg-[#00FF41] hover:bg-[#00DD35] text-[#0F172A]'
                    }`}
                  >
                    {lab.status === 'running' ? (
                      <><CircleDot className="w-4 h-4 mr-2" />{t('resumeLab')}</>
                    ) : lab.status === 'completed' ? (
                      <><CheckCircle className="w-4 h-4 mr-2" />{t('reviewLab')}</>
                    ) : (
                      <><Play className="w-4 h-4 mr-2" />{t('startLab')}</>
                    )}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLabs.length === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="pt-12 pb-12 text-center">
            <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t('noLabsFound')}</h3>
            <p className="text-muted-foreground mb-4">{t('adjustFilters')}</p>
            <Button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setDifficultyFilter('all');
                setCategoryFilter('all');
              }}
              className="bg-[#3B82F6] hover:bg-[#2563EB] text-white"
            >
              {t('clearFilters')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
