# Requirements: Full Multi-Page Translation (All 6 Languages)

## Overview
The existing language infrastructure supports `en` and `ar` via `react-i18next` JSON locale files. Most page components already use `useTranslation()` with namespaced keys. The gaps are:
1. Locale files for `es`, `fr`, `de`, `zh` do not exist — i18next falls back to English for all 4 languages.
2. The i18n config only registers `['en', 'ar']` as supported languages.
3. The `LanguageContext` (custom system) and `react-i18next` are not bridged — changing language via the sidebar or settings does not update i18next.
4. `lab-interface.tsx` has no `useTranslation()` calls — all UI strings are hardcoded English.
5. `settings.tsx` has many hardcoded English strings not yet using `t()`.
6. `admin-dashboard.tsx` has all strings hardcoded in English.

## Requirements

### REQ-1: Add Locale Files for es, fr, de, zh
Create `src/app/i18n/locales/es.json`, `fr.json`, `de.json`, `zh.json` with complete translations for every key present in `en.json`.

Namespaces to cover: `nav`, `dashboard`, `labs`, `achievements`, `leaderboard`, `settings`, `auth`, `common`.

**Acceptance criteria:**
- All 4 files exist and are valid JSON
- Every key present in `en.json` has a non-empty translated value in each file
- No TypeScript/build errors

### REQ-2: Update i18n Config to Support All 6 Languages
Update `src/app/i18n/index.ts` to:
- Import all 6 locale JSON files
- Register all 6 in the `resources` object
- Set `supportedLngs: ['en', 'ar', 'es', 'fr', 'de', 'zh']`

**Acceptance criteria:**
- `i18n.changeLanguage('es')` renders Spanish text
- `i18n.changeLanguage('zh')` renders Chinese text
- Build passes with 0 errors

### REQ-3: Bridge LanguageContext with react-i18next
Update `src/app/contexts/language-context.tsx` so that whenever `setLanguage(lang)` is called, it also calls `applyLanguage(lang)` from `src/app/i18n/index.ts`. This ensures both systems stay in sync.

Also update initialization: on mount, call `applyLanguage(savedLang)` so i18next is initialized with the persisted language.

**Acceptance criteria:**
- Clicking the sidebar language button changes text in ALL pages (both systems)
- Selecting a language in Settings changes text in ALL pages
- Refreshing the page restores the correct language in both systems
- Arabic sets `dir="rtl"` on `<html>`

### REQ-4: Translate lab-interface.tsx
Add `useTranslation()` to `lab-interface.tsx` and replace all hardcoded English strings with `t()` calls. Add the required keys to all locale files.

Strings to translate:
- "Lab Submitted ✅" → modal title
- "Your Score" → modal label
- "Objectives Completed:" → modal label
- "Close" → modal button
- "Back" → top bar button
- "Running" → status badge
- "Stop Lab" → button
- "Starting..." → loading state
- "Start Lab" → button
- "Time:" → label
- "Lab Instructions" → left panel title
- "Progress: X/Y objectives completed" → progress text
- "Objectives" → section title
- "Not completed" → objective label
- "Useful Commands" → card title
- "Network Topology" → center panel title
- "Live Validation" → right panel title
- "Current Score" → score card label
- "Objectives completed" → score card label
- "Start completing objectives to see your live score" → empty state
- "Submit Lab" → button
- "Submitting..." → loading state
- "Submitted" → submitted state
- "Complete at least 1 objective to submit" → hint text
- "Type command here..." → terminal placeholder
- "Start lab to enter commands" → terminal placeholder (stopped state)
- Score labels: "Excellent", "In Progress", "Not Completed"
- "Evaluating Lab..." / "This may take a few moments" → evaluating card
- "Run commands in the terminal to validate objectives" → empty validation state
- "X objective(s) remaining" → remaining objectives text

**Acceptance criteria:**
- All listed strings render in the active language
- No hardcoded English strings remain in the component's JSX
- Build passes with 0 errors

### REQ-5: Translate settings.tsx Remaining Strings
Replace all remaining hardcoded English strings in `settings.tsx` with `t()` calls using the `settings.*` namespace already in `en.json`.

Strings to translate (using existing keys where available, adding new ones where needed):
- "Settings" → page title (use `settings.title`)
- "Manage your account preferences..." → subtitle (use `settings.subtitle`)
- "Upload Photo" / "Uploading..." → avatar button
- "JPG, PNG or WebP. Max size 2MB." → avatar hint
- "Full Name" → label
- "Email Address" → label
- "Account Type" → label
- "Administrator" / "Student Account" → role labels
- "Plan" → label
- "Change Password" → section title
- "Current Password" / "New Password" / "Confirm New Password" → labels
- "Changing..." → loading state
- "Email Notifications" / "Receive notifications via email" → toggle
- "Lab Reminders" / "Get reminded about incomplete labs" → toggle
- "Achievement Alerts" / "Notifications when you unlock achievements" → toggle
- "Weekly Progress Report" / "Receive a summary of your weekly progress" → toggle
- "Public Profile" / "Make your profile visible to other users" → toggle
- "Show Progress" / "Display your lab progress to others" → toggle
- "Appear on Leaderboard" / "Show your ranking on the leaderboard" → toggle
- "Delete Account" / "Permanently delete your account and all data" → danger zone
- "Are you absolutely sure?" → dialog title
- "This action cannot be undone..." → dialog description
- "Cancel" / "Yes, Delete My Account" / "Deleting..." → dialog buttons
- "Dark Mode" / "Light Mode" / "System Default" → theme options
- Password change button: "Change Password" / "Changing..."

**Acceptance criteria:**
- All listed strings render in the active language
- No hardcoded English strings remain in the component's JSX
- Build passes with 0 errors

### REQ-6: Translate admin-dashboard.tsx
Add `useTranslation()` to `admin-dashboard.tsx` and replace hardcoded English strings with `t()` calls. Add an `admin` namespace to all locale files.

Strings to translate:
- Sidebar: "Admin Panel", "Overview", "User Management", "Server Monitoring", "Settings", "Sign Out"
- Page titles/subtitles for each tab
- Stats card titles: "Active Users", "Running Labs", "Monthly Revenue", "Completion Rate", "Avg Session Time"
- Chart titles: "Active Users", "Monthly active user growth", "Revenue", "Monthly revenue trend"
- "Recent Activity", "Latest user actions and events"
- "No recent activity"
- Table headers: "User", "Role", "Plan", "Status", "Labs Completed", "Last Active", "Actions"
- "Search users by name or email..." placeholder
- "X users found"
- Pagination: "Page X of Y (Z total)", "Previous", "Next"
- Server card: "CPU Usage", "Memory Usage", "Disk Usage", "Uptime:"
- "No server metrics available"
- Delete dialog: "Are you sure?", description, "Cancel", "Delete User"
- Time labels: "Just now", "Xh ago", "Xd ago"

**Acceptance criteria:**
- All listed strings render in the active language
- No hardcoded English strings remain in the component's JSX
- Build passes with 0 errors

### REQ-7: Build Verification
After all changes, `npm run build` must complete with 0 TypeScript errors and 0 build errors.

**Acceptance criteria:**
- `npm run build` exits with code 0
- No TypeScript errors in any modified file
