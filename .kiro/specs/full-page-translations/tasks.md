# Tasks: Full Multi-Page Translation

- [x] 1. Add locale files for es, fr, de, zh and update i18n config
  Create the 4 missing locale JSON files and update the i18n configuration to register all 6 languages.

  **1a. Create `src/app/i18n/locales/es.json`** with complete Spanish translations for all namespaces: `nav`, `dashboard`, `labs`, `achievements`, `leaderboard`, `settings`, `auth`, `common`, `lab`, `admin`.

  **1b. Create `src/app/i18n/locales/fr.json`** with complete French translations for all namespaces.

  **1c. Create `src/app/i18n/locales/de.json`** with complete German translations for all namespaces.

  **1d. Create `src/app/i18n/locales/zh.json`** with complete Chinese (Simplified) translations for all namespaces.

  **1e. Update `src/app/i18n/index.ts`**:
  - Import `es`, `fr`, `de`, `zh` JSON files
  - Add them to the `resources` object: `es: { translation: es }`, etc.
  - Update `supportedLngs` to `['en', 'ar', 'es', 'fr', 'de', 'zh']`

  **1f. Update `src/app/i18n/locales/en.json`** to add the new `lab` and `admin` namespaces with all keys from the design doc.

  **1g. Update `src/app/i18n/locales/ar.json`** to add the new `lab` and `admin` namespaces with Arabic translations.

  All locale files must be valid JSON. Every key in `en.json` must exist in all other locale files.

- [x] 2. Bridge LanguageContext with react-i18next
  Update `src/app/contexts/language-context.tsx` so language changes propagate to both systems.

  **Changes to `language-context.tsx`**:
  - Add import: `import { applyLanguage } from '@/app/i18n/index'`
  - In the `setLanguage` function, after `localStorage.setItem('language', lang)`, add: `applyLanguage(lang)`
  - In the initialization `useEffect`, after `applyDirection(savedLang)`, add: `applyLanguage(savedLang)` (call it synchronously before the API call)
  - Also call `applyLanguage('en')` in the default case (when no saved language)

  This ensures that whenever the sidebar button or settings dropdown changes the language, react-i18next also switches, updating all page components that use `useTranslation()`.

  **Depends on:** Task 1

- [-] 3. Translate lab-interface.tsx
  Add `useTranslation()` to `lab-interface.tsx` and replace all hardcoded English strings with `t()` calls.

  **Changes to `lab-interface.tsx`**:
  - Add import: `import { useTranslation } from 'react-i18next'`
  - Add inside component: `const { t } = useTranslation()`
  - Replace each hardcoded string per the mapping below:

  Score modal:
  - `"Lab Submitted ✅"` → `t('lab.labSubmitted') + ' ✅'`
  - `"Your Score"` → `t('lab.yourScore')`
  - `"Objectives Completed:"` → `t('lab.objectivesCompleted') + ':'`
  - `"Close"` button → `t('lab.close')`

  Top bar:
  - `"Back"` → `t('lab.back')`
  - `"Running"` badge → `t('lab.running')`
  - `"Stop Lab"` → `t('lab.stopLab')`
  - `"Starting..."` → `t('lab.starting')`
  - `"Start Lab"` → `t('lab.startLab')`
  - `"Time:"` → `t('lab.time') + ':'`

  Left panel:
  - `"Lab Instructions"` → `t('lab.labInstructions')`
  - `"Progress: {n}/{m} objectives completed"` → `t('lab.progressText', { completed: completedObjectives, total: lab.objectives.length })`
  - `"Objectives"` section title → `t('lab.objectives')`
  - `"Not completed"` label → `t('lab.notCompleted')`
  - `"Useful Commands"` card title → `t('lab.usefulCommands')`

  Center panel:
  - `"Network Topology"` → `t('lab.networkTopology')`
  - `"Type command here..."` placeholder → `t('lab.typeCommandHere')`
  - `"Start lab to enter commands"` placeholder → `t('lab.startLabToEnterCommands')`

  Right panel:
  - `"Live Validation"` → `t('lab.liveValidation')`
  - `"Current Score"` → `t('lab.currentScore')`
  - `"Objectives completed"` → `t('lab.objectivesCompletedLabel')`
  - `"Start completing objectives\nto see your live score"` → `t('lab.startCompletingObjectives')`
  - `"Submit Lab"` → `t('lab.submitLab')`
  - `"Submitting..."` → `t('lab.submitting')`
  - `"Submitted"` → `t('lab.submitted')`
  - `"Complete at least 1 objective to submit"` → `t('lab.completeOneObjective')`
  - `"Evaluating Lab..."` → `t('lab.evaluatingLab')`
  - `"This may take a few moments"` → `t('lab.evaluatingDesc')`
  - `"Run commands in the terminal\nto validate objectives"` → `t('lab.runCommandsToValidate')`
  - `"{n} objective(s) remaining"` → `t('lab.objectivesRemaining', { count: n })`

  Score labels (scoreLabel variable):
  - `'Excellent'` → `t('lab.excellent')`
  - `'In Progress'` → `t('lab.inProgress')`
  - `'Not Completed'` → `t('lab.notCompletedLabel')`

  **Depends on:** Task 1

