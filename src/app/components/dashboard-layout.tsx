import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import {
  Network, BarChart3, BookOpen, Trophy, Award,
  Settings, LogOut, Languages, Sun, Moon, Menu, X,
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

  // Mobile/tablet sidebar drawer state
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  const closeSidebar = () => setSidebarOpen(false);

  const navItems = [
    { path: '/dashboard',              icon: BarChart3, label: t('dashboard')    },
    { path: '/dashboard/labs',         icon: BookOpen,  label: t('myLabs')       },
    { path: '/dashboard/achievements', icon: Trophy,    label: t('achievements') },
    { path: '/dashboard/leaderboard',  icon: Award,     label: t('leaderboard') },
    { path: '/dashboard/settings',     icon: Settings,  label: t('settings')    },
  ];

  const { icon: ThemeIcon, nextLabel, nextTheme } = THEME_META[theme];

  // Off-canvas transform: hidden off-screen on mobile, always visible on lg.
  const hiddenTransform = isRTL ? 'translate-x-full' : '-translate-x-full';
  const sidebarSideClass = isRTL
    ? 'right-0 border-l border-sidebar-border'
    : 'left-0 border-r border-sidebar-border';

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── Mobile top bar (hamburger) — hidden on lg ───────────── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 flex items-center justify-between px-4 bg-sidebar border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2" onClick={closeSidebar}>
          <Network className="w-5 h-5 text-accent shrink-0" />
          <span className="font-mono text-lg tracking-tight">Smart IT Lab</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Toggle menu"
          onClick={() => setSidebarOpen((o) => !o)}
          className="text-sidebar-foreground"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </header>

      {/* ── Backdrop (mobile only, when drawer open) ────────────── */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 h-screen w-64 max-w-[80vw] bg-sidebar text-sidebar-foreground
          flex flex-col z-40 transition-transform duration-300 ease-in-out
          ${sidebarSideClass}
          ${sidebarOpen ? 'translate-x-0' : `${hiddenTransform} lg:translate-x-0`}`}
      >
        {/* Logo + close (close only shows on mobile) */}
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" onClick={closeSidebar}>
            <Network className="w-6 h-6 text-accent shrink-0" />
            <span className="font-mono text-xl tracking-tight text-sidebar-foreground">
              Smart IT Lab
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Close menu"
            onClick={closeSidebar}
            className="lg:hidden text-sidebar-foreground -mr-2"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => (
            <Link key={path} to={path} onClick={closeSidebar}>
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

          {/* Theme toggle — dark ↔ light */}
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
      {/*
       * On mobile: full width, top padding for the fixed mobile header.
       * On lg+: leave room for the fixed 16rem sidebar (margin start).
       */}
      <main
        className={`bg-background min-h-screen p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8
          ${isRTL ? 'lg:mr-64' : 'lg:ml-64'}`}
      >
        {children}
      </main>
    </div>
  );
}
