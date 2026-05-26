// Planner & Tracker — app shell.
// Reads helpers from window.PH and views from window.PV.

(function () {
  const { useState, useEffect, useCallback } = React;
  const H = window.PH;
  const V = window.PV;

  function App() {
    const [state, setState] = useState(H.loadState);

    useEffect(() => { H.saveState(state); }, [state]);

    // Apply dark mode to body
    useEffect(() => {
      document.body.classList.toggle("dark", !!state.darkMode);
    }, [state.darkMode]);

    const activePlan = state.plans.find((p) => p.id === state.activePlanId) || state.plans[0];
    const update = useCallback((updater) => setState((s) => updater(s) ?? s), []);
    const mutatePlan = useCallback((planId, mutator) => {
      update((s) => ({ ...s, plans: s.plans.map((p) => p.id === planId ? mutator(p) : p) }));
    }, [update]);

    return (
      <div className="app">
        <Sidebar state={state} setState={setState} activePlan={activePlan} />
        <main className="main">
          <PlanHeader plan={activePlan} mutatePlan={mutatePlan} />
          <ViewTabs activeView={state.activeView} setView={(v) => setState((s) => ({ ...s, activeView: v }))} plan={activePlan} />
          {state.activeView === "today" && <V.TodayView plan={activePlan} mutatePlan={mutatePlan} state={state} setState={setState} />}
          {state.activeView === "timeline" && <V.TimelineView plan={activePlan} mutatePlan={mutatePlan} />}
          {state.activeView === "goals" && <V.GoalsView plan={activePlan} mutatePlan={mutatePlan} />}
          {state.activeView === "habits" && <V.HabitsView plan={activePlan} mutatePlan={mutatePlan} />}
          {state.activeView === "content" && <V.ContentView plan={activePlan} mutatePlan={mutatePlan} />}
          {state.activeView === "meetings" && <V.MeetingsView plan={activePlan} mutatePlan={mutatePlan} />}
          {state.activeView === "contacts" && <V.ContactsView plan={activePlan} mutatePlan={mutatePlan} />}
          {state.activeView === "outreach" && <V.OutreachView plan={activePlan} mutatePlan={mutatePlan} />}
          {state.activeView === "metrics" && <V.MetricsView plan={activePlan} mutatePlan={mutatePlan} />}
          {state.activeView === "notes" && <V.NotesView plan={activePlan} mutatePlan={mutatePlan} />}
          {state.activeView === "accounts" && <V.AccountsView plan={activePlan} mutatePlan={mutatePlan} />}
        </main>
      </div>
    );
  }

  function Sidebar({ state, setState, activePlan }) {
    const [adding, setAdding] = useState(false);
    const [newTitle, setNewTitle] = useState("");

    const addPlan = () => {
      if (!newTitle.trim()) { setAdding(false); return; }
      const plan = H.migratePlan({
        id: H.uid("plan_"),
        title: newTitle.trim(),
        subtitle: "",
        startDate: H.todayISO(),
        color: "green",
        metrics: [],
        goals: [],
        habits: [],
        notes: "",
        content: [],
        days: [{ day: 1, weekNumber: 1, weekTitle: "Week 1", title: "Day 1", tasks: [] }],
      });
      setState((s) => ({ ...s, plans: [...s.plans, plan], activePlanId: plan.id, activeDay: null }));
      setNewTitle(""); setAdding(false);
    };

    const toggleDark = () => setState((s) => ({ ...s, darkMode: !s.darkMode }));

    return (
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <rect x="3" y="4" width="18" height="17" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6"/>
              <path d="M8 2v4M16 2v4M3 10h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <path d="M7.5 14.5l2 2 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div className="brand-title">Planner</div>
            <div className="brand-sub">& Tracker</div>
          </div>
          <button className="dark-toggle" onClick={toggleDark} title={state.darkMode ? "Switch to light mode" : "Switch to dark mode"}>
            {state.darkMode ? (
              <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 2.22a1 1 0 011.42 1.42l-.7.7a1 1 0 01-1.42-1.42l.7-.7zM18 9a1 1 0 110 2h-1a1 1 0 110-2h1zM5.48 5.48a1 1 0 010 1.42l-.7.7a1 1 0 01-1.42-1.42l.7-.7a1 1 0 011.42 0zM10 14a4 4 0 100-8 4 4 0 000 8zm-7 0a1 1 0 110-2H4a1 1 0 110 2H3zm13.22.78a1 1 0 01-1.42 1.42l-.7-.7a1 1 0 011.42-1.42l.7.7zM10 17a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm-5.48-.52a1 1 0 011.42 0l.7.7a1 1 0 01-1.42 1.42l-.7-.7a1 1 0 010-1.42z"/>
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
              </svg>
            )}
          </button>
        </div>

        <div className="side-section-label">
          <span>Plans</span>
          <button className="icon-btn" title="New plan" onClick={() => setAdding(true)}>+</button>
        </div>

        <nav className="plan-list">
          {state.plans.map((p) => {
            const prog = H.planProgress(p);
            const isActive = p.id === activePlan.id;
            return (
              <button key={p.id}
                className={"plan-item " + (isActive ? "active" : "")}
                onClick={() => setState((s) => ({ ...s, activePlanId: p.id, activeDay: null }))}
              >
                <div className="plan-item-top">
                  <span className="plan-item-title">{p.title}</span>
                  <span className="plan-item-pct">{prog.pct}%</span>
                </div>
                <div className="plan-item-bar"><div className="plan-item-bar-fill" style={{ width: prog.pct + "%" }} /></div>
                <div className="plan-item-meta">{prog.done}/{prog.total} tasks · {p.days.length} days</div>
              </button>
            );
          })}
          {adding && (
            <div className="plan-item adding">
              <input autoFocus className="inline-input" placeholder="Plan name…" value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addPlan(); if (e.key === "Escape") { setAdding(false); setNewTitle(""); } }}
                onBlur={addPlan}
              />
            </div>
          )}
        </nav>

        <div className="side-footer">
          <button className="ghost-btn" onClick={() => {
            if (confirm("Reset all data and reload the example MSP plan?")) {
              localStorage.removeItem(H.STORAGE_KEY);
              location.reload();
            }
          }}>
            Reset data
          </button>
        </div>
      </aside>
    );
  }

  function PlanHeader({ plan, mutatePlan }) {
    const prog = H.planProgress(plan);
    const [editingTitle, setEditingTitle] = useState(false);
    const [editingSub, setEditingSub] = useState(false);
    const [editingDate, setEditingDate] = useState(false);

    const updateField = (field, value) => mutatePlan(plan.id, (p) => ({ ...p, [field]: value }));
    const startD = H.parseISODate(plan.startDate);
    const endD = H.dayDate(plan.startDate, plan.days.length);

    return (
      <header className="plan-header">
        <div className="plan-header-left">
          {editingTitle ? (
            <input autoFocus className="title-input" defaultValue={plan.title}
              onBlur={(e) => { updateField("title", e.target.value); setEditingTitle(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") setEditingTitle(false); }}
            />
          ) : (
            <h1 className="plan-title" onClick={() => setEditingTitle(true)} title="Click to edit">{plan.title}</h1>
          )}
          {editingSub ? (
            <input autoFocus className="sub-input" defaultValue={plan.subtitle}
              onBlur={(e) => { updateField("subtitle", e.target.value); setEditingSub(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") setEditingSub(false); }}
            />
          ) : (
            <p className="plan-sub" onClick={() => setEditingSub(true)} title="Click to edit">
              {plan.subtitle || <span className="muted">Add a subtitle…</span>}
            </p>
          )}
          <div className="plan-dates">
            {editingDate ? (
              <input autoFocus type="date" className="date-input" defaultValue={plan.startDate}
                onBlur={(e) => { updateField("startDate", e.target.value || plan.startDate); setEditingDate(false); }}
                onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
              />
            ) : (
              <button className="date-button" onClick={() => setEditingDate(true)} title="Edit start date">
                <span className="date-label">Starts</span>
                <span>{H.fmtDayDate(startD, { long: true })}</span>
                <span className="date-arrow">→</span>
                <span>{H.fmtDayDate(endD, { long: true })}</span>
              </button>
            )}
          </div>
        </div>
        <div className="plan-header-right">
          <div className="stat">
            <div className="stat-num">{prog.done}<span className="stat-sub">/{prog.total}</span></div>
            <div className="stat-label">tasks done</div>
          </div>
          <div className="stat">
            <div className="stat-num">{plan.days.length}</div>
            <div className="stat-label">days</div>
          </div>
          <V.ProgressRing pct={prog.pct} />
        </div>
      </header>
    );
  }

  function ViewTabs({ activeView, setView, plan }) {
    const tabs = [
      { key: "today", label: "Today" },
      { key: "timeline", label: "Plan" },
      { key: "goals", label: "Goals", count: (plan.goals || []).length },
      { key: "habits", label: "Habits", count: (plan.habits || []).length },
      { key: "content", label: "Content", count: (plan.content || []).length },
      { key: "meetings", label: "Meetings", count: (plan.meetings || []).length },
      { key: "contacts", label: "Contacts", count: (plan.contacts || []).length },
      { key: "outreach", label: "Outreach", count: (plan.outreach || []).length },
      { key: "metrics", label: "Metrics", count: (plan.metrics || []).length },
      { key: "notes", label: "Notes" },
      { key: "accounts", label: "Accounts", count: (plan.accounts || []).length },
    ];
    return (
      <div className="view-tabs">
        {tabs.map((t) => (
          <button key={t.key} className={"view-tab " + (activeView === t.key ? "active" : "")} onClick={() => setView(t.key)}>
            {t.label}
            {typeof t.count === "number" && t.count > 0 && <span className="tab-count">{t.count}</span>}
          </button>
        ))}
      </div>
    );
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(<App />);
})();
