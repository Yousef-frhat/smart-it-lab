import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Language, translations, Translations } from '@/app/utils/translations';
import api from '@/app/services/api';
import { toast } from 'sonner';
import { applyLanguage } from '@/app/i18n/index';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: keyof Translations) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const VALID_LANGUAGES: Language[] = ['en', 'ar', 'es', 'fr', 'de', 'zh'];

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isInitialized, setIsInitialized] = useState(false);

  // Apply direction to document root
  const applyDirection = useCallback((lang: Language) => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, []);

  // Initialize language from localStorage or user settings
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as Language | null;
    if (savedLang && VALID_LANGUAGES.includes(savedLang)) {
      setLanguageState(savedLang);
      applyDirection(savedLang);
      applyLanguage(savedLang);
    } else {
      applyLanguage('en');
    }
    setIsInitialized(true);
  }, [applyDirection]);

  // Translation function
  const t = useCallback((key: keyof Translations): string => {
    return translations[language]?.[key] || translations['en'][key] || key;
  }, [language]);

  // Set language and persist to backend
  const setLanguage = useCallback(async (lang: Language) => {
    try {
      // Update local state immediately for instant UI feedback
      setLanguageState(lang);
      applyDirection(lang);
      localStorage.setItem('language', lang);
      applyLanguage(lang);

      // Persist to backend
      await api.patch('/settings', { language: lang });
    } catch (error) {
      console.error('Failed to save language preference:', error);
      toast.error('Failed to save language preference');
    }
  }, [applyDirection]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  // Don't render children until language is initialized
  if (!isInitialized) {
    return null;
  }

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
