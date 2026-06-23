import { ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import {
  Network, BarChart3, BookOpen, Trophy, Award,
  Settings, LogOut, Languages, Sun, Moon,
} from "lucide-react";
import { useAuth } from "@/app/contexts/auth-context";
import { useTheme } from "@/app/contexts/theme-context";
import { useLanguage } from "@/app/contexts/language-context";
import { Language } from "@/app/utils/translations";
import type { Theme } from "@/app/contexts/theme-context";

interface DashboardLayoutProps {
  children: ReactNode;
}

// ── Theme toggle config (dark ↔ light only) ──────────────────────
const THEME_META: Record<
  Theme,
  { icon: typeof Sun; nextLabel: string; nextTheme: Theme }
> = {
  dark:  { icon: Sun,  nextLabel: 'Light Mode', nextTheme: 'light' },
  light: { icon: Moon, nextLabel: 'Dark Mode',  nextTheme: 'dark'  },
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const navigate  = useNavigate();
  const location  = useLocation();

  const isRTL = language === 'ar';

  const LANGUAGE_CYCLE: Language[] = ['en', 'ar', 'es', 'fr', 'de', 'zh'];
  const LANGUAGE_NAMES: Record<Language, string> = {
    en: 'English', ar: 'العربية', es: 'Español',
    fr: 'Français', de: 'Deutsch', zh: '中文',
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cycleLanguage = () => {
    const idx = LANGUAGE_CYCLE.indexOf(language);
    setLanguage(LANGUAGE_CYCLE[(idx + 1) % LANGUAGE_CYCLE.length]);
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/dashboard',              icon: BarChart3, label: t('dashboard')    },
    { path: '/dashboard/labs',         icon: BookOpen,  label: t('myLabs')       },
    { path: '/dashboard/achievements', icon: Trophy,    label: t('achievements') },
    { path: '/dashboard/leaderboard',  icon: Award,     label: t('leaderboard') },
    { path: '/dashboard/settings',     icon: Settings,  label: t('settings')    },
  ];

  const { icon: ThemeIcon, nextLabel, nextTheme } = THEME_META[theme];

  return (
    /*
     * bg-background / text-foreground come from the CSS variables in theme.css.
     * When html.light is set they resolve to white + dark text.
     * When html.dark  is set they resolve to #0F172A + light text.
     */
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside
        className="fixed top-0 h-screen w-64 bg-sidebar text-sidebar-foreground border-sidebar-border flex flex-col z-10"
        style={{
          [isRTL ? 'right' : 'left']: 0,
          borderRightWidth: isRTL ? 0 : 1,
          borderLeftWidth:  isRTL ? 1 : 0,
          borderStyle: 'solid',
        }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-2">
            <Network className="w-6 h-6 text-accent shrink-0" />
            <span className="font-mono text-xl tracking-tight text-sidebar-foreground">
              Smart IT Lab
            </span>
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link key={path} to={path}>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-2 text-sidebar-foreground
                  ${isActive(path)
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent'
                    : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
              >
                <Icon
                  className={`w-4 h-4 shrink-0 ${isActive(path) ? 'text-accent' : ''}`}
                />
                <span>{label}</span>
              </Button>
            </Link>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="p-4 border-t border-sidebar-border space-y-2">

          {/* Theme toggle — cycles dark → light → system */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={() => setTheme(nextTheme)}
            title={nextLabel}
          >
            <ThemeIcon className="w-4 h-4 shrink-0" />
            <span className="text-sm">{nextLabel}</span>
          </Button>

          {/* Language toggle */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent"
            onClick={cycleLanguage}
          >
            <Languages className="w-4 h-4 shrink-0" />
            <span className="font-mono text-sm">{LANGUAGE_NAMES[language]}</span>
          </Button>

          {/* Sign out */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-destructive hover:bg-sidebar-accent hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>{t('signOut')}</span>
          </Button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────── */}
      <main
        className="p-8 bg-background min-h-screen"
        style={{ [isRTL ? 'marginRight' : 'marginLeft']: '16rem' }}
      >
        {children}
      </main>
    </div>
  );
}
