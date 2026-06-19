# Design: Full Multi-Page Translation

## Architecture

The project uses two translation systems that must be kept in sync:

### System 1: react-i18next (primary, used by all pages)
- Config: `src/app/i18n/index.ts`
- Locale files: `src/app/i18n/locales/{lang}.json`
- Usage: `const { t } = useTranslation()` → `t('namespace.key')`
- Language change: `i18n.changeLanguage(lang)` or `applyLanguage(lang)` helper

### System 2: LanguageContext (secondary, used by sidebar + settings UI)
- Context: `src/app/contexts/language-context.tsx`
- Translations: `src/app/utils/translations.ts`
- Usage: `const { t } = useLanguage()` → `t('key')`
- Language change: `setLanguage(lang)` from context

### Bridge Strategy
`LanguageContext.setLanguage()` must call `applyLanguage(lang)` from `src/app/i18n/index.ts` to keep both systems in sync. This is a one-line addition to the existing `setLanguage` function.

## File Changes

### New Files
```
src/app/i18n/locales/es.json   — Spanish translations
src/app/i18n/locales/fr.json   — French translations
src/app/i18n/locales/de.json   — German translations
src/app/i18n/locales/zh.json   — Chinese translations
```

### Modified Files
```
src/app/i18n/index.ts                    — import + register 4 new locales
src/app/contexts/language-context.tsx    — bridge: call applyLanguage() on setLanguage
src/app/pages/lab-interface.tsx          — add useTranslation(), replace hardcoded strings
src/app/pages/settings.tsx               — replace remaining hardcoded strings with t()
src/app/pages/admin-dashboard.tsx        — add useTranslation(), replace hardcoded strings
```

## JSON Locale Structure

All locale files follow the same namespace structure as `en.json`:

```json
{
  "nav": { ... },
  "dashboard": { ... },
  "labs": { ... },
  "achievements": { ... },
  "leaderboard": { ... },
  "settings": { ... },
  "auth": { ... },
  "common": { ... },
  "lab": { ... },       ← new namespace for lab-interface strings
  "admin": { ... }      ← new namespace for admin-dashboard strings
}
```

## New Translation Keys

### `lab` namespace (for lab-interface.tsx)
```json
{
  "lab": {
    "labSubmitted": "Lab Submitted",
    "yourScore": "Your Score",
    "objectivesCompleted": "Objectives Completed",
    "close": "Close",
    "back": "Back",
    "running": "Running",
    "stopLab": "Stop Lab",
    "starting": "Starting...",
    "startLab": "Start Lab",
    "time": "Time",
    "labInstructions": "Lab Instructions",
    "progressText": "Progress: {{completed}}/{{total}} objectives completed",
    "objectives": "Objectives",
    "notCompleted": "Not completed",
    "usefulCommands": "Useful Commands",
    "networkTopology": "Network Topology",
    "liveValidation": "Live Validation",
    "currentScore": "Current Score",
    "objectivesCompletedLabel": "Objectives completed",
    "startCompletingObjectives": "Start completing objectives to see your live score",
    "submitLab": "Submit Lab",
    "submitting": "Submitting...",
    "submitted": "Submitted",
    "completeOneObjective": "Complete at least 1 objective to submit",
    "typeCommandHere": "Type command here...",
    "startLabToEnterCommands": "Start lab to enter commands",
    "excellent": "Excellent",
    "inProgress": "In Progress",
    "notCompletedLabel": "Not Completed",
    "evaluatingLab": "Evaluating Lab...",
    "evaluatingDesc": "This may take a few moments",
    "runCommandsToValidate": "Run commands in the terminal to validate objectives",
    "objectivesRemaining_one": "{{count}} objective remaining",
    "objectivesRemaining_other": "{{count}} objectives remaining"
  }
}
```

### `admin` namespace (for admin-dashboard.tsx)
```json
{
  "admin": {
    "adminPanel": "Admin Panel",
    "overview": "Overview",
    "userManagement": "User Management",
    "serverMonitoring": "Server Monitoring",
    "settings": "Settings",
    "signOut": "Sign Out",
    "dashboardOverview": "Dashboard Overview",
    "monitorSystem": "Monitor system health and manage resources",
    "manageUsers": "Manage users, roles, and permissions",
    "monitorServers": "Monitor server performance and health",
    "activeUsers": "Active Users",
    "runningLabs": "Running Labs",
    "monthlyRevenue": "Monthly Revenue",
    "completionRate": "Completion Rate",
    "avgSessionTime": "Avg Session Time",
    "noData": "No data yet",
    "perSession": "Per session",
    "monthlyActiveGrowth": "Monthly active user growth",
    "revenue": "Revenue",
    "monthlyRevenueTrend": "Monthly revenue trend",
    "recentActivity": "Recent Activity",
    "latestActions": "Latest user actions and events",
    "noRecentActivity": "No recent activity",
    "searchUsers": "Search users by name or email...",
    "usersFound": "{{count}} users found",
    "user": "User",
    "role": "Role",
    "plan": "Plan",
    "status": "Status",
    "labsCompleted": "Labs Completed",
    "lastActive": "Last Active",
    "actions": "Actions",
    "previous": "Previous",
    "next": "Next",
    "pageOf": "Page {{page}} of {{pages}} ({{total}} total)",
    "cpuUsage": "CPU Usage",
    "memoryUsage": "Memory Usage",
    "diskUsage": "Disk Usage",
    "uptime": "Uptime",
    "noServerMetrics": "No server metrics available",
    "deleteUserTitle": "Are you sure?",
    "deleteUserDesc": "This will permanently delete {{name}}'s account and all associated data. This action cannot be undone.",
    "cancel": "Cancel",
    "deleteUser": "Delete User",
    "justNow": "Just now",
    "hoursAgo": "{{hours}}h ago",
    "daysAgo": "{{days}}d ago",
    "ofTotal": "of {{total}}"
  }
}
```

