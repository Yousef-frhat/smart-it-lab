const fs = require('fs');

const interfaceExtras = `
  // Dashboard
  welcomeBack: string;
  ccnaTrack: string;
  currentStreak: string;
  labsSolved: string;
  globalRank: string;
  hoursSpent: string;
  achievementsCount: string;
  activeLabs: string;
  continueJourney: string;
  newLab: string;
  status: string;
  score: string;
  progress: string;
  completed: string;
  resume: string;
  start: string;
  noActiveLabs: string;
  browseLabs: string;
  completedLabs: string;
  reviewCompleted: string;
  viewAll: string;
  reviewLab: string;
  stopped: string;
  running: string;

  // My Labs
  labsTitle: string;
  labsSubtitle: string;
  totalLabs: string;
  inProgress: string;
  avgScore: string;
  searchPlaceholder: string;
  allStatus: string;
  notCompleted: string;
  allLevels: string;
  beginner: string;
  intermediate: string;
  advanced: string;
  allCategories: string;
  objectives: string;
  more: string;
  resumeLab: string;
  startLab: string;
  noLabsFound: string;
  adjustFilters: string;
  clearFilters: string;

  // Achievements
  achievementsTitle: string;
  achievementsSubtitle: string;
  totalPoints: string;
  unlocked: string;
  completion: string;
  tierBronze: string;
  tierSilver: string;
  tierGold: string;
  tierPlatinum: string;
  pts: string;
  labCompletion: string;
  speed: string;
  ofUnlocked: string;

  // Leaderboard
  leaderboardTitle: string;
  leaderboardSubtitle: string;
  yourRank: string;
  points: string;
  labs: string;
  rankings: string;
  trackPerformance: string;
  thisWeek: string;
  thisMonth: string;
  you: string;
  earnPoints: string;
  weeklyReset: string;
  rewards: string;
  days: string;

  // Lab Interface
  objectivesPanel: string;
  notCompletedObj: string;
  usefulCommands: string;
  liveValidation: string;
  currentScore: string;
  excellent: string;
  good: string;
  needsWork: string;
  objectivesCompleted: string;
  submitLab: string;
  back: string;
  timeLabel: string;
  networkTopology: string;
  typeCommand: string;
  startLabToEnter: string;
  labSubmitted: string;
  yourScore: string;
  close: string;

  // Admin Dashboard
  adminDashboard: string;
  adminOverview: string;
  totalUsers: string;
  activeInstances: string;
  systemHealth: string;
  recentActivity: string;
  manageUsers: string;
  manageLabs: string;
  viewLogs: string;
`;

