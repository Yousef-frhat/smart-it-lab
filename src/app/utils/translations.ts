// Translation keys for all 6 supported languages
export type Language = 'en' | 'ar' | 'es' | 'fr' | 'de' | 'zh';

export interface Translations {
  // Sidebar Navigation
  dashboard: string;
  myLabs: string;
  achievements: string;
  leaderboard: string;
  settings: string;

  // Sidebar Buttons
  lightMode: string;
  darkMode: string;
  english: string;
  arabic: string;
  signOut: string;

  // Settings Page Tabs
  profile: string;
  notifications: string;
  appearance: string;
  privacy: string;
  security: string;

  // Settings Page Labels
  theme: string;
  language: string;
  dangerZone: string;
  deleteAccount: string;
  deleteAccountDesc: string;

  // Common Buttons
  saveSettings: string;
  cancel: string;
  delete: string;
  confirm: string;

  // Profile Section
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  changePassword: string;

  // Notifications Section
  emailNotifications: string;
  labReminders: string;
  achievementAlerts: string;

  // Privacy Section
  profileVisible: string;
  showLeaderboard: string;

  // Appearance Section
  chooseColorScheme: string;
  selectLanguage: string;

  // Save States
  saving: string;
  saveChanges: string;
  savePreferences: string;

  // Danger Zone
  dangerZoneDesc: string;

  // Language Names
  langNameEn: string;
  langNameAr: string;
  langNameEs: string;
  langNameFr: string;
  langNameDe: string;
  langNameZh: string;

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
}

