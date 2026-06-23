/**
 * ThemeContext — dark / light mode management.
 *
 * Only two modes are supported: 'dark' and 'light'. (The previous
 * 'auto'/system option has been removed.) The preference is persisted to
 * localStorage and applied to <html> via applyTheme().
 */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { applyTheme } from '@/app/utils/apply-theme';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;                    // the stored preference ('dark' | 'light')
  resolvedTheme: Theme;            // what is actually applied (same as theme now)
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Normalise any persisted value (including legacy 'auto') to a valid theme.
function readStoredTheme(): Theme {
  try {
    const saved = localStorage.getItem('theme');
    return saved === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  // Apply theme class + persist whenever the preference changes
  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* ignore storage errors (private mode, etc.) */
    }
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t === 'light' ? 'light' : 'dark');

  const toggleTheme = () =>
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider
      value={{ theme, resolvedTheme: theme, toggleTheme, setTheme }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