- [-] 4. Translate settings.tsx remaining strings
  Replace all remaining hardcoded English strings in `settings.tsx` with `t()` calls using the `settings.*` namespace.

  **Changes to `settings.tsx`**:
  - Add import: `import { useTranslation } from 'react-i18next'`
  - Add inside component: `const { t: ti } = useTranslation()` (alias to avoid conflict with `t` from `useLanguage`)
  - Replace hardcoded strings:

  Page header:
  - `"Settings"` → `ti('settings.title')`
  - `"Manage your account preferences and privacy settings"` → `ti('settings.subtitle')`

  Profile tab:
  - `"Uploading..."` / `"Upload Photo"` → `ti('settings.uploading')` / `ti('settings.uploadPhoto')`
  - `"JPG, PNG or WebP. Max size 2MB."` → `ti('settings.avatarHint')`
  - `"Full Name"` label → `ti('settings.fullName')`
  - `"Email Address"` label → `ti('settings.emailAddress')`
  - `"Account Type"` label → `ti('settings.accountType')`
  - `"Administrator"` → `ti('settings.administrator')`
  - `"Student Account"` → `ti('settings.studentAccount')`
  - `"Change Password"` section title → `ti('settings.changePassword')`
  - `"Current Password"` label → `ti('settings.currentPassword')`
  - `"New Password"` label → `ti('settings.newPassword')`
  - `"Confirm New Password"` label → `ti('settings.confirmNewPassword')`
  - `"Changing..."` / `"Change Password"` button → `ti('settings.changing')` / `ti('settings.changePassword')`
  - Input placeholders: use `ti('settings.namePlaceholder')`, `ti('settings.currentPasswordPlaceholder')`, etc.

  Notifications tab:
  - `"Email Notifications"` / `"Receive notifications via email"` → `ti('settings.emailNotifications')` / `ti('settings.emailNotificationsDesc')`
  - `"Lab Reminders"` / `"Get reminded about incomplete labs"` → `ti('settings.labReminders')` / `ti('settings.labRemindersDesc')`
  - `"Achievement Alerts"` / `"Notifications when you unlock achievements"` → `ti('settings.achievementAlerts')` / `ti('settings.achievementAlertsDesc')`
  - `"Weekly Progress Report"` / `"Receive a summary of your weekly progress"` → `ti('settings.weeklyReport')` / `ti('settings.weeklyReportDesc')`

  Appearance tab:
  - `"Dark Mode"` / `"Light Mode"` / `"System Default"` → `ti('settings.darkMode')` / `ti('settings.lightMode')` / `ti('settings.systemDefault')`

  Privacy tab:
  - `"Public Profile"` / `"Make your profile visible to other users"` → `ti('settings.publicProfile')` / `ti('settings.publicProfileDesc')`
  - `"Show Progress"` / `"Display your lab progress to others"` → `ti('settings.showProgress')` / `ti('settings.showProgressDesc')`
  - `"Appear on Leaderboard"` / `"Show your ranking on the leaderboard"` → `ti('settings.appearOnLeaderboard')` / `ti('settings.appearOnLeaderboardDesc')`

  Danger zone:
  - `"Delete Account"` section title → `ti('settings.deleteAccount')`
  - `"Permanently delete your account and all data"` → `ti('settings.deleteAccountDesc')`
  - `"Are you absolutely sure?"` → `ti('settings.deleteConfirmTitle')`
  - `"This action cannot be undone..."` → `ti('settings.deleteConfirmDesc')`
  - `"Cancel"` → `ti('settings.cancel')`
  - `"Yes, Delete My Account"` → `ti('settings.yesDelete')`

  **Depends on:** Task 1