const enExtras = `
    welcomeBack: 'Welcome back, {name}!',
    ccnaTrack: 'You are {percent}% through the {track} Track',
    currentStreak: 'Current Streak',
    labsSolved: 'Labs Solved',
    globalRank: 'Global Rank',
    hoursSpent: 'Hours Spent',
    achievementsCount: 'Achievements',
    activeLabs: 'Active Labs',
    continueJourney: 'Continue your learning journey',
    newLab: 'New Lab',
    status: 'Status',
    score: 'Score',
    progress: 'Progress',
    completed: 'completed',
    resume: 'Resume',
    start: 'Start',
    noActiveLabs: 'No active labs. Ready to start something new?',
    browseLabs: 'Browse Labs',
    completedLabs: 'Completed Labs',
    reviewCompleted: 'Review your completed labs',
    viewAll: 'View All',
    reviewLab: 'Review Lab',
    stopped: 'stopped',
    running: 'running',
    labsTitle: 'My Labs',
    labsSubtitle: 'Track your progress across all lab exercises',
    totalLabs: 'Total Labs',
    inProgress: 'In Progress',
    avgScore: 'Avg Score',
    searchPlaceholder: 'Search labs...',
    allStatus: 'All Status',
    notCompleted: 'Not Completed',
    allLevels: 'All Levels',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    allCategories: 'All Categories',
    objectives: 'Objectives',
    more: '+{count} more...',
    resumeLab: 'Resume Lab',
    startLab: 'Start Lab',
    noLabsFound: 'No labs found matching your criteria.',
    adjustFilters: 'Try adjusting your search or filters to find what you are looking for.',
    clearFilters: 'Clear Filters',
    achievementsTitle: 'Achievements',
    achievementsSubtitle: 'Track your learning milestones and accomplishments',
    totalPoints: 'Total Points',
    unlocked: 'Unlocked',
    completion: 'Completion',
    tierBronze: 'Bronze',
    tierSilver: 'Silver',
    tierGold: 'Gold',
    tierPlatinum: 'Platinum',
    pts: 'pts',
    labCompletion: 'Lab Completion',
    speed: 'Speed',
    ofUnlocked: '{unlocked} of {total} unlocked',
    leaderboardTitle: 'Leaderboard',
    leaderboardSubtitle: 'Compete with students worldwide and climb the ranks',
    yourRank: 'Your Rank',
    points: 'Points',
    labs: 'Labs',
    rankings: 'Rankings',
    trackPerformance: 'Track your performance across different timeframes',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    you: 'You',
    earnPoints: 'Earn Points',
    weeklyReset: 'Weekly Reset',
    rewards: 'Rewards',
    days: '{streak}d',
    objectivesPanel: 'Objectives',
    notCompletedObj: 'NOT COMPLETED',
    usefulCommands: 'Useful Commands',
    liveValidation: 'Live Validation',
    currentScore: 'CURRENT SCORE',
    excellent: 'EXCELLENT',
    good: 'GOOD',
    needsWork: 'NEEDS WORK',
    objectivesCompleted: 'Objectives completed {count} / {total}',
    submitLab: 'Submit Lab',
    back: 'Back',
    timeLabel: 'Time:',
    networkTopology: 'Network Topology',
    typeCommand: 'Type command here...',
    startLabToEnter: 'Start lab to enter commands',
    labSubmitted: 'Lab Submitted',
    yourScore: 'Your Score',
    close: 'Close',
    adminDashboard: 'Admin Dashboard',
    adminOverview: 'Admin Overview',
    totalUsers: 'Total Users',
    activeInstances: 'Active Instances',
    systemHealth: 'System Health',
    recentActivity: 'Recent Activity',
    manageUsers: 'Manage Users',
    manageLabs: 'Manage Labs',
    viewLogs: 'View Logs',
`;

