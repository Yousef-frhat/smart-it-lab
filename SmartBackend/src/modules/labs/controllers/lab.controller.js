import Lab from "../../../database/schemas/lab.model.js";
import UserLab from "../../../database/schemas/user-lab.model.js";
import User from "../../../database/schemas/user.model.js";
import Achievement from "../../../database/schemas/achievement.model.js";
import UserAchievement from "../../../database/schemas/user-achievement.model.js";
import LeaderboardEntry from "../../../database/schemas/leaderboard.model.js";
import { uuid } from "../../../common/utils/uuid.js";
import { executeCommand } from "../terminal-engine.js";
import { emitLabEvent } from "../../events/connection-registry.js";


// ─── Helper: format UserLab as frontend Lab shape ──────────────
const formatLab = (lab, userLab = null) => {
  const base = {
    id: lab.labId,
    labId: lab.labId,
    name: lab.name,
    description: lab.description,
    difficulty: lab.difficulty,
    category: lab.category,
    module: lab.module || "",   // ← expose for frontend grouping
    order: lab.order ?? 0,      // ← expose for sorting
    estimatedTime: lab.estimatedTime,
    topology: lab.topology.map((n) => ({
      id: n.nodeId,
      type: n.type,
      name: n.name,
      position: n.position,
      ip: n.ip,
      status: n.status,
      connections: n.connections,
    })),
    objectives: lab.objectives,
    commands: lab.commands,
    hints: lab.hints || [],
    status: "not-started",
    progress: 0,
    score: 0,
    completedObjectives: [],
  };

  if (userLab) {
    base.status = userLab.status;
    base.progress = userLab.progress;
    base.score = userLab.score;
    base.completedObjectives = userLab.completedObjectives;
    base.startedAt = userLab.startedAt;
    base.completedAt = userLab.completedAt;
  }

  return base;
};

// ─── FIX 3: Achievement unlock helper ───────────────────────────
/**
 * Achievement rules keyed by achievementId (matches seed data).
 * Each rule receives (allCompletedUserLabs, currentUserLab).
 */
const ACHIEVEMENT_RULES = [
  {
    achievementId: "ach-1", // "First Steps" — complete 1 lab
    check: (completedLabs) => completedLabs.length >= 1,
  },
  {
    achievementId: "ach-4", // "Lab Marathon" — complete 10 labs
    check: (completedLabs) => completedLabs.length >= 10,
  },
  {
    achievementId: "ach-6", // "Network Architect" — complete 25 labs
    check: (completedLabs) => completedLabs.length >= 25,
  },
  {
    achievementId: "ach-2", // "Speed Runner" — finish in < 10 minutes
    check: (completedLabs, currentUserLab) => {
      if (!currentUserLab?.startedAt) return false;
      const durationMs = Date.now() - new Date(currentUserLab.startedAt).getTime();
      return durationMs < 10 * 60 * 1000;
    },
  },
  {
    achievementId: "ach-ccna-ready", // "CCNA Ready" — complete 40+ labs
    check: (completedLabs) => completedLabs.length >= 40,
  },
  {
    achievementId: "ach-5", // "Consistent Learner" — checked server-side via date logic
    check: (completedLabs) => {
      // Award if user has completed labs on 5 or more distinct calendar days
      const days = new Set(
        completedLabs
          .filter((l) => l.completedAt)
          .map((l) => new Date(l.completedAt).toDateString())
      );
      return days.size >= 5;
    },
  },
];

/**
 * Checks achievement rules against the user's current state and unlocks
 * any newly earned achievements.  Returns an array of newly-unlocked names.
 * Non-critical — caller must not throw if this fails.
 */
async function checkAndUnlockAchievements(userId, currentUserLab) {
  // All labs this user has completed (including the one just finished)
  const completedLabs = await UserLab.find({
    userId,
    status: "completed",
  }).lean();

  // Achievements the user already has (by achievementId string)
  const alreadyUnlocked = await UserAchievement.find({
    userId,
    unlocked: true,
  }).lean();
  const alreadyUnlockedIds = new Set(alreadyUnlocked.map((ua) => ua.achievementId));

  const newlyUnlocked = [];

  for (const rule of ACHIEVEMENT_RULES) {
    // Skip if already unlocked
    if (alreadyUnlockedIds.has(rule.achievementId)) continue;

    // Verify the achievement exists in DB
    const achievement = await Achievement.findOne({
      achievementId: rule.achievementId,
    }).lean();
    if (!achievement) continue;

    // Run the rule check
    if (rule.check(completedLabs, currentUserLab)) {
      await UserAchievement.findOneAndUpdate(
        { userId, achievementId: rule.achievementId },
        {
          $set: {
            unlocked: true,
            unlockedAt: new Date(),
            progress: achievement.maxProgress,
          },
        },
        { upsert: true }
      );
      newlyUnlocked.push(achievement.name);
    }
  }

  return newlyUnlocked;
}

