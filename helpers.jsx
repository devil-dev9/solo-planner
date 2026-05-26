// Shared helpers — exposed on window for use across babel-transpiled scripts.

(function () {
  const STORAGE_KEY = "planner_tracker_v1";

  function uid(prefix = "id") {
    return prefix + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);
  }

  function fmtNumber(n) {
    if (n == null || isNaN(n)) return "0";
    n = Number(n);
    if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
    if (n >= 1000) return (n / 1000).toFixed(n >= 10000 ? 0 : 1) + "k";
    return n.toLocaleString();
  }

  function parseISODate(s) {
    if (!s) return new Date();
    const [y, m, d] = s.split("-").map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }

  function toISODate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  function dayDate(startDateISO, dayNumber) {
    const d = parseISODate(startDateISO);
    d.setDate(d.getDate() + (dayNumber - 1));
    return d;
  }

  function fmtDayDate(date, opts = {}) {
    const wd = date.toLocaleDateString("en-US", { weekday: "short" });
    const md = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return opts.long
      ? `${wd}, ${md}, ${date.getFullYear()}`
      : `${wd} · ${md}`;
  }

  function fmtDateShort(iso) {
    if (!iso) return "—";
    try {
      const d = parseISODate(iso);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
    } catch (e) {
      return iso;
    }
  }

  function fmtDateTime(iso, time) {
    if (!iso) return "—";
    const d = parseISODate(iso);
    const base = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    return time ? `${base} · ${time}` : base;
  }

  function todayISO() {
    return toISODate(new Date());
  }

  function todayDayNumber(plan) {
    if (!plan || !plan.startDate) return 1;
    const start = parseISODate(plan.startDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const diffMs = now - start;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    const maxDay = plan.days[plan.days.length - 1]?.day ?? 1;
    return Math.max(1, Math.min(maxDay, days));
  }

  function planProgress(plan) {
    let total = 0;
    let done = 0;
    for (const d of plan.days) {
      for (const t of d.tasks) {
        total++;
        if (t.done) done++;
      }
    }
    return { total, done, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
  }

  function dayProgress(day) {
    const total = day.tasks.length;
    const done = day.tasks.filter((t) => t.done).length;
    return { total, done, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
  }

  // ── Habit helpers ──

  function habitDoneToday(habit) {
    return (habit.completedDates || []).includes(todayISO());
  }

  function habitStreak(habit) {
    const dates = new Set(habit.completedDates || []);
    let streak = 0;
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    if (!dates.has(toISODate(d))) d.setDate(d.getDate() - 1);
    while (dates.has(toISODate(d))) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return streak;
  }

  // ── Goal helpers ──

  function goalProgress(goal) {
    const krs = goal.keyResults || [];
    if (krs.length === 0) return { pct: 0 };
    const sum = krs.reduce((acc, kr) => {
      if (!kr.target) return acc;
      return acc + Math.min(1, (kr.current || 0) / kr.target);
    }, 0);
    return { pct: Math.round((sum / krs.length) * 100) };
  }

  // Migrate plan shape forward (idempotent — safe to run on any version)
  function migratePlan(p) {
    return {
      ...p,
      meetings: Array.isArray(p.meetings) ? p.meetings : [],
      contacts: Array.isArray(p.contacts) ? p.contacts : [],
      outreach: Array.isArray(p.outreach) ? p.outreach : [],
      accounts: Array.isArray(p.accounts) ? p.accounts : [],
      goals: Array.isArray(p.goals) ? p.goals : [],
      habits: Array.isArray(p.habits) ? p.habits : [],
      notes: typeof p.notes === "string" ? p.notes : "",
      content: Array.isArray(p.content) ? p.content : [],
      days: (p.days || []).map((d) => ({
        ...d,
        tasks: (d.tasks || []).map((t) => ({
          ...t,
          note: typeof t.note === "string" ? t.note : "",
          subitems: Array.isArray(t.subitems) ? t.subitems : [],
          priority: t.priority || "normal",
          label: t.label || "",
          dueDate: t.dueDate || "",
        })),
      })),
      metrics: (p.metrics || []).map((m) => ({
        ...m,
        history: Array.isArray(m.history) ? m.history : [],
      })),
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.plans = (parsed.plans || []).map(migratePlan);
        if (!parsed.activeView) parsed.activeView = "today";
        if (parsed.darkMode === undefined) parsed.darkMode = false;
        return parsed;
      }
    } catch (e) {}
    const plan = window.seedPlan();
    return {
      plans: [migratePlan(plan)],
      activePlanId: plan.id,
      activeView: "today",
      activeDay: null,
      darkMode: false,
    };
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  window.PH = {
    STORAGE_KEY,
    uid,
    fmtNumber,
    fmtDayDate,
    fmtDateShort,
    fmtDateTime,
    parseISODate,
    toISODate,
    dayDate,
    todayISO,
    todayDayNumber,
    planProgress,
    dayProgress,
    migratePlan,
    loadState,
    saveState,
    habitDoneToday,
    habitStreak,
    goalProgress,
  };
})();
