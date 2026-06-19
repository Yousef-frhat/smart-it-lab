# Design: Full Multi-Language Support

## Architecture

The language system uses a plain TypeScript translations object + React Context. No external i18n library.

```
translations.ts          ← Static data: all 6 language objects
language-context.tsx     ← Provider: state, localStorage, direction, API sync
dashboard-layout.tsx     ← Consumes context: sidebar language button
settings.tsx             ← Consumes context: language dropdown + translated text
```

## File Changes

### 1. `src/app/utils/translations.ts` — Full rewrite

**Type changes:**
```ts
export type Language = 'en' | 'ar' | 'es' | 'fr' | 'de' | 'zh';
```

**Interface additions** (keys needed for settings page translation):
```ts
export interface Translations {
  // existing keys stay...
  
  // Settings page appearance tab
  chooseColorScheme: string;
  selectLanguage: string;
  
  // Settings page - save buttons
  saveChanges: string;
  savePreferences: string;
  saving: string;
  
  // Danger zone
  dangerZoneDesc: string;
  
  // Language names (for sidebar button)
  langNameEn: string;
  langNameAr: string;
  langNameEs: string;
  langNameFr: string;
  langNameDe: string;
  langNameZh: string;
}
```

**Translation objects:** All 6 languages (`en`, `ar`, `es`, `fr`, `de`, `zh`) with every key populated.

### 2. `src/app/contexts/language-context.tsx` — Targeted fixes

**Fix 1 — Language type:**
```ts
import { Language, translations, Translations } from '@/app/utils/translations';
// Language is now 'en' | 'ar' | 'es' | 'fr' | 'de' | 'zh'
```

**Fix 2 — localStorage validation:**
```ts
const VALID_LANGUAGES: Language[] = ['en', 'ar', 'es', 'fr', 'de', 'zh'];

useEffect(() => {
  const savedLang = localStorage.getItem('language') as Language | null;
  if (savedLang && VALID_LANGUAGES.includes(savedLang)) {
    setLanguageState(savedLang);
    applyDirection(savedLang);
  }
  setIsInitialized(true);
}, [applyDirection]);
```

**Fix 3 — applyDirection handles all languages:**
```ts
const applyDirection = useCallback((lang: Language) => {
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = lang;
}, []);
```

**Fix 4 — t() fallback to English:**
```ts
const t = useCallback((key: keyof Translations): string => {
  return translations[language]?.[key] || translations['en'][key] || key;
}, [language]);
```

### 3. `src/app/components/dashboard-layout.tsx` — Sidebar language button

**Current behavior:** Toggles only between `en` and `ar`.

**New behavior:** Cycles through all 6 languages in order.

```ts
const LANGUAGE_CYCLE: Language[] = ['en', 'ar', 'es', 'fr', 'de', 'zh'];

const cycleLanguage = () => {
  const currentIndex = LANGUAGE_CYCLE.indexOf(language);
  const nextIndex = (currentIndex + 1) % LANGUAGE_CYCLE.length;
  setLanguage(LANGUAGE_CYCLE[nextIndex]);
};
```

**Button label:** Shows the name of the current language using a translation key or a static map:
```ts
const LANGUAGE_NAMES: Record<Language, string> = {
  en: 'English', ar: 'العربية', es: 'Español', fr: 'Français', de: 'Deutsch', zh: '中文'
};
// Display: LANGUAGE_NAMES[language]
```

### 4. `src/app/pages/settings.tsx` — Translated text + language fix

**Fix 1 — `handleSaveAppearance` uses `currentLanguage` from context:**
```ts
// BEFORE (broken — `language` is undefined local variable):
await api.patch('/settings', { theme, language });

// AFTER (correct):
await api.patch('/settings', { theme, language: currentLanguage });
```

**Fix 2 — Language dropdown `onValueChange` accepts all 6 codes:**
```ts
<Select value={currentLanguage} onValueChange={(val) => setLanguage(val as Language)}>
```