// ─── FIX 4: Leaderboard auto-update helper ──────────────────────
/**
 * Recalculates and upserts the leaderboard entry for this user for the
 * current week (weekly) and current month (monthly).
 * Non-critical — errors are logged but never thrown.
 */
async function updateLeaderboard(userId) {
  try {
    const completedLabs = await UserLab.find({
      userId,
      status: "completed",
    }).lean();

    const unlockedAchievements = await UserAchievement.find({
      userId,
      unlocked: true,
    }).lean();

    const totalScore = completedLabs.reduce((sum, l) => sum + (l.score || 0), 0);
    const labsCompleted = completedLabs.length;
    const achievementBonus = unlockedAchievements.length * 100;
    const totalPoints = totalScore + achievementBonus;

    // Calculate average score
    const avgScore =
      labsCompleted > 0 ? Math.round(totalScore / labsCompleted) : 0;

    // Fetch user's current streak
    const userDoc = await User.findById(userId).lean();
    const streak = userDoc?.streak || 0;

    // Current week's Monday (for "weekly" period)
    const now = new Date();
    const weekOf = new Date(now);
    weekOf.setHours(0, 0, 0, 0);
    weekOf.setDate(now.getDate() - ((now.getDay() + 6) % 7)); // Monday

    // Current month's first day (for "monthly" period)
    const monthOf = new Date(now.getFullYear(), now.getMonth(), 1);

    // Upsert both periods in parallel
    await Promise.all([
      LeaderboardEntry.findOneAndUpdate(
        { userId, period: "weekly", weekOf },
        {
          $set: {
            totalPoints,
            labsCompleted,
            avgScore,
            streak,
            lastActive: now,
          },
        },
        { upsert: true, new: true }
      ),
      LeaderboardEntry.findOneAndUpdate(
        { userId, period: "monthly", weekOf: monthOf },
        {
          $set: {
            totalPoints,
            labsCompleted,
            avgScore,
            streak,
            lastActive: now,
          },
        },
        { upsert: true, new: true }
      ),
    ]);
  } catch (err) {
    // Non-critical — don't throw, just log
    console.error("Leaderboard update failed:", err.message);
  }
}

// ─── GET ALL LABS ────────────────────────────────────────────────
// Security: escape special regex characters to prevent ReDoS attacks
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Security: allowed difficulty values — prevents NoSQL operator injection
const VALID_DIFFICULTIES = new Set(["beginner", "intermediate", "advanced"]);

