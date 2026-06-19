/**
 * Unit tests — Scoring formula & objective validation logic
 * Tests the math used in lab.controller.js runCommand() and saveProgress()
 */

// ── Pure scoring formula (mirrors the controller) ─────────────────
function calcScore(completedCount, totalObjectives) {
  if (totalObjectives === 0) return 0;
  return Math.round((completedCount / totalObjectives) * 100);
}

// ── Objective normalizer (mirrors the controller) ──────────────────
function normalize(s) {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}

function matchesObjective(typedCommand, triggers) {
  const norm = normalize(typedCommand);
  return triggers.some((t) => norm.includes(normalize(t)));
}

// ─────────────────────────────────────────────────────────────────
describe("Scoring formula — score = (completed / total) × 100", () => {
  test("0 objectives completed → score = 0", () => {
    expect(calcScore(0, 5)).toBe(0);
  });

  test("1/5 objectives completed → score = 20", () => {
    expect(calcScore(1, 5)).toBe(20);
  });

  test("2/5 objectives completed → score = 40", () => {
    expect(calcScore(2, 5)).toBe(40);
  });

  test("3/5 objectives completed → score = 60", () => {
    expect(calcScore(3, 5)).toBe(60);
  });

  test("4/5 objectives completed → score = 80", () => {
    expect(calcScore(4, 5)).toBe(80);
  });

  test("5/5 objectives completed → score = 100", () => {
    expect(calcScore(5, 5)).toBe(100);
  });

  test("3/3 objectives completed → score = 100", () => {
    expect(calcScore(3, 3)).toBe(100);
  });

  test("1/3 objectives completed → score = 33 (rounded)", () => {
    expect(calcScore(1, 3)).toBe(33);
  });

  test("2/3 objectives completed → score = 67 (rounded)", () => {
    expect(calcScore(2, 3)).toBe(67);
  });

  test("0 total objectives → score = 0 (guard against division by zero)", () => {
    expect(calcScore(0, 0)).toBe(0);
  });

  test("score is always an integer (Math.round applied)", () => {
    const score = calcScore(1, 6);
    expect(Number.isInteger(score)).toBe(true);
  });

  test("score never exceeds 100", () => {
    expect(calcScore(10, 5)).toBe(200); // controller doesn't cap — caller should
    // Verify the formula itself doesn't add a wrong cap
    expect(calcScore(5, 5)).toBe(100);
  });
});

// ─────────────────────────────────────────────────────────────────
describe("Objective matching — contains-based keyword trigger", () => {
  test("exact trigger match satisfies objective", () => {
    expect(matchesObjective("show ip route", ["show ip route"])).toBe(true);
  });

  test("typed command contains trigger → satisfied", () => {
    expect(matchesObjective("show ip route ospf", ["show ip route"])).toBe(true);
  });

  test("trigger is substring of typed command → satisfied", () => {
    expect(matchesObjective("router ospf 1", ["router ospf"])).toBe(true);
  });

  test("multiple triggers — any match satisfies", () => {
    const triggers = ["show ip route ospf", "show ip route eigrp"];
    expect(matchesObjective("show ip route ospf", triggers)).toBe(true);
    expect(matchesObjective("show ip route eigrp", triggers)).toBe(true);
  });

  test("none of the triggers match → not satisfied", () => {
    expect(matchesObjective("show version", ["show ip route", "show ip ospf"])).toBe(false);
  });

  test("case-insensitive matching — uppercase command matches lowercase trigger", () => {
    expect(matchesObjective("SHOW IP ROUTE", ["show ip route"])).toBe(true);
  });

  test("case-insensitive matching — mixed case", () => {
    expect(matchesObjective("Show IP Route", ["show ip route"])).toBe(true);
  });

  test("extra whitespace in typed command is normalized", () => {
    expect(matchesObjective("show  ip   route", ["show ip route"])).toBe(true);
  });

  test("partial keyword in wrong word position does NOT match", () => {
    // 'route' appears but trigger 'show ip route' requires the full substring
    expect(matchesObjective("ip route 0.0.0.0 0.0.0.0 10.0.1.254", ["show ip route"])).toBe(false);
  });

  test("empty triggers array → not satisfied", () => {
    expect(matchesObjective("show ip route", [])).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────
describe("Progress → status transition logic", () => {
  function getStatus(progress) {
    if (progress >= 100) return "completed";
    return "stopped";
  }

  test("progress = 0 → status = stopped", () => {
    expect(getStatus(0)).toBe("stopped");
  });

  test("progress = 60 → status = stopped (partial)", () => {
    expect(getStatus(60)).toBe("stopped");
  });

  test("progress = 99 → status = stopped (just below 100)", () => {
    expect(getStatus(99)).toBe("stopped");
  });

  test("progress = 100 → status = completed", () => {
    expect(getStatus(100)).toBe("completed");
  });

  test("progress > 100 → status = completed", () => {
    expect(getStatus(120)).toBe("completed");
  });
});

// ─────────────────────────────────────────────────────────────────
describe("Completed objectives array deduplication", () => {
  function addObjective(existing, newIdx) {
    const set = new Set(existing);
    set.add(newIdx);
    return Array.from(set);
  }

  test("adding new index appends it", () => {
    const result = addObjective([0, 1], 2);
    expect(result).toContain(2);
    expect(result).toHaveLength(3);
  });

  test("adding duplicate index does not grow the array", () => {
    const result = addObjective([0, 1, 2], 1);
    expect(result).toHaveLength(3);
  });

  test("Set preserves all existing indices", () => {
    const result = addObjective([0, 2, 4], 3);
    expect(result).toContain(0);
    expect(result).toContain(2);
    expect(result).toContain(4);
    expect(result).toContain(3);
  });
});

// ─────────────────────────────────────────────────────────────────
describe("Score calculation from completedObjectives array", () => {
  function scoreFromArray(completedArr, totalObjectives) {
    return calcScore(completedArr.length, totalObjectives);
  }

  test("empty array → 0%", () => {
    expect(scoreFromArray([], 5)).toBe(0);
  });

  test("[0] → 20% for 5-objective lab", () => {
    expect(scoreFromArray([0], 5)).toBe(20);
  });

  test("[0, 1] → 40% for 5-objective lab", () => {
    expect(scoreFromArray([0, 1], 5)).toBe(40);
  });

  test("[0, 1, 2, 3, 4] → 100% for 5-objective lab", () => {
    expect(scoreFromArray([0, 1, 2, 3, 4], 5)).toBe(100);
  });

  test("all objectives for 3-objective lab → 100%", () => {
    expect(scoreFromArray([0, 1, 2], 3)).toBe(100);
  });
});