export const translations: Record<Language, Translations> = {
  en: {
    // Sidebar Navigation
    dashboard: 'Dashboard',
    myLabs: 'My Labs',
    achievements: 'Achievements',
    leaderboard: 'Leaderboard',
    settings: 'Settings',

    // Sidebar Buttons
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    english: 'English',
    arabic: 'العربية',
    signOut: 'Sign Out',

    // Settings Page Tabs
    profile: 'Profile',
    notifications: 'Notifications',
    appearance: 'Appearance',
    privacy: 'Privacy',
    security: 'Security',

    // Settings Page Labels
    theme: 'Theme',
    language: 'Language',
    dangerZone: 'Danger Zone',
    deleteAccount: 'Delete Account',
    deleteAccountDesc: 'Permanently delete your account and all data',

    // Common Buttons
    saveSettings: 'Save Settings',
    cancel: 'Cancel',
    delete: 'Delete',
    confirm: 'Confirm',

    // Profile Section
    name: 'Name',
    email: 'Email',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    changePassword: 'Change Password',

    // Notifications Section
    emailNotifications: 'Email Notifications',
    labReminders: 'Lab Reminders',
    achievementAlerts: 'Achievement Alerts',

    // Privacy Section
    profileVisible: 'Profile Visible',
    showLeaderboard: 'Show on Leaderboard',

    // Appearance Section
    chooseColorScheme: 'Choose your preferred color scheme',
    selectLanguage: 'Select your preferred language',

    // Save States
    saving: 'Saving...',
    saveChanges: 'Save Changes',
    savePreferences: 'Save Preferences',

    // Danger Zone
    dangerZoneDesc: 'Irreversible actions that will permanently affect your account',

    // Language Names
    langNameEn: 'English',
    langNameAr: 'العربية',
    langNameEs: 'Español',
    langNameFr: 'Français',
    langNameDe: 'Deutsch',
    langNameZh: '中文',

    // Dashboard
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

    // My Labs
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

    // Achievements
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

    // Leaderboard
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

    // Lab Interface
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

    // Admin Dashboard
    adminDashboard: 'Admin Dashboard',
    adminOverview: 'Admin Overview',
    totalUsers: 'Total Users',
    activeInstances: 'Active Instances',
    systemHealth: 'System Health',
    recentActivity: 'Recent Activity',
    manageUsers: 'Manage Users',
    manageLabs: 'Manage Labs',
    viewLogs: 'View Logs',
  },

  ar: {
    // Sidebar Navigation
    dashboard: 'لوحة التحكم',
    myLabs: 'معاملي',
    achievements: 'الإنجازات',
    leaderboard: 'لوحة المتصدرين',
    settings: 'الإعدادات',

    // Sidebar Buttons
    lightMode: 'الوضع الفاتح',
    darkMode: 'الوضع الداكن',
    english: 'English',
    arabic: 'العربية',
    signOut: 'تسجيل الخروج',

    // Settings Page Tabs
    profile: 'الملف الشخصي',
    notifications: 'الإشعارات',
    appearance: 'المظهر',
    privacy: 'الخصوصية',
    security: 'الأمان',

    // Settings Page Labels
    theme: 'السمة',
    language: 'اللغة',
    dangerZone: 'منطقة الخطر',
    deleteAccount: 'حذف الحساب',
    deleteAccountDesc: 'حذف حسابك وجميع بياناتك نهائياً',

    // Common Buttons
    saveSettings: 'حفظ الإعدادات',
    cancel: 'إلغاء',
    delete: 'حذف',
    confirm: 'تأكيد',

    // Profile Section
    name: 'الاسم',
    email: 'البريد الإلكتروني',
    currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور',
    changePassword: 'تغيير كلمة المرور',

    // Notifications Section
    emailNotifications: 'إشعارات البريد الإلكتروني',
    labReminders: 'تذكيرات المعامل',
    achievementAlerts: 'تنبيهات الإنجازات',

    // Privacy Section
    profileVisible: 'الملف الشخصي مرئي',
    showLeaderboard: 'الظهور في لوحة المتصدرين',

    // Appearance Section
    chooseColorScheme: 'اختر نظام الألوان المفضل لديك',
    selectLanguage: 'اختر لغتك المفضلة',

    // Save States
    saving: 'جارٍ الحفظ...',
    saveChanges: 'حفظ التغييرات',
    savePreferences: 'حفظ التفضيلات',

    // Danger Zone
    dangerZoneDesc: 'إجراءات لا يمكن التراجع عنها ستؤثر بشكل دائم على حسابك',

    // Language Names
    langNameEn: 'English',
    langNameAr: 'العربية',
    langNameEs: 'Español',
    langNameFr: 'Français',
    langNameDe: 'Deutsch',
    langNameZh: '中文',

    // Dashboard
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

    // My Labs
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

    // Achievements
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

    // Leaderboard
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

    // Lab Interface
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

    // Admin Dashboard
    adminDashboard: 'لوحة تحكم المسؤول',
    adminOverview: 'نظرة عامة',
    totalUsers: 'إجمالي المستخدمين',
    activeInstances: 'الحالات النشطة',
    systemHealth: 'صحة النظام',
    recentActivity: 'النشاط الأخير',
    manageUsers: 'إدارة المستخدمين',
    manageLabs: 'إدارة المعامل',
    viewLogs: 'عرض السجلات',
  },

  es: {
    // Sidebar Navigation
    dashboard: 'Panel',
    myLabs: 'Mis Labs',
    achievements: 'Logros',
    leaderboard: 'Clasificación',
    settings: 'Configuración',

    // Sidebar Buttons
    lightMode: 'Modo Claro',
    darkMode: 'Modo Oscuro',
    english: 'English',
    arabic: 'العربية',
    signOut: 'Cerrar Sesión',

    // Settings Page Tabs
    profile: 'Perfil',
    notifications: 'Notificaciones',
    appearance: 'Apariencia',
    privacy: 'Privacidad',
    security: 'Seguridad',

    // Settings Page Labels
    theme: 'Tema',
    language: 'Idioma',
    dangerZone: 'Zona de Peligro',
    deleteAccount: 'Eliminar Cuenta',
    deleteAccountDesc: 'Eliminar permanentemente tu cuenta y todos los datos',

    // Common Buttons
    saveSettings: 'Guardar Configuración',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    confirm: 'Confirmar',

    // Profile Section
    name: 'Nombre',
    email: 'Correo Electrónico',
    currentPassword: 'Contraseña Actual',
    newPassword: 'Nueva Contraseña',
    confirmPassword: 'Confirmar Contraseña',
    changePassword: 'Cambiar Contraseña',

    // Notifications Section
    emailNotifications: 'Notificaciones por Email',
    labReminders: 'Recordatorios de Lab',
    achievementAlerts: 'Alertas de Logros',

    // Privacy Section
    profileVisible: 'Perfil Visible',
    showLeaderboard: 'Mostrar en Clasificación',

    // Appearance Section
    chooseColorScheme: 'Elige tu esquema de colores preferido',
    selectLanguage: 'Selecciona tu idioma preferido',

    // Save States
    saving: 'Guardando...',
    saveChanges: 'Guardar Cambios',
    savePreferences: 'Guardar Preferencias',

    // Danger Zone
    dangerZoneDesc: 'Acciones irreversibles que afectarán permanentemente tu cuenta',

    // Language Names
    langNameEn: 'English',
    langNameAr: 'العربية',
    langNameEs: 'Español',
    langNameFr: 'Français',
    langNameDe: 'Deutsch',
    langNameZh: '中文',

    // Dashboard
    welcomeBack: '¡Bienvenido de nuevo, {name}!',
    ccnaTrack: 'Has completado el {percent}% del track {track}',
    currentStreak: 'Racha Actual',
    labsSolved: 'Labs Resueltos',
    globalRank: 'Rango Global',
    hoursSpent: 'Horas Invertidas',
    achievementsCount: 'Logros',
    activeLabs: 'Labs Activos',
    continueJourney: 'Continúa tu viaje de aprendizaje',
    newLab: 'Nuevo Lab',
    status: 'Estado',
    score: 'Puntuación',
    progress: 'Progreso',
    completed: 'completado',
    resume: 'Reanudar',
    start: 'Empezar',
    noActiveLabs: 'No hay labs activos. ¿Listo para empezar algo nuevo?',
    browseLabs: 'Explorar Labs',
    completedLabs: 'Labs Completados',
    reviewCompleted: 'Revisa tus labs completados',
    viewAll: 'Ver Todo',
    reviewLab: 'Revisar Lab',
    stopped: 'detenido',
    running: 'en ejecución',

    // My Labs
    labsTitle: 'Mis Labs',
    labsSubtitle: 'Haz un seguimiento de tu progreso en todos los ejercicios de lab',
    totalLabs: 'Labs Totales',
    inProgress: 'En Progreso',
    avgScore: 'Puntuación Promedio',
    searchPlaceholder: 'Buscar labs...',
    allStatus: 'Todos los Estados',
    notCompleted: 'No Completado',
    allLevels: 'Todos los Niveles',
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
    allCategories: 'Todas las Categorías',
    objectives: 'Objetivos',
    more: '+{count} más...',
    resumeLab: 'Reanudar Lab',
    startLab: 'Empezar Lab',
    noLabsFound: 'No se encontraron labs que coincidan con tus criterios.',
    adjustFilters: 'Intenta ajustar tu búsqueda o filtros para encontrar lo que buscas.',
    clearFilters: 'Limpiar Filtros',

    // Achievements
    achievementsTitle: 'Logros',
    achievementsSubtitle: 'Haz un seguimiento de tus hitos y logros de aprendizaje',
    totalPoints: 'Puntos Totales',
    unlocked: 'Desbloqueado',
    completion: 'Finalización',
    tierBronze: 'Bronce',
    tierSilver: 'Plata',
    tierGold: 'Oro',
    tierPlatinum: 'Platino',
    pts: 'pts',
    labCompletion: 'Finalización de Lab',
    speed: 'Velocidad',
    ofUnlocked: '{unlocked} de {total} desbloqueados',

    // Leaderboard
    leaderboardTitle: 'Clasificación',
    leaderboardSubtitle: 'Compite con estudiantes de todo el mundo y sube en los rangos',
    yourRank: 'Tu Rango',
    points: 'Puntos',
    labs: 'Labs',
    rankings: 'Clasificaciones',
    trackPerformance: 'Haz un seguimiento de tu rendimiento',
    thisWeek: 'Esta Semana',
    thisMonth: 'Este Mes',
    you: 'Tú',
    earnPoints: 'Gana Puntos',
    weeklyReset: 'Reinicio Semanal',
    rewards: 'Recompensas',
    days: '{streak}d',

    // Lab Interface
    objectivesPanel: 'Objetivos',
    notCompletedObj: 'NO COMPLETADO',
    usefulCommands: 'Comandos Útiles',
    liveValidation: 'Validación en Vivo',
    currentScore: 'PUNTUACIÓN ACTUAL',
    excellent: 'EXCELENTE',
    good: 'BUENO',
    needsWork: 'NECESITA TRABAJO',
    objectivesCompleted: 'Objetivos completados {count} / {total}',
    submitLab: 'Enviar Lab',
    back: 'Volver',
    timeLabel: 'Tiempo:',
    networkTopology: 'Topología de Red',
    typeCommand: 'Escribe el comando aquí...',
    startLabToEnter: 'Empieza el lab para ingresar comandos',
    labSubmitted: 'Lab Enviado',
    yourScore: 'Tu Puntuación',
    close: 'Cerrar',

    // Admin Dashboard
    adminDashboard: 'Panel de Admin',
    adminOverview: 'Resumen de Admin',
    totalUsers: 'Usuarios Totales',
    activeInstances: 'Instancias Activas',
    systemHealth: 'Salud del Sistema',
    recentActivity: 'Actividad Reciente',
    manageUsers: 'Administrar Usuarios',
    manageLabs: 'Administrar Labs',
    viewLogs: 'Ver Registros',
  },

  fr: {
    // Sidebar Navigation
    dashboard: 'Tableau de bord',
    myLabs: 'Mes Labs',
    achievements: 'Réalisations',
    leaderboard: 'Classement',
    settings: 'Paramètres',

    // Sidebar Buttons
    lightMode: 'Mode Clair',
    darkMode: 'Mode Sombre',
    english: 'English',
    arabic: 'العربية',
    signOut: 'Se Déconnecter',

    // Settings Page Tabs
    profile: 'Profil',
    notifications: 'Notifications',
    appearance: 'Apparence',
    privacy: 'Confidentialité',
    security: 'Sécurité',

    // Settings Page Labels
    theme: 'Thème',
    language: 'Langue',
    dangerZone: 'Zone Dangereuse',
    deleteAccount: 'Supprimer le Compte',
    deleteAccountDesc: 'Supprimer définitivement votre compte et toutes les données',

    // Common Buttons
    saveSettings: 'Enregistrer les Paramètres',
    cancel: 'Annuler',
    delete: 'Supprimer',
    confirm: 'Confirmer',

    // Profile Section
    name: 'Nom',
    email: 'Adresse Email',
    currentPassword: 'Mot de Passe Actuel',
    newPassword: 'Nouveau Mot de Passe',
    confirmPassword: 'Confirmer le Mot de Passe',
    changePassword: 'Changer le Mot de Passe',

    // Notifications Section
    emailNotifications: 'Notifications par Email',
    labReminders: 'Rappels de Lab',
    achievementAlerts: 'Alertes de Réalisations',

    // Privacy Section
    profileVisible: 'Profil Visible',
    showLeaderboard: 'Afficher dans le Classement',

    // Appearance Section
    chooseColorScheme: 'Choisissez votre palette de couleurs préférée',
    selectLanguage: 'Sélectionnez votre langue préférée',

    // Save States
    saving: 'Enregistrement...',
    saveChanges: 'Enregistrer les Modifications',
    savePreferences: 'Enregistrer les Préférences',

    // Danger Zone
    dangerZoneDesc: 'Actions irréversibles qui affecteront définitivement votre compte',

    // Language Names
    langNameEn: 'English',
    langNameAr: 'العربية',
    langNameEs: 'Español',
    langNameFr: 'Français',
    langNameDe: 'Deutsch',
    langNameZh: '中文',

    // Dashboard
    welcomeBack: 'Bon retour, {name}!',
    ccnaTrack: 'Vous avez terminé à {percent}% le parcours {track}',
    currentStreak: 'Série Actuelle',
    labsSolved: 'Labs Résolus',
    globalRank: 'Rang Mondial',
    hoursSpent: 'Heures Passées',
    achievementsCount: 'Réalisations',
    activeLabs: 'Labs Actifs',
    continueJourney: 'Continuez votre parcours',
    newLab: 'Nouveau Lab',
    status: 'Statut',
    score: 'Score',
    progress: 'Progrès',
    completed: 'terminé',
    resume: 'Reprendre',
    start: 'Commencer',
    noActiveLabs: 'Aucun lab actif.',
    browseLabs: 'Parcourir les Labs',
    completedLabs: 'Labs Terminés',
    reviewCompleted: 'Revoyez vos labs terminés',
    viewAll: 'Voir Tout',
    reviewLab: 'Revoir le Lab',
    stopped: 'arrêté',
    running: 'en cours',

    // My Labs
    labsTitle: 'Mes Labs',
    labsSubtitle: 'Suivez vos progrès',
    totalLabs: 'Labs Totaux',
    inProgress: 'En Cours',
    avgScore: 'Score Moyen',
    searchPlaceholder: 'Rechercher des labs...',
    allStatus: 'Tous les Statuts',
    notCompleted: 'Non Terminé',
    allLevels: 'Tous les Niveaux',
    beginner: 'Débutant',
    intermediate: 'Intermédiaire',
    advanced: 'Avancé',
    allCategories: 'Toutes les Catégories',
    objectives: 'Objectifs',
    more: '+{count} de plus...',
    resumeLab: 'Reprendre le Lab',
    startLab: 'Commencer le Lab',
    noLabsFound: 'Aucun lab trouvé.',
    adjustFilters: 'Essayez d\'ajuster vos filtres.',
    clearFilters: 'Effacer les Filtres',

    // Achievements
    achievementsTitle: 'Réalisations',
    achievementsSubtitle: 'Suivez vos étapes d\'apprentissage',
    totalPoints: 'Points Totaux',
    unlocked: 'Débloqué',
    completion: 'Achèvement',
    tierBronze: 'Bronze',
    tierSilver: 'Argent',
    tierGold: 'Or',
    tierPlatinum: 'Platine',
    pts: 'pts',
    labCompletion: 'Achèvement du Lab',
    speed: 'Vitesse',
    ofUnlocked: '{unlocked} sur {total} débloqués',

    // Leaderboard
    leaderboardTitle: 'Classement',
    leaderboardSubtitle: 'Rivalisez avec des étudiants du monde entier',
    yourRank: 'Votre Rang',
    points: 'Points',
    labs: 'Labs',
    rankings: 'Classements',
    trackPerformance: 'Suivez vos performances',
    thisWeek: 'Cette Semaine',
    thisMonth: 'Ce Mois',
    you: 'Vous',
    earnPoints: 'Gagnez des Points',
    weeklyReset: 'Réinitialisation Hebdomadaire',
    rewards: 'Récompenses',
    days: '{streak}j',

    // Lab Interface
    objectivesPanel: 'Objectifs',
    notCompletedObj: 'NON TERMINÉ',
    usefulCommands: 'Commandes Utiles',
    liveValidation: 'Validation en Direct',
    currentScore: 'SCORE ACTUEL',
    excellent: 'EXCELLENT',
    good: 'BIEN',
    needsWork: 'À AMÉLIORER',
    objectivesCompleted: 'Objectifs terminés {count} / {total}',
    submitLab: 'Soumettre le Lab',
    back: 'Retour',
    timeLabel: 'Temps:',
    networkTopology: 'Topologie Réseau',
    typeCommand: 'Tapez la commande ici...',
    startLabToEnter: 'Démarrez le lab',
    labSubmitted: 'Lab Soumis',
    yourScore: 'Votre Score',
    close: 'Fermer',

    // Admin Dashboard
    adminDashboard: 'Tableau de bord Admin',
    adminOverview: 'Vue d\'ensemble',
    totalUsers: 'Utilisateurs Totaux',
    activeInstances: 'Instances Activas',
    systemHealth: 'Santé du Système',
    recentActivity: 'Activité Récente',
    manageUsers: 'Gérer les Utilisateurs',
    manageLabs: 'Gérer les Labs',
    viewLogs: 'Voir les Logs',
  },

  de: {
    // Sidebar Navigation
    dashboard: 'Dashboard',
    myLabs: 'Meine Labs',
    achievements: 'Erfolge',
    leaderboard: 'Rangliste',
    settings: 'Einstellungen',

    // Sidebar Buttons
    lightMode: 'Heller Modus',
    darkMode: 'Dunkler Modus',
    english: 'English',
    arabic: 'العربية',
    signOut: 'Abmelden',

    // Settings Page Tabs
    profile: 'Profil',
    notifications: 'Benachrichtigungen',
    appearance: 'Erscheinungsbild',
    privacy: 'Datenschutz',
    security: 'Sicherheit',

    // Settings Page Labels
    theme: 'Design',
    language: 'Sprache',
    dangerZone: 'Gefahrenzone',
    deleteAccount: 'Konto löschen',
    deleteAccountDesc: 'Konto und alle Daten dauerhaft löschen',

    // Common Buttons
    saveSettings: 'Einstellungen speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    confirm: 'Bestätigen',

    // Profile Section
    name: 'Name',
    email: 'E-Mail-Adresse',
    currentPassword: 'Aktuelles Passwort',
    newPassword: 'Neues Passwort',
    confirmPassword: 'Passwort bestätigen',
    changePassword: 'Passwort ändern',

    // Notifications Section
    emailNotifications: 'E-Mail-Benachrichtigungen',
    labReminders: 'Lab-Erinnerungen',
    achievementAlerts: 'Erfolgs-Benachrichtigungen',

    // Privacy Section
    profileVisible: 'Profil sichtbar',
    showLeaderboard: 'In Rangliste anzeigen',

    // Appearance Section
    chooseColorScheme: 'Wählen Sie Ihr bevorzugtes Farbschema',
    selectLanguage: 'Wählen Sie Ihre bevorzugte Sprache',

    // Save States
    saving: 'Speichern...',
    saveChanges: 'Änderungen speichern',
    savePreferences: 'Einstellungen speichern',

    // Danger Zone
    dangerZoneDesc: 'Unwiderrufliche Aktionen, die Ihr Konto dauerhaft beeinflussen',

    // Language Names
    langNameEn: 'English',
    langNameAr: 'العربية',
    langNameEs: 'Español',
    langNameFr: 'Français',
    langNameDe: 'Deutsch',
    langNameZh: '中文',

    // Dashboard
    welcomeBack: 'Willkommen zurück, {name}!',
    ccnaTrack: 'Sie haben {percent}% des {track}-Tracks abgeschlossen',
    currentStreak: 'Aktuelle Serie',
    labsSolved: 'Gelöste Labs',
    globalRank: 'Globaler Rang',
    hoursSpent: 'Verbrachte Stunden',
    achievementsCount: 'Erfolge',
    activeLabs: 'Aktive Labs',
    continueJourney: 'Setzen Sie Ihre Lernreise fort',
    newLab: 'Neues Lab',
    status: 'Status',
    score: 'Punktzahl',
    progress: 'Fortschritt',
    completed: 'abgeschlossen',
    resume: 'Fortsetzen',
    start: 'Starten',
    noActiveLabs: 'Keine aktiven Labs.',
    browseLabs: 'Labs durchsuchen',
    completedLabs: 'Abgeschlossene Labs',
    reviewCompleted: 'Überprüfen Sie Ihre abgeschlossenen Labs',
    viewAll: 'Alle anzeigen',
    reviewLab: 'Lab überprüfen',
    stopped: 'gestoppt',
    running: 'läuft',

    // My Labs
    labsTitle: 'Meine Labs',
    labsSubtitle: 'Verfolgen Sie Ihren Fortschritt',
    totalLabs: 'Alle Labs',
    inProgress: 'In Bearbeitung',
    avgScore: 'Durchschn. Punktzahl',
    searchPlaceholder: 'Labs suchen...',
    allStatus: 'Alle Status',
    notCompleted: 'Nicht abgeschlossen',
    allLevels: 'Alle Stufen',
    beginner: 'Anfänger',
    intermediate: 'Mittelstufe',
    advanced: 'Fortgeschritten',
    allCategories: 'Alle Kategorien',
    objectives: 'Ziele',
    more: '+{count} weitere...',
    resumeLab: 'Lab fortsetzen',
    startLab: 'Lab starten',
    noLabsFound: 'Keine Labs gefunden.',
    adjustFilters: 'Passen Sie Ihre Filter an.',
    clearFilters: 'Filter löschen',

    // Achievements
    achievementsTitle: 'Erfolge',
    achievementsSubtitle: 'Verfolgen Sie Ihre Lernmeilensteine',
    totalPoints: 'Gesamtpunkte',
    unlocked: 'Freigeschaltet',
    completion: 'Abschluss',
    tierBronze: 'Bronze',
    tierSilver: 'Silber',
    tierGold: 'Gold',
    tierPlatinum: 'Platin',
    pts: 'Pkt',
    labCompletion: 'Lab-Abschluss',
    speed: 'Geschwindigkeit',
    ofUnlocked: '{unlocked} von {total} freigeschaltet',

    // Leaderboard
    leaderboardTitle: 'Rangliste',
    leaderboardSubtitle: 'Messen Sie sich mit Studenten weltweit',
    yourRank: 'Ihr Rang',
    points: 'Punkte',
    labs: 'Labs',
    rankings: 'Ranglisten',
    trackPerformance: 'Verfolgen Sie Ihre Leistung',
    thisWeek: 'Diese Woche',
    thisMonth: 'Diesen Monat',
    you: 'Sie',
    earnPoints: 'Punkte verdienen',
    weeklyReset: 'Wöchentlicher Reset',
    rewards: 'Belohnungen',
    days: '{streak}T',

    // Lab Interface
    objectivesPanel: 'Ziele',
    notCompletedObj: 'NICHT ABGESCHLOSSEN',
    usefulCommands: 'Nützliche Befehle',
    liveValidation: 'Live-Validierung',
    currentScore: 'AKTUELLE PUNKTZAHL',
    excellent: 'AUSGEZEICHNET',
    good: 'GUT',
    needsWork: 'VERBESSERUNGSWÜRDIG',
    objectivesCompleted: 'Ziele erreicht {count} / {total}',
    submitLab: 'Lab einreichen',
    back: 'Zurück',
    timeLabel: 'Zeit:',
    networkTopology: 'Netzwerktopologie',
    typeCommand: 'Befehl hier eingeben...',
    startLabToEnter: 'Starten Sie das Lab',
    labSubmitted: 'Lab eingereicht',
    yourScore: 'Ihre Punktzahl',
    close: 'Schließen',

    // Admin Dashboard
    adminDashboard: 'Admin-Dashboard',
    adminOverview: 'Admin-Übersicht',
    totalUsers: 'Gesamte Benutzer',
    activeInstances: 'Aktive Instanzen',
    systemHealth: 'Systemgesundheit',
    recentActivity: 'Letzte Aktivität',
    manageUsers: 'Benutzer verwalten',
    manageLabs: 'Labs verwalten',
    viewLogs: 'Protokolle anzeigen',
  },

  zh: {
    // Sidebar Navigation
    dashboard: '仪表板',
    myLabs: '我的实验室',
    achievements: '成就',
    leaderboard: '排行榜',
    settings: '设置',

    // Sidebar Buttons
    lightMode: '浅色模式',
    darkMode: '深色模式',
    english: 'English',
    arabic: '阿拉伯语',
    signOut: '退出登录',

    // Settings Page Tabs
    profile: '个人资料',
    notifications: '通知',
    appearance: '外观',
    privacy: '隐私',
    security: '安全',

    // Settings Page Labels
    theme: '主题',
    language: '语言',
    dangerZone: '危险区域',
    deleteAccount: '删除账户',
    deleteAccountDesc: '永久删除您的账户和所有数据',

    // Common Buttons
    saveSettings: '保存设置',
    cancel: '取消',
    delete: '删除',
    confirm: '确认',

    // Profile Section
    name: '姓名',
    email: '电子邮件',
    currentPassword: '当前密码',
    newPassword: '新密码',
    confirmPassword: '确认密码',
    changePassword: '更改密码',

    // Notifications Section
    emailNotifications: '电子邮件通知',
    labReminders: '实验室提醒',
    achievementAlerts: '成就提醒',

    // Privacy Section
    profileVisible: '个人资料可见',
    showLeaderboard: '显示在排行榜',

    // Appearance Section
    chooseColorScheme: '选择您偏好的配色方案',
    selectLanguage: '选择您偏好的语言',

    // Save States
    saving: '保存中...',
    saveChanges: '保存更改',
    savePreferences: '保存偏好',

    // Danger Zone
    dangerZoneDesc: '不可逆的操作，将永久影响您的账户',

    // Language Names
    langNameEn: 'English',
    langNameAr: 'العربية',
    langNameEs: 'Español',
    langNameFr: 'Français',
    langNameDe: 'Deutsch',
    langNameZh: '中文',

    // Dashboard
    welcomeBack: '欢迎回来，{name}！',
    ccnaTrack: '您已完成 {track} 的 {percent}%',
    currentStreak: '当前连续',
    labsSolved: '解决的实验',
    globalRank: '全球排名',
    hoursSpent: '花费的时间',
    achievementsCount: '成就',
    activeLabs: '活跃实验',
    continueJourney: '继续学习',
    newLab: '新实验',
    status: '状态',
    score: '分数',
    progress: '进度',
    completed: '已完成',
    resume: '继续',
    start: '开始',
    noActiveLabs: '没有活跃的实验。',
    browseLabs: '浏览实验',
    completedLabs: '已完成的实验',
    reviewCompleted: '复习您已完成的实验',
    viewAll: '查看全部',
    reviewLab: '复习实验',
    stopped: '已停止',
    running: '运行中',

    // My Labs
    labsTitle: '我的实验',
    labsSubtitle: '跟踪您的进度',
    totalLabs: '总实验数',
    inProgress: '进行中',
    avgScore: '平均分',
    searchPlaceholder: '搜索实验...',
    allStatus: '所有状态',
    notCompleted: '未完成',
    allLevels: '所有级别',
    beginner: '初学者',
    intermediate: '中级',
    advanced: '高级',
    allCategories: '所有类别',
    objectives: '目标',
    more: '还有 +{count} 个...',
    resumeLab: '继续实验',
    startLab: '开始实验',
    noLabsFound: '未找到实验。',
    adjustFilters: '尝试调整过滤条件。',
    clearFilters: '清除过滤器',

    // Achievements
    achievementsTitle: '成就',
    achievementsSubtitle: '跟踪您的学习里程碑',
    totalPoints: '总积分',
    unlocked: '已解锁',
    completion: '完成度',
    tierBronze: '青铜',
    tierSilver: '白银',
    tierGold: '黄金',
    tierPlatinum: '铂金',
    pts: '分',
    labCompletion: '实验完成',
    speed: '速度',
    ofUnlocked: '{unlocked} / {total} 已解锁',

    // Leaderboard
    leaderboardTitle: '排行榜',
    leaderboardSubtitle: '与全球学生竞争并提升排名',
    yourRank: '您的排名',
    points: '积分',
    labs: '实验',
    rankings: '排名',
    trackPerformance: '跟踪您的表现',
    thisWeek: '本周',
    thisMonth: '本月',
    you: '您',
    earnPoints: '赚取积分',
    weeklyReset: '每周重置',
    rewards: '奖励',
    days: '{streak}天',

    // Lab Interface
    objectivesPanel: '目标',
    notCompletedObj: '未完成',
    usefulCommands: '常用命令',
    liveValidation: '实时验证',
    currentScore: '当前分数',
    excellent: '优秀',
    good: '良好',
    needsWork: '需要努力',
    objectivesCompleted: '已完成目标 {count} / {total}',
    submitLab: '提交实验',
    back: '返回',
    timeLabel: '时间：',
    networkTopology: '网络拓扑',
    typeCommand: '在此输入命令...',
    startLabToEnter: '启动实验',
    labSubmitted: '实验已提交',
    yourScore: '您的分数',
    close: '关闭',

    // Admin Dashboard
    adminDashboard: '管理后台',
    adminOverview: '管理概览',
    totalUsers: '总用户',
    activeInstances: '活跃实例',
    systemHealth: '系统健康',
    recentActivity: '近期活动',
    manageUsers: '管理用户',
    manageLabs: '管理实验',
    viewLogs: '查看日志',
  },
};