export const getLabs = async (req, res, next) => {
  try {
    const { difficulty, category, search } = req.query;

    const filter = { isPublished: true };

    // Security Fix: validate difficulty against allowlist
    if (difficulty && VALID_DIFFICULTIES.has(difficulty)) {
      filter.difficulty = difficulty;
    }

    // Security Fix: escape regex inputs before passing to MongoDB
    if (category) {
      filter.category = { $regex: escapeRegex(String(category).slice(0, 100)), $options: "i" };
    }
    if (search) {
      const safeSearch = escapeRegex(String(search).slice(0, 100));
      filter.$or = [
        { name:        { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
      ];
    }

    const labs = await Lab.find(filter).sort({ order: 1, createdAt: 1 }).lean();

    // Fetch this user's progress for each lab
    const userId = req.user?._id;
    let userLabMap = {};
    if (userId) {
      const userLabs = await UserLab.find({
        userId,
        labId: { $in: labs.map((l) => l.labId) },
      }).lean();
      userLabs.forEach((ul) => (userLabMap[ul.labId] = ul));
    }

    res.json({
      success: true,
      data: {
        labs: labs.map((lab) => formatLab(lab, userLabMap[lab.labId])),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE LAB ─────────────────────────────────────────────
export const getLabById = async (req, res, next) => {
  try {
    const lab = await Lab.findOne({ labId: req.params.id, isPublished: true }).lean();
    if (!lab) {
      return res.status(404).json({ success: false, message: "Lab not found." });
    }

    const userLab = req.user
      ? await UserLab.findOne({ userId: req.user._id, labId: req.params.id }).lean()
      : null;

    res.json({
      success: true,
      data: { lab: formatLab(lab, userLab) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── START LAB ──────────────────────────────────────────────────
export const startLab = async (req, res, next) => {
  try {
    const lab = await Lab.findOne({ labId: req.params.id }).lean();
    if (!lab) {
      return res.status(404).json({ success: false, message: "Lab not found." });
    }

    const userLab = await UserLab.findOneAndUpdate(
      { userId: req.user._id, labId: req.params.id },
      {
        $set: {
          status: "running",
          lastActivity: new Date(),
        },
        $setOnInsert: {
          startedAt: new Date(),
          progress: 0,
          score: 0,
          completedObjectives: [],
          commandHistory: [],
        },
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: "Lab started.",
      data: { lab: formatLab(lab, userLab) },
    });
  } catch (error) {
    next(error);
  }
};

// ─── STOP LAB ───────────────────────────────────────────────────
export const stopLab = async (req, res, next) => {
  try {
    const lab = await Lab.findOne({ labId: req.params.id }).lean();
    if (!lab) {
      return res.status(404).json({ success: false, message: "Lab not found." });
    }

    // Read current state first to decide final status
    const existing = await UserLab.findOne({
      userId: req.user._id,
      labId: req.params.id,
    }).lean();

    if (!existing) {
      return res.status(400).json({ success: false, message: "Lab instance not found. Start the lab first." });
    }

    // If already at 100% progress, mark completed; otherwise stopped
    const finalStatus = existing.progress >= 100 ? "completed" : "stopped";
    const updateFields = { status: finalStatus, lastActivity: new Date() };
    if (finalStatus === "completed" && !existing.completedAt) {
      updateFields.completedAt = new Date();
    }

    const userLab = await UserLab.findOneAndUpdate(
      { userId: req.user._id, labId: req.params.id },
      { $set: updateFields },
      { new: true }
    );

    res.json({
      success: true,
      message: "Lab stopped.",
      data: { lab: formatLab(lab, userLab) },
    });

    // ── Trigger achievement check + leaderboard sync on stop (non-blocking) ──
    checkAndUnlockAchievements(req.user._id, userLab)
      .catch((err) => console.error("Achievement check on stop failed:", err.message));
    updateLeaderboard(req.user._id);
  } catch (error) {
    next(error);
  }
};

// ─── SAVE PROGRESS ──────────────────────────────────────────────
export const saveProgress = async (req, res, next) => {
  try {
    const { progress, score, completedObjectives } = req.body;

    const lab = await Lab.findOne({ labId: req.params.id }).lean();
    if (!lab) {
      return res.status(404).json({ success: false, message: "Lab not found." });
    }

    const updates = {
      lastActivity: new Date(),
    };
    if (progress !== undefined) updates.progress = progress;
    if (score !== undefined) updates.score = score;
    if (completedObjectives !== undefined) updates.completedObjectives = completedObjectives;

    // Auto-complete if progress reaches 100; otherwise keep as stopped (resumable)
    if (progress >= 100) {
      updates.status = "completed";
      updates.completedAt = new Date();

      // Streak calculation
      const userForStreak = await User.findById(req.user._id).lean();
      const today = new Date();
      const todayUTC = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
      let newStreak = 1;
      if (userForStreak?.lastLabDate) {
        const last = new Date(userForStreak.lastLabDate);
        const lastUTC = Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), last.getUTCDate());
        const diffDays = (todayUTC - lastUTC) / (1000 * 60 * 60 * 24);
        if (diffDays === 0) {
          newStreak = userForStreak.streak || 1;
        } else if (diffDays === 1) {
          newStreak = (userForStreak.streak || 0) + 1;
        } else {
          newStreak = 1;
        }
      }

      // Update denormalised stats on User
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { labsCompleted: 1, totalPoints: score || 0 },
        $set: { lastLabDate: new Date(), streak: newStreak },
      });
    } else {
      // Partial save — mark as stopped so it appears as resumable in the dashboard
      updates.status = "stopped";
    }

    const userLab = await UserLab.findOneAndUpdate(
      { userId: req.user._id, labId: req.params.id },
      { $set: updates },
      { new: true }
    );

    if (!userLab) {
      return res.status(400).json({ success: false, message: "Lab instance not found. Start the lab first." });
    }

    res.json({
      success: true,
      message: "Progress saved.",
      data: { lab: formatLab(lab, userLab) },
    });

    // ── FIX 3 + 4: Run achievements & leaderboard update on completion ──
    if (progress >= 100) {
      // Compute the REAL score from completed objectives (not the frontend-passed score)
      // This ensures lab_complete SSE always reflects actual objective completion rate
      const totalObjectives = lab.objectives?.length || 1;
      const completedObjArray = completedObjectives ?? userLab.completedObjectives ?? [];
      const completedCount = completedObjArray.length;
      const realScore = Math.round((completedCount / totalObjectives) * 100);

      // Check and unlock achievements (non-blocking)
      checkAndUnlockAchievements(req.user._id, userLab)
        .then((unlockedAchievements) => {
          emitLabEvent(req.params.id, "lab_complete", {
            score: realScore,
            completedObjectives: completedObjArray,
            unlockedAchievements,
          });
        })
        .catch((err) => {
          console.error("Achievement check failed:", err.message);
          // Still emit the event even if achievement check fails
          emitLabEvent(req.params.id, "lab_complete", {
            score: realScore,
            completedObjectives: completedObjArray,
            unlockedAchievements: [],
          });
        });

      // Update leaderboard (non-blocking, non-critical)
      updateLeaderboard(req.user._id);
    } else {
      // Emit progress SSE event for non-completion saves
      emitLabEvent(req.params.id, "progress", {
        progress: userLab.progress,
        score: userLab.score,
      });
    }
  } catch (error) {
    next(error);
  }
};

// ─── EXECUTE TERMINAL COMMAND ───────────────────────────────────
export const runCommand = async (req, res, next) => {
  const start = Date.now();
  try {
    const { command, device } = req.body;

    if (!command || typeof command !== "string") {
      return res.status(400).json({ success: false, message: "Command is required." });
    }

    // Verify lab exists and user has an active instance
    const userLab = await UserLab.findOne({
      userId: req.user._id,
      labId: req.params.id,
      status: "running",
    });

    if (!userLab) {
      return res.status(400).json({
        success: false,
        message: "No active lab instance. Start the lab first.",
      });
    }

    const { output, isError } = executeCommand(command, device);

    const entry = {
      entryId: `cmd-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date(),
      device: device || "Router",
      command,
      output,
      isError,
    };

    // Append to history and update lastActivity/currentDevice
    await UserLab.findByIdAndUpdate(userLab._id, {
      $push: { commandHistory: { $each: [entry], $slice: -500 } },
      $set: {
        lastActivity: new Date(),
        currentDevice: device || userLab.currentDevice,
      },
    });

    res.json({
      success: true,
      data: { entry },
    });

    // Emit terminal output event via SSE
    emitLabEvent(req.params.id, "terminal_output", {
      device: entry.device,
      command: entry.command,
      isError: entry.isError,
    });

    // ── Objective Validation ─────────────────────────────────────────────────
    // Uses lab.objectiveCommands[i] — an array of keyword triggers per objective.
    // An objective is satisfied when the typed command CONTAINS any of its keywords.
    // Falls back to lab.commands[i] exact match if objectiveCommands is absent.

    const normalize = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim();
    const normalizedInput = normalize(command);

    const labDoc = await Lab.findOne({ labId: req.params.id }).lean();

    if (labDoc) {
      const freshUserLab = await UserLab.findById(userLab._id).lean();
      const alreadyCompleted = new Set(freshUserLab.completedObjectives || []);
      const objectives = labDoc.objectives || [];
      const totalObjectives = objectives.length;
      const newlyCompletedIds = [];

      // ── Match ALL objectives that this command satisfies (not just the first) ──
      for (let i = 0; i < totalObjectives; i++) {
        if (alreadyCompleted.has(i)) continue;

        // Prefer objectiveCommands[i] (keyword array) over commands[i] (exact)
        const triggers = labDoc.objectiveCommands?.[i];

        if (triggers && triggers.length > 0) {
          // Contains match — any trigger keyword found anywhere in the typed command
          const matched = triggers.some((trigger) =>
            normalizedInput.includes(normalize(trigger))
          );
          if (matched) {
            alreadyCompleted.add(i);
            newlyCompletedIds.push(i);
            console.log(`[ObjectiveValidator] ✅ obj[${i}] matched via objectiveCommands: "${normalizedInput}"`);
            // No break — continue checking remaining objectives
          }
        } else if (labDoc.commands?.[i]) {
          // Fallback: exact match against lab.commands[i]
          const expected = normalize(
            typeof labDoc.commands[i] === 'string'
              ? labDoc.commands[i]
              : (labDoc.commands[i]?.command ?? '')
          );
          if (expected && normalizedInput === expected) {
            alreadyCompleted.add(i);
            newlyCompletedIds.push(i);
            console.log(`[ObjectiveValidator] ✅ obj[${i}] matched via commands exact: "${normalizedInput}"`);
            // No break — continue checking remaining objectives
          }
        }
      }

      if (newlyCompletedIds.length > 0) {
        const completedArray = Array.from(alreadyCompleted);
        const score = totalObjectives > 0
          ? Math.round((completedArray.length / totalObjectives) * 100)
          : 0;
        const progress = score;

        console.log(`[ObjectiveValidator] Score=${score}% (${completedArray.length}/${totalObjectives}) — newly completed: [${newlyCompletedIds.join(',')}]`);

        const updates = {
          completedObjectives: completedArray,
          progress,
          score,
          lastActivity: new Date(),
        };
        if (progress >= 100) {
          updates.status = 'completed';
          updates.completedAt = new Date();
        }

        await UserLab.findByIdAndUpdate(userLab._id, { $set: updates });

        const ssePayload = { progress, score, objectiveId: newlyCompletedIds[0], completedObjectives: completedArray };
        console.log(`[SSEEmitter] progress:`, JSON.stringify(ssePayload));
        emitLabEvent(req.params.id, 'progress', ssePayload);

        // Emit objective_complete for each newly completed objective
        for (const objId of newlyCompletedIds) {
          const objName = typeof objectives[objId] === 'string'
            ? objectives[objId]
            : `Objective ${objId + 1}`;
          emitLabEvent(req.params.id, 'objective_complete', {
            objectiveId: objId,
            name: objName,
            score,
          });
        }

        if (progress >= 100) {
          emitLabEvent(req.params.id, 'lab_complete', {
            score,
            completedObjectives: completedArray,
            unlockedAchievements: [],
          });
        }
      }
    }
    // ── End Objective Validation ─────────────────────────────────────────────
    
    // Performance logging
    const elapsed = Date.now() - start;
    if (elapsed > 100) {
      console.warn(`[SLOW] terminal command took ${elapsed}ms`);
    }
  } catch (error) {
    next(error);
  }
};

// ─── GET OBJECTIVES ─────────────────────────────────────────────
export const getObjectives = async (req, res, next) => {
  try {
    const lab = await Lab.findOne({ labId: req.params.id }).lean();
    if (!lab) {
      return res.status(404).json({ success: false, message: "Lab not found." });
    }

    const userLab = req.user
      ? await UserLab.findOne({ userId: req.user._id, labId: req.params.id }).lean()
      : null;

    const completedObjectives = userLab?.completedObjectives || [];

    res.json({
      success: true,
      data: {
        objectives: lab.objectives.map((text, index) => ({
          index,
          text,
          completed: completedObjectives.includes(index),
        })),
        progress: userLab?.progress || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── SYNC USER STATS (retroactive fix) ──────────────────────────
/**
 * POST /api/labs/sync-stats
 * Recalculates achievements and leaderboard for the authenticated user
 * based on their existing completed UserLab records.
 * Safe to call multiple times (idempotent).
 */
export const syncUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Re-run achievement checks against all completed labs
    const completedLabs = await UserLab.find({ userId, status: "completed" }).lean();
    const newlyUnlocked = await checkAndUnlockAchievements(userId, null);

    // Recalculate User denormalized stats
    const totalScore = completedLabs.reduce((sum, l) => sum + (l.score || 0), 0);
    await User.findByIdAndUpdate(userId, {
      $set: {
        labsCompleted: completedLabs.length,
        totalPoints: totalScore,
      },
    });

    // Rebuild leaderboard entries
    await updateLeaderboard(userId);

    res.json({
      success: true,
      message: "Stats synced successfully.",
      data: {
        labsCompleted: completedLabs.length,
        newlyUnlockedAchievements: newlyUnlocked,
      },
    });
  } catch (error) {
    next(error);
  }
};
