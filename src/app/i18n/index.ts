import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ar from './locales/ar.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import zh from './locales/zh.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      es: { translation: es },
      fr: { translation: fr },
      de: { translation: de },
      zh: { translation: zh },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ar', 'es', 'fr', 'de', 'zh'],
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      // Order: localStorage first, then browser
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  });

/**
 * Apply language to the document:
 * - Sets html[lang] attribute
 * - Sets html[dir] for RTL (Arabic)
 * - Persists to localStorage
 */
export function applyLanguage(lang: string): void {
  i18n.changeLanguage(lang);
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  localStorage.setItem('i18nextLng', lang);
}

export default i18n;