const arExtras = `
    welcomeBack: 'مرحباً بعودتك، {name}!',
    ccnaTrack: 'لقد أكملت {percent}% من مسار {track}',
    currentStreak: 'سلسلة الأيام الحالية',
    labsSolved: 'المعامل المنجزة',
    globalRank: 'التصنيف العالمي',
    hoursSpent: 'الساعات المقضية',
    achievementsCount: 'الإنجازات',
    activeLabs: 'المعامل النشطة',
    continueJourney: 'أكمل رحلة تعلمك',
    newLab: 'معمل جديد',
    status: 'الحالة',
    score: 'النتيجة',
    progress: 'التقدم',
    completed: 'مكتمل',
    resume: 'استئناف',
    start: 'بدء',
    noActiveLabs: 'لا توجد معامل نشطة. هل أنت مستعد للبدء؟',
    browseLabs: 'تصفح المعامل',
    completedLabs: 'المعامل المكتملة',
    reviewCompleted: 'راجع المعامل التي أكملتها',
    viewAll: 'عرض الكل',
    reviewLab: 'مراجعة المعمل',
    stopped: 'متوقف',
    running: 'قيد التشغيل',
    labsTitle: 'معاملي',
    labsSubtitle: 'تتبع تقدمك في جميع تمارين المعامل',
    totalLabs: 'إجمالي المعامل',
    inProgress: 'قيد التنفيذ',
    avgScore: 'متوسط النتيجة',
    searchPlaceholder: 'ابحث في المعامل...',
    allStatus: 'جميع الحالات',
    notCompleted: 'غير مكتمل',
    allLevels: 'جميع المستويات',
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    advanced: 'متقدم',
    allCategories: 'جميع الفئات',
    objectives: 'الأهداف',
    more: '+{count} المزيد...',
    resumeLab: 'استئناف المعمل',
    startLab: 'بدء المعمل',
    noLabsFound: 'لم يتم العثور على معامل تطابق بحثك.',
    adjustFilters: 'حاول تعديل بحثك أو التصفية للعثور على ما تبحث عنه.',
    clearFilters: 'مسح التصفية',
    achievementsTitle: 'الإنجازات',
    achievementsSubtitle: 'تتبع معالمك وإنجازاتك التعليمية',
    totalPoints: 'إجمالي النقاط',
    unlocked: 'مفتوح',
    completion: 'اكتمال',
    tierBronze: 'برونزي',
    tierSilver: 'فضي',
    tierGold: 'ذهبي',
    tierPlatinum: 'بلاتيني',
    pts: 'نقطة',
    labCompletion: 'إكمال المعامل',
    speed: 'السرعة',
    ofUnlocked: '{unlocked} من {total} مفتوح',
    leaderboardTitle: 'لوحة المتصدرين',
    leaderboardSubtitle: 'تنافس مع الطلاب من جميع أنحاء العالم وارتق في التصنيف',
    yourRank: 'تصنيفك',
    points: 'النقاط',
    labs: 'المعامل',
    rankings: 'التصنيفات',
    trackPerformance: 'تتبع أدائك عبر فترات زمنية مختلفة',
    thisWeek: 'هذا الأسبوع',
    thisMonth: 'هذا الشهر',
    you: 'أنت',
    earnPoints: 'اكتساب النقاط',
    weeklyReset: 'إعادة تعيين أسبوعية',
    rewards: 'المكافآت',
    days: '{streak}يوم',
    objectivesPanel: 'الأهداف',
    notCompletedObj: 'غير مكتمل',
    usefulCommands: 'أوامر مفيدة',
    liveValidation: 'تحقق مباشر',
    currentScore: 'النتيجة الحالية',
    excellent: 'ممتاز',
    good: 'جيد',
    needsWork: 'يحتاج عمل',
    objectivesCompleted: 'الأهداف المكتملة {count} / {total}',
    submitLab: 'تسليم المعمل',
    back: 'رجوع',
    timeLabel: 'الوقت:',
    networkTopology: 'مخطط الشبكة',
    typeCommand: 'اكتب الأمر هنا...',
    startLabToEnter: 'ابدأ المعمل لإدخال الأوامر',
    labSubmitted: 'تم تسليم المعمل',
    yourScore: 'نتيجتك',
    close: 'إغلاق',
    adminDashboard: 'لوحة تحكم المسؤول',
    adminOverview: 'نظرة عامة',
    totalUsers: 'إجمالي المستخدمين',
    activeInstances: 'الحالات النشطة',
    systemHealth: 'صحة النظام',
    recentActivity: 'النشاط الأخير',
    manageUsers: 'إدارة المستخدمين',
    manageLabs: 'إدارة المعامل',
    viewLogs: 'عرض السجلات',
`;

// we just copy ES to others to have them filled
const esExtras = enExtras;
const frExtras = enExtras;
const deExtras = enExtras;
const zhExtras = enExtras;

const file = 'src/app/utils/translations.ts';
let code = fs.readFileSync(file, 'utf8');

code = code.replace('export interface Translations {', \`export interface Translations {
\${interfaceExtras}\`);

code = code.replace('en: {', \`en: {
\${enExtras}\`);

code = code.replace('ar: {', \`ar: {
\${arExtras}\`);

code = code.replace('es: {', \`es: {
\${esExtras}\`);

code = code.replace('fr: {', \`fr: {
\${frExtras}\`);

code = code.replace('de: {', \`de: {
\${deExtras}\`);

code = code.replace('zh: {', \`zh: {
\${zhExtras}\`);

fs.writeFileSync(file, code, 'utf8');
console.log('Translations patched successfully.');
