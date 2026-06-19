# Data Models

All models live in `SmartBackend/src/database/schemas/`. One file per model, exported as default.

---

## User

Collection: `users`

```
name            String   required, trimmed
email           String   required, unique, lowercase
password        String   select:false — optional for OAuth users; bcrypt salt 12
role            Enum     student | admin | instructor   default: student
plan            Enum     free | pro | enterprise        default: free
avatar          String   default: ""
isActive        Boolean  default: true
status          Enum     active | inactive | suspended  default: active
refreshToken    String   select:false

emailVerified              Boolean  default: false
emailVerificationToken     String   (SHA-256 hashed)
emailVerificationExpires   Date

passwordResetToken         String   (SHA-256 hashed)
passwordResetExpires       Date

provider    Enum     local | github | google   default: local
providerId  String

# Denormalized stats (updated via $inc on lab completion)
labsCompleted  Number  default: 0
totalPoints    Number  default: 0
streak         Number  default: 0
lastLabDate    Date

timestamps: true
index: { provider, providerId }
```

Instance methods: `comparePassword(candidatePassword)`

---

## Lab

Collection: `labs`

```
labId          String   required, unique  e.g. "lab-1"
name           String   required
description    String   required
difficulty     Enum     beginner | intermediate | advanced
category       String   required
estimatedTime  String   required  e.g. "45 min"
topology       [TopologyNode]
objectives     [String]
commands       [String]  suggested commands
isPublished    Boolean  default: true

timestamps: true
```

TopologyNode (subdocument, no _id):
```
nodeId      String   required
type        Enum     router | switch | pc | server | cloud
name        String   required
position    { x: Number, y: Number }
ip          String
status      Enum     active | inactive | error   default: active
connections [String]  array of nodeIds
```

---

## UserLab

Collection: `userlabs` — one record per user per lab

```
userId              ObjectId  ref: User
labId               String    references Lab.labId
status              Enum      not-started | running | stopped | completed
progress            Number    0–100
score               Number    default: 0
completedObjectives [Number]  indices of completed objectives
commandHistory      [TerminalEntry]  capped at last 500 via $slice
currentDevice       String
startedAt           Date
completedAt         Date
lastActivity        Date      default: now

timestamps: true
index: { userId, labId } unique
```

TerminalEntry (subdocument, no _id):
```
entryId    String   required
timestamp  Date     default: now
device     String   required
command    String   required
output     String   default: ""
isError    Boolean  default: false
```

---

## Achievement

Collection: `achievements`

```
achievementId  String  required, unique  e.g. "ach-1"
name           String  required
description    String  required
points         Number  required
category       Enum    Lab Completion | Networking Skills | Security | Consistency | Social | Speed
tier           Enum    bronze | silver | gold | platinum
maxProgress    Number  default: 1  (e.g. 5 for "complete 5 labs")
icon           String  default: "🏆"

timestamps: true
```

---

## UserAchievement

Collection: `userachievements` — one record per user per achievement

```
userId         ObjectId  ref: User
achievementId  String    references Achievement.achievementId
progress       Number    default: 0
unlockedAt     Date
unlocked       Boolean   default: false

timestamps: true
index: { userId, achievementId } unique
```

---

## LeaderboardEntry

Collection: `leaderboardentries` — one record per user per period per week/month

```
userId         ObjectId  ref: User
totalPoints    Number    default: 0
labsCompleted  Number    default: 0
streak         Number    default: 0
avgScore       Number    default: 0
period         Enum      weekly | monthly
weekOf         Date      Monday of week (weekly) or 1st of month (monthly)
trend          Enum      up | down | same   default: same
lastActive     Date      default: now

timestamps: true
index: { userId, period, weekOf } unique
index: { period, weekOf, totalPoints: -1 }  (for sorted queries)
```

Points formula: `totalScore (sum of lab scores) + achievementBonus (unlocked achievements × 100)`

---

## UserSettings

Collection: `usersettings` — one record per user

```
userId  ObjectId  ref: User, unique

theme     Enum  dark | light | auto   default: dark
language  Enum  en | ar | fr | de | es | zh   default: en

notifications:
  email         Boolean  default: true
  push          Boolean  default: true
  labReminders  Boolean  default: true
  achievements  Boolean  default: true
  marketing     Boolean  default: false

privacy:
  showProfile     Boolean  default: true
  showLeaderboard Boolean  default: true
  showActivity    Boolean  default: true

timestamps: true
```

Created automatically on user register and OAuth sign-up.

---

## ServerMetric

Collection: `servermetrics`

```
serverId   String  required, unique  e.g. "srv-1"
name       String  required
type       Enum    web | database | cache | lab-vm
status     Enum    healthy | warning | critical | offline   default: healthy
cpu        Number  0–100
memory     Number  0–100
disk       Number  0–100
uptime     Number  seconds
location   String
recordedAt Date    default: now

timestamps: true
```

---

## Key Relationships

```
User ──< UserLab >── Lab
User ──< UserAchievement >── Achievement
User ──< LeaderboardEntry
User ──  UserSettings  (1:1)
```

- `UserLab.labId` → `Lab.labId` (string FK, not ObjectId)
- `UserAchievement.achievementId` → `Achievement.achievementId` (string FK)
- All other refs use MongoDB ObjectId
