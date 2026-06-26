import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '@/app/services/api';
import { toast } from 'sonner';
import { applyTheme } from '@/app/utils/apply-theme';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatar?: string;
  plan?: 'free' | 'pro' | 'enterprise';
  createdAt: string;
  streak?: number;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithProvider: (provider: 'github' | 'google') => void;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── Restore session on mount via GET /auth/me ──────────────────
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsLoading(false);
      return;
    }

    api
      .get('/auth/me')
      .then((res) => {
        const u = res.data.data?.user ?? res.data.user;
        if (u) {
          setUser(normalizeUser(u));
          // Apply saved theme immediately so the UI matches user preferences
          applyTheme(u.settings?.theme === 'light' ? 'light' : 'dark');
        }
      })
      .catch((err) => {
        console.warn("Session restore failed (token invalid/expired):", err);
        localStorage.removeItem('accessToken');
      })
      .finally(() => setIsLoading(false));
  }, []);

  // ── (OAuth tokens are now handled by /auth/callback page) ────────

  // ── LOGIN ──────────────────────────────────────────────────────
  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    const payload = data.data ?? data;
    const accessToken = payload.accessToken;

    localStorage.setItem('accessToken', accessToken);
    setUser(normalizeUser(payload.user));
    // Apply the user's saved theme preference immediately
    applyTheme(payload.user?.settings?.theme === 'light' ? 'light' : 'dark');
    toast.success('Logged in successfully!');
  };

  // ── REGISTER ───────────────────────────────────────────────────
  const register = async (name: string, email: string, password: string) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    const payload = data.data ?? data;
    const accessToken = payload.accessToken;

    localStorage.setItem('accessToken', accessToken);
    setUser(normalizeUser(payload.user));
    // New users default to dark theme
    applyTheme('dark');
    toast.success('Account created successfully!');
  };

  // ── SOCIAL LOGIN (redirect to backend OAuth) ──────────────────
  const loginWithProvider = (provider: 'github' | 'google') => {
    const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    window.location.href = `${baseURL}/auth/${provider}`;
  };

  // ── LOGOUT ─────────────────────────────────────────────────────
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Even if the request fails, clear local state
    }
    localStorage.removeItem('accessToken');
    setUser(null);
    toast.success('Logged out');
  };

  // ── UPDATE USER (for avatar, name changes, etc.) ───────────────
  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...partial } : prev));
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    loginWithProvider,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// ── Helper: normalize backend user shape to frontend User type ──
function normalizeUser(raw: any): User {
  return {
    id: raw.id ?? raw._id ?? '',
    name: raw.name ?? '',
    email: raw.email ?? '',
    role: raw.role ?? 'student',
    avatar: raw.avatar,
    plan: raw.plan ?? 'free',
    createdAt: raw.createdAt ?? new Date().toISOString(),
    streak: raw.streak,
  };
}