- [ ] 5. Translate admin-dashboard.tsx
  Add `useTranslation()` to `admin-dashboard.tsx` and replace all hardcoded English strings with `t()` calls using the `admin.*` namespace.

  **Changes to `admin-dashboard.tsx`**:
  - Add import: `import { useTranslation } from 'react-i18next'`
  - Add inside component: `const { t } = useTranslation()`
  - Replace hardcoded strings:

  Sidebar:
  - `"Admin Panel"` → `t('admin.adminPanel')`
  - `"Overview"` → `t('admin.overview')`
  - `"User Management"` → `t('admin.userManagement')`
  - `"Server Monitoring"` → `t('admin.serverMonitoring')`
  - `"Settings"` → `t('admin.settings')`
  - `"Sign Out"` → `t('admin.signOut')`

  Page header (dynamic based on `currentTab`):
  - `'Dashboard Overview'` → `t('admin.dashboardOverview')`
  - `'User Management'` → `t('admin.userManagement')`
  - `'Server Monitoring'` → `t('admin.serverMonitoring')`
  - Subtitles similarly

  Stats cards (update `quickStats` array):
  - `"Active Users"` → `t('admin.activeUsers')`
  - `"Running Labs"` → `t('admin.runningLabs')`
  - `"Monthly Revenue"` → `t('admin.monthlyRevenue')`
  - `"Completion Rate"` → `t('admin.completionRate')`
  - `"Avg Session Time"` → `t('admin.avgSessionTime')`
  - `"No data yet"` → `t('admin.noData')`
  - `"Per session"` → `t('admin.perSession')`
  - `"of {n}"` → `t('admin.ofTotal', { total: n })`

  Charts:
  - `"Active Users"` chart title → `t('admin.activeUsers')`
  - `"Monthly active user growth"` → `t('admin.monthlyActiveGrowth')`
  - `"Revenue"` chart title → `t('admin.revenue')`
  - `"Monthly revenue trend"` → `t('admin.monthlyRevenueTrend')`

  Recent Activity:
  - `"Recent Activity"` → `t('admin.recentActivity')`
  - `"Latest user actions and events"` → `t('admin.latestActions')`
  - `"No recent activity"` → `t('admin.noRecentActivity')`

  Users tab:
  - `"Search users by name or email..."` placeholder → `t('admin.searchUsers')`
  - `"User Management"` card title → `t('admin.userManagement')`
  - `"{n} users found"` → `t('admin.usersFound', { count: filteredUsers.length })`
  - Table headers: `t('admin.user')`, `t('admin.role')`, `t('admin.plan')`, `t('admin.status')`, `t('admin.labsCompleted')`, `t('admin.lastActive')`, `t('admin.actions')`
  - Pagination: `t('admin.pageOf', { page, pages, total })`, `t('admin.previous')`, `t('admin.next')`

  Servers tab:
  - `"CPU Usage"` → `t('admin.cpuUsage')`
  - `"Memory Usage"` → `t('admin.memoryUsage')`
  - `"Disk Usage"` → `t('admin.diskUsage')`
  - `"Uptime:"` → `t('admin.uptime') + ':'`
  - `"No server metrics available"` → `t('admin.noServerMetrics')`

  `formatLastActive` function:
  - `'Just now'` → `t('admin.justNow')`
  - `` `${hours}h ago` `` → `t('admin.hoursAgo', { hours })`
  - `` `${days}d ago` `` → `t('admin.daysAgo', { days })`

  Delete dialog:
  - `"Are you sure?"` → `t('admin.deleteUserTitle')`
  - Description with user name → `t('admin.deleteUserDesc', { name: selectedUser?.name })`
  - `"Cancel"` → `t('admin.cancel')`
  - `"Delete User"` → `t('admin.deleteUser')`

  **Depends on:** Task 1

- [~] 6. Build verification
  Run `npm run build` from the project root (`d:\Smart It Lab`) and verify it exits with 0 errors.

  If there are TypeScript errors, fix them before marking this task complete. Common issues to watch for:
  - Missing translation keys in locale files
  - Type mismatches from `t()` return values
  - Import path issues

  **Depends on:** Tasks 1, 2, 3, 4, 5
