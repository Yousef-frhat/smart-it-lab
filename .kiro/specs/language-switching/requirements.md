# Requirements: Full Multi-Language Support (6 Languages)

## Overview
The language dropdown in Settings shows 6 languages but only English and Arabic are partially implemented. This spec extends the system to make all 6 languages fully functional with proper RTL/LTR support, persistent storage, and complete UI translation coverage.

## Requirements

### REQ-1: Language Type and Translation Coverage
The `Language` type must include all 6 supported languages: `'en' | 'ar' | 'es' | 'fr' | 'de' | 'zh'`.

The `translations.ts` file must contain complete translation objects for all 6 languages covering every key in the `Translations` interface.

**Acceptance criteria:**
- `Language` type = `'en' | 'ar' | 'es' | 'fr' | 'de' | 'zh'`
- All 6 language objects exist in `translations` record
- Every key in `Translations` interface has a non-empty value in every language
- Missing keys fall back to English (handled in `t()` function)

### REQ-2: Language Context — All 6 Languages Supported
The `LanguageProvider` must:
- Accept and apply any of the 6 supported languages
- Persist the selected language to `localStorage` (key: `'language'`)
- Apply `document.documentElement.dir = 'rtl'` for Arabic, `'ltr'` for all others
- Apply `document.documentElement.lang` to the selected language code
- On initialization, restore from `localStorage` if a valid language is stored
- Call `PATCH /api/settings { language }` to persist to backend (fire-and-forget with error toast on failure)
- The `setLanguage` function must accept all 6 language codes

**Acceptance criteria:**
- Selecting any of the 6 languages updates UI text immediately
- Arabic sets `dir="rtl"` on `<html>`; all others set `dir="ltr"`
- Language survives page refresh (localStorage)
- Backend is notified on every language change

### REQ-3: Settings Page — Language Dropdown Functional
The Settings page Appearance tab language `<Select>` must:
- Show all 6 language options with native names
- Calling `onValueChange` with any of the 6 codes calls `setLanguage(lang)` from context
- The `handleSaveAppearance` function sends `{ theme, language: currentLanguage }` to `PATCH /api/settings`
- The `language` variable used in `handleSaveAppearance` must reference `currentLanguage` from context (not a stale local variable)

**Acceptance criteria:**
- Selecting a language in Settings dropdown changes UI text immediately
- Save Settings button persists both theme and language to backend
- No TypeScript errors from passing unsupported language codes

### REQ-4: Settings Page — Translated UI Text
The Settings page must use `t(key)` for all user-visible text strings listed below:

**Tabs:** Profile, Notifications, Appearance, Privacy

**Appearance tab:**
- "Theme" label
- "Choose your preferred color scheme" description
- "Language" label  
- "Select your preferred language" description
- "Save Settings" button text

**Danger Zone:**
- "Danger Zone" card title
- "Permanently delete your account and all data" description
- "Delete Account" button text

**Common:**
- "Save Changes" / "Save Settings" / "Save Preferences" buttons
- Loading states ("Saving...")

**Acceptance criteria:**
- All listed strings render in the active language
- No hardcoded English strings remain for the listed elements

### REQ-5: Dashboard Sidebar — Language Button Shows Current Language
The sidebar language toggle button must:
- Display the name of the **current** language (not just toggle between EN/AR)
- Clicking it cycles to the next language in the sequence: en → ar → es → fr → de → zh → en
- OR: open a small inline picker (implementation choice — cycling is simpler)

**Acceptance criteria:**
- Button label reflects the currently active language
- Clicking changes to a different language
- Button stays in sync when language is changed from Settings page

### REQ-6: App Load — Restore Saved Language
On application startup, before rendering the main UI:
- Read `localStorage.getItem('language')`
- If valid (one of the 6 codes), apply it immediately (direction + lang attribute)
- If not set, default to `'en'`
- The `LanguageProvider` must not render children until initialization is complete (prevents flash)

**Acceptance criteria:**
- Refreshing the page preserves the selected language
- No flash of wrong language/direction on load
- Arabic RTL layout is applied immediately on load if Arabic was saved
