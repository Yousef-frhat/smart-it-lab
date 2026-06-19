import fs from 'fs';
import path from 'path';

const filePath = path.resolve('./src/app/utils/translations.ts');
let content = fs.readFileSync(filePath, 'utf8');

const newInterfaceKeys = `
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

const enTranslations = `
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
`;

const arTranslations = `
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
`;

const esTranslations = `
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
    adminDashboard: 'Panel de Admin',
    adminOverview: 'Resumen de Admin',
    totalUsers: 'Usuarios Totales',
    activeInstances: 'Instancias Activas',
    systemHealth: 'Salud del Sistema',
    recentActivity: 'Actividad Reciente',
    manageUsers: 'Administrar Usuarios',
    manageLabs: 'Administrar Labs',
    viewLogs: 'Ver Registros',
`;

const frTranslations = esTranslations.replace(/welcomeBack.*viewLogs: '[^']+',/g, ''); // We will just use ES for others as a placeholder or proper translation. I will generate proper translations for FR, DE, ZH using regex or just provide English for now since I can't accurately translate all without a tool, but wait, I can translate it to French, German, Chinese!

const getLangStr = (lang) => {
  if (lang === 'fr') return `
    welcomeBack: 'Bon retour, {name}!',
    ccnaTrack: 'Vous êtes à {percent}% du parcours {track}',
    currentStreak: 'Série Actuelle',
    labsSolved: 'Labs Résolus',
    globalRank: 'Rang Mondial',
    hoursSpent: 'Heures Passées',
    achievementsCount: 'Réalisations',
    activeLabs: 'Labs Actifs',
    continueJourney: 'Continuez votre parcours d'apprentissage',
    newLab: 'Nouveau Lab',
    status: 'Statut',
    score: 'Score',
    progress: 'Progrès',
    completed: 'terminé',
    resume: 'Reprendre',
    start: 'Commencer',
    noActiveLabs: 'Aucun lab actif. Prêt à commencer ?',
    browseLabs: 'Parcourir les Labs',
    completedLabs: 'Labs Terminés',
    reviewCompleted: 'Revoyez vos labs terminés',
    viewAll: 'Voir Tout',
    reviewLab: 'Revoir le Lab',
    stopped: 'arrêté',
    running: 'en cours',
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
    adjustFilters: 'Essayez d'ajuster vos filtres.',
    clearFilters: 'Effacer les Filtres',
    achievementsTitle: 'Réalisations',
    achievementsSubtitle: 'Suivez vos étapes d'apprentissage',
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
    startLabToEnter: 'Démarrez le lab pour taper des commandes',
    labSubmitted: 'Lab Soumis',
    yourScore: 'Votre Score',
    close: 'Fermer',
    adminDashboard: 'Tableau de bord Admin',
    adminOverview: 'Vue d'ensemble',
    totalUsers: 'Utilisateurs Totaux',
    activeInstances: 'Instances Actives',
    systemHealth: 'Santé du Système',
    recentActivity: 'Activité Récente',
    manageUsers: 'Gérer les Utilisateurs',
    manageLabs: 'Gérer les Labs',
    viewLogs: 'Voir les Logs',
`;
  if (lang === 'de') return `
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
    adminDashboard: 'Admin-Dashboard',
    adminOverview: 'Admin-Übersicht',
    totalUsers: 'Gesamte Benutzer',
    activeInstances: 'Aktive Instanzen',
    systemHealth: 'Systemgesundheit',
    recentActivity: 'Letzte Aktivität',
    manageUsers: 'Benutzer verwalten',
    manageLabs: 'Labs verwalten',
    viewLogs: 'Protokolle anzeigen',
`;
  if (lang === 'zh') return `
    welcomeBack: '欢迎回来，{name}！',
    ccnaTrack: '您已完成 {track} 轨道的 {percent}%',
    currentStreak: '当前连续',
    labsSolved: '解决的实验',
    globalRank: '全球排名',
    hoursSpent: '花费的时间',
    achievementsCount: '成就',
    activeLabs: '活跃实验',
    continueJourney: '继续您的学习之旅',
    newLab: '新实验',
    status: '状态',
    score: '分数',
    progress: '进度',
    completed: '已完成',
    resume: '继续',
    start: '开始',
    noActiveLabs: '没有活跃的实验。准备开始新的实验了吗？',
    browseLabs: '浏览实验',
    completedLabs: '已完成的实验',
    reviewCompleted: '复习您已完成的实验',
    viewAll: '查看全部',
    reviewLab: '复习实验',
    stopped: '已停止',
    running: '运行中',
    labsTitle: '我的实验',
    labsSubtitle: '跟踪您在所有实验练习中的进度',
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
    noLabsFound: '未找到符合条件的实验。',
    adjustFilters: '尝试调整过滤条件。',
    clearFilters: '清除过滤器',
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
    startLabToEnter: '启动实验以输入命令',
    labSubmitted: '实验已提交',
    yourScore: '您的分数',
    close: '关闭',
    adminDashboard: '管理后台',
    adminOverview: '管理概览',
    totalUsers: '总用户',
    activeInstances: '活跃实例',
    systemHealth: '系统健康',
    recentActivity: '近期活动',
    manageUsers: '管理用户',
    manageLabs: '管理实验',
    viewLogs: '查看日志',
`;
  return '';
};

content = content.replace('export interface Translations {', `export interface Translations {${newInterfaceKeys}`);
content = content.replace('en: {', `en: {${enTranslations}`);
content = content.replace('ar: {', `ar: {${arTranslations}`);
content = content.replace('es: {', `es: {${esTranslations}`);
content = content.replace('fr: {', `fr: {${getLangStr('fr')}`);
content = content.replace('de: {', `de: {${getLangStr('de')}`);
content = content.replace('zh: {', `zh: {${getLangStr('zh')}`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('done');
