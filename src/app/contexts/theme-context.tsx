/**
 * ThemeContext — dark / light / system (auto) mode management.
 *
 * "system" follows the OS preference via prefers-color-scheme and
 * updates automatically when the OS preference changes at runtime.
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { applyTheme } from '@/app/utils/apply-theme';

export type Theme = 'dark' | 'light' | 'auto';

interface ThemeContextType {
  theme: Theme;          // the stored preference ('dark' | 'light' | 'auto')
  resolvedTheme: 'dark' | 'light'; // what is actually applied right now
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Cycles: dark → light → auto → dark → …
const CYCLE: Theme[] = ['dark', 'light', 'auto'];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem('theme') as Theme | null;
      if (saved === 'light' || saved === 'auto') return saved;
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  // Resolved = what is actually rendered (never 'auto')
  const getResolved = useCallback(
    (t: Theme): 'dark' | 'light' => {
      if (t !== 'auto') return t;
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    },
    []
  );

  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() =>
    getResolved(
      (() => {
        try {
          const saved = localStorage.getItem('theme') as Theme | null;
          if (saved === 'light' || saved === 'auto') return saved;
          return 'dark';
        } catch {
          return 'dark';
        }
      })()
    )
  );

  // Apply theme class + persist whenever preference changes
  useEffect(() => {
    const resolved = getResolved(theme);
    setResolvedTheme(resolved);
    applyTheme(theme);
    localStorage.setItem('theme', theme);
  }, [theme, getResolved]);

  // When theme === 'auto', re-resolve if the OS preference changes at runtime
  useEffect(() => {
    if (theme !== 'auto') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const resolved = mq.matches ? 'dark' : 'light';
      setResolvedTheme(resolved);
      applyTheme('auto'); // reapplies the correct class
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const idx = CYCLE.indexOf(prev);
      return CYCLE[(idx + 1) % CYCLE.length];
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