**Fix 3 — Translate UI strings** using `t()`:
- Tab triggers: `t('profile')`, `t('notifications')`, `t('appearance')`, `t('privacy')`
- Appearance labels: `t('theme')`, `t('language')`, `t('chooseColorScheme')`, `t('selectLanguage')`
- Save buttons: `t('saveSettings')`, `t('saveChanges')`, `t('savePreferences')`
- Danger zone: `t('dangerZone')`, `t('deleteAccountDesc')`, `t('deleteAccount')`

## Translation Data

### Keys to translate across all 6 languages

| Key | EN | AR | ES | FR | DE | ZH |
|-----|----|----|----|----|----|----|
| dashboard | Dashboard | لوحة التحكم | Panel | Tableau de bord | Dashboard | 仪表板 |
| myLabs | My Labs | معاملي | Mis Labs | Mes Labs | Meine Labs | 我的实验室 |
| achievements | Achievements | الإنجازات | Logros | Réalisations | Erfolge | 成就 |
| leaderboard | Leaderboard | لوحة المتصدرين | Clasificación | Classement | Rangliste | 排行榜 |
| settings | Settings | الإعدادات | Configuración | Paramètres | Einstellungen | 设置 |
| lightMode | Light Mode | الوضع الفاتح | Modo Claro | Mode Clair | Heller Modus | 浅色模式 |
| darkMode | Dark Mode | الوضع الداكن | Modo Oscuro | Mode Sombre | Dunkler Modus | 深色模式 |
| signOut | Sign Out | تسجيل الخروج | Cerrar Sesión | Se Déconnecter | Abmelden | 退出登录 |
| profile | Profile | الملف الشخصي | Perfil | Profil | Profil | 个人资料 |
| notifications | Notifications | الإشعارات | Notificaciones | Notifications | Benachrichtigungen | 通知 |
| appearance | Appearance | المظهر | Apariencia | Apparence | Erscheinungsbild | 外观 |
| privacy | Privacy | الخصوصية | Privacidad | Confidentialité | Datenschutz | 隐私 |
| theme | Theme | السمة | Tema | Thème | Design | 主题 |
| language | Language | اللغة | Idioma | Langue | Sprache | 语言 |
| saveSettings | Save Settings | حفظ الإعدادات | Guardar Config. | Enregistrer | Einstellungen speichern | 保存设置 |
| saveChanges | Save Changes | حفظ التغييرات | Guardar Cambios | Enregistrer | Änderungen speichern | 保存更改 |
| savePreferences | Save Preferences | حفظ التفضيلات | Guardar Preferencias | Enregistrer | Einstellungen speichern | 保存偏好 |
| dangerZone | Danger Zone | منطقة الخطر | Zona de Peligro | Zone Dangereuse | Gefahrenzone | 危险区域 |
| deleteAccount | Delete Account | حذف الحساب | Eliminar Cuenta | Supprimer le Compte | Konto löschen | 删除账户 |
| deleteAccountDesc | Permanently delete your account and all data | حذف حسابك وجميع بياناتك نهائياً | Eliminar permanentemente tu cuenta y datos | Supprimer définitivement votre compte | Konto und alle Daten dauerhaft löschen | 永久删除您的账户和所有数据 |
| chooseColorScheme | Choose your preferred color scheme | اختر نظام الألوان المفضل لديك | Elige tu esquema de colores | Choisissez votre palette | Farbschema wählen | 选择您偏好的配色方案 |
| selectLanguage | Select your preferred language | اختر لغتك المفضلة | Selecciona tu idioma | Sélectionnez votre langue | Sprache auswählen | 选择您偏好的语言 |
| saving | Saving... | جارٍ الحفظ... | Guardando... | Enregistrement... | Speichern... | 保存中... |
| cancel | Cancel | إلغاء | Cancelar | Annuler | Abbrechen | 取消 |
| delete | Delete | حذف | Eliminar | Supprimer | Löschen | 删除 |

## No External Dependencies

This implementation uses only:
- Plain TypeScript objects for translations
- React Context for state management
- `localStorage` for persistence
- Existing `api` Axios instance for backend sync

No i18next, react-i18next, or any other i18n library is added.