### Additional `settings` keys needed
```json
{
  "settings": {
    "title": "Settings",
    "subtitle": "Manage your account preferences and privacy settings",
    "uploadPhoto": "Upload Photo",
    "uploading": "Uploading...",
    "avatarHint": "JPG, PNG or WebP. Max size 2MB.",
    "fullName": "Full Name",
    "emailAddress": "Email Address",
    "accountType": "Account Type",
    "administrator": "Administrator",
    "studentAccount": "Student Account",
    "plan": "Plan",
    "bio": "Bio",
    "bioPlaceholder": "Tell us about yourself...",
    "namePlaceholder": "Enter your full name",
    "emailPlaceholder": "your.email@university.edu",
    "changePassword": "Change Password",
    "currentPassword": "Current Password",
    "newPassword": "New Password",
    "confirmNewPassword": "Confirm New Password",
    "currentPasswordPlaceholder": "Enter current password",
    "newPasswordPlaceholder": "Enter new password",
    "confirmPasswordPlaceholder": "Confirm new password",
    "changing": "Changing...",
    "emailNotifications": "Email Notifications",
    "emailNotificationsDesc": "Receive notifications via email",
    "labReminders": "Lab Reminders",
    "labRemindersDesc": "Get reminded about incomplete labs",
    "achievementAlerts": "Achievement Alerts",
    "achievementAlertsDesc": "Notifications when you unlock achievements",
    "pushNotifications": "Push Notifications",
    "pushNotificationsDesc": "Receive push notifications in your browser",
    "marketingEmails": "Marketing Emails",
    "marketingEmailsDesc": "Receive updates about new features and promotions",
    "weeklyReport": "Weekly Progress Report",
    "weeklyReportDesc": "Receive a summary of your weekly progress",
    "publicProfile": "Public Profile",
    "publicProfileDesc": "Make your profile visible to other users",
    "showProgress": "Show Progress",
    "showProgressDesc": "Display your lab progress to others",
    "appearOnLeaderboard": "Appear on Leaderboard",
    "appearOnLeaderboardDesc": "Show your ranking on the leaderboard",
    "deleteConfirmTitle": "Are you absolutely sure?",
    "deleteConfirmDesc": "This action cannot be undone. This will permanently delete your account and remove all your data from our servers.",
    "yesDelete": "Yes, Delete My Account",
    "deleting": "Deleting...",
    "darkMode": "Dark Mode",
    "lightMode": "Light Mode",
    "systemDefault": "System Default"
  }
}
```

## Component Changes

### lab-interface.tsx
- Add `import { useTranslation } from 'react-i18next'`
- Add `const { t } = useTranslation()` inside component
- Replace each hardcoded string with `t('lab.key')` or `t('common.key')`
- For plurals: `t('lab.objectivesRemaining', { count: n })`
- For interpolation: `t('lab.progressText', { completed: n, total: m })`

### settings.tsx
- Already imports `useLanguage` — keep that for the custom context
- Add `import { useTranslation } from 'react-i18next'` 
- Add `const { t: ti18n } = useTranslation()` (alias to avoid conflict with `t` from `useLanguage`)
- Replace hardcoded strings with `ti18n('settings.key')`

### admin-dashboard.tsx
- Add `import { useTranslation } from 'react-i18next'`
- Add `const { t } = useTranslation()` inside component
- Replace hardcoded strings with `t('admin.key')`
- `formatLastActive` function: use `t('admin.justNow')`, `t('admin.hoursAgo', { hours })`, `t('admin.daysAgo', { days })`

## RTL Considerations
- Arabic is the only RTL language
- The `LanguageContext` already handles `document.documentElement.dir`
- The bridge in REQ-3 ensures i18next also gets the language change
- No additional RTL-specific CSS changes needed — the existing `isRTL` logic in `dashboard-layout.tsx` handles sidebar positioning

## Build Verification
Run `npm run build` from the project root after all changes. The build must exit with code 0.
