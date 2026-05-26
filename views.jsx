// Views — all main content views for the planner.
// Exposed via window.PV. Reads helpers from window.PH.

(function () {
  const { useState, useEffect, useMemo, useRef, useCallback } = React;
  const H = window.PH;

  // ─────────────────────────────────────────────────────
  // Shared: Progress ring
  // ─────────────────────────────────────────────────────

  function ProgressRing({ pct }) {
    const r = 26;
    const c = 2 * Math.PI * r;
    const dash = (pct / 100) * c;
    return (
      <div className="ring-wrap">
        <svg width="68" height="68" viewBox="0 0 68 68">
          <circle cx="34" cy="34" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
          <circle
            cx="34" cy="34" r={r}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c - dash}`}
            transform="rotate(-90 34 34)"
            style={{ transition: "stroke-dasharray 0.4s ease" }}
          />
        </svg>
        <div className="ring-pct">{pct}<span>%</span></div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // Priority badge
  // ─────────────────────────────────────────────────────

  function PriorityBadge({ priority, onClick }) {
    if (!priority || priority === "normal") return null;
    return (
      <span
        className={"priority-badge priority-" + priority}
        onClick={onClick}
        title={"Priority: " + priority.toUpperCase()}
      >
        {priority.toUpperCase()}
      </span>
    );
  }

  // ─────────────────────────────────────────────────────
  // Task Row — expandable, with notes + subitems + priority
  // ─────────────────────────────────────────────────────

  function TaskRow({ task, onToggle, onEdit, onDelete, onPatch, large }) {
    const [editing, setEditing] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const hasDetails = (task.note && task.note.length) || (task.subitems && task.subitems.length);

    const setNote = (note) => onPatch({ note });
    const addSub = (text) => {
      if (!text.trim()) return;
      onPatch({ subitems: [...(task.subitems || []), { id: H.uid("s_"), text: text.trim(), done: false }] });
    };
    const toggleSub = (sid) => onPatch({ subitems: (task.subitems || []).map((s) => s.id === sid ? { ...s, done: !s.done } : s) });
    const editSub = (sid, text) => onPatch({ subitems: (task.subitems || []).map((s) => s.id === sid ? { ...s, text } : s) });
    const deleteSub = (sid) => onPatch({ subitems: (task.subitems || []).filter((s) => s.id !== sid) });

    const cyclePriority = () => {
      const order = ["normal", "p1", "p2", "p3"];
      const next = order[(order.indexOf(task.priority || "normal") + 1) % order.length];
      onPatch({ priority: next });
    };

    return (
      <li className={"task-row " + (task.done ? "done " : "") + (expanded ? "expanded " : "") + (large ? "large" : "") + " priority-row-" + (task.priority || "normal")}>
        <div className="task-row-main">
          <button
            className={"checkbox " + (task.done ? "checked" : "empty")}
            onClick={onToggle}
            aria-label={task.done ? "Mark not done" : "Mark done"}
          >
            {task.done && (
              <svg viewBox="0 0 12 12" width="11" height="11">
                <path d="M2.5 6.5l2.5 2.5L9.5 3.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <PriorityBadge priority={task.priority} onClick={(e) => { e.stopPropagation(); cyclePriority(); }} />
          {editing ? (
            <input
              autoFocus
              className="task-input"
              defaultValue={task.text}
              onBlur={(e) => { onEdit(e.target.value); setEditing(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") setEditing(false); }}
            />
          ) : (
            <span className="task-text" onClick={() => setEditing(true)}>{task.text}</span>
          )}
          {hasDetails ? (
            <span className="task-details-indicator" title="Has notes/subitems">
              {task.subitems && task.subitems.length > 0 && (
                <span className="sub-count">{task.subitems.filter(s => s.done).length}/{task.subitems.length}</span>
              )}
              {task.note && <span className="note-dot" title="Has note">•</span>}
            </span>
          ) : null}
          <button className={"task-expand " + (expanded ? "open" : "")} onClick={() => setExpanded(!expanded)} title={expanded ? "Collapse" : "Notes & subitems"}>
            <svg viewBox="0 0 10 10" width="10" height="10">
              <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="task-delete" onClick={onDelete} title="Delete">
            <svg viewBox="0 0 12 12" width="10" height="10">
              <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {expanded && (
          <div className="task-details">
            <div className="task-details-meta">
              <span className="task-details-label">Priority:</span>
              <div className="priority-pills">
                {["normal", "p1", "p2", "p3"].map((p) => (
                  <button
                    key={p}
                    className={"priority-pill " + (p === (task.priority || "normal") ? "active" : "") + " pill-" + p}
                    onClick={() => onPatch({ priority: p })}
                  >
                    {p === "normal" ? "—" : p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              className="task-note"
              placeholder="Notes…"
              value={task.note || ""}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
            <div className="subitems">
              {(task.subitems || []).map((s) => (
                <Subitem key={s.id} sub={s} onToggle={() => toggleSub(s.id)} onEdit={(text) => editSub(s.id, text)} onDelete={() => deleteSub(s.id)} />
              ))}
              <SubitemAdder onAdd={addSub} />
            </div>
          </div>
        )}
      </li>
    );
  }

  function Subitem({ sub, onToggle, onEdit, onDelete }) {
    const [editing, setEditing] = useState(false);
    return (
      <div className={"subitem " + (sub.done ? "done" : "")}>
        <button className={"checkbox tiny " + (sub.done ? "checked" : "empty")} onClick={onToggle}>
          {sub.done && <svg viewBox="0 0 12 12" width="9" height="9"><path d="M2.5 6.5l2.5 2.5L9.5 3.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
        </button>
        {editing ? (
          <input autoFocus className="subitem-input" defaultValue={sub.text}
            onBlur={(e) => { onEdit(e.target.value); setEditing(false); }}
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
          />
        ) : (
          <span className="subitem-text" onClick={() => setEditing(true)}>{sub.text}</span>
        )}
        <button className="task-delete tiny" onClick={onDelete} title="Delete">
          <svg viewBox="0 0 12 12" width="9" height="9"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
        </button>
      </div>
    );
  }

  function SubitemAdder({ onAdd }) {
    const [text, setText] = useState("");
    const submit = () => { if (text.trim()) onAdd(text); setText(""); };
    return (
      <div className="subitem add">
        <span className="checkbox tiny empty plus">+</span>
        <input className="subitem-input" placeholder="Add subitem…" value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          onBlur={submit}
        />
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // Day Card
  // ─────────────────────────────────────────────────────

  function DayCard({ day, startDate, mutators }) {
    const prog = H.dayProgress(day);
    const [newText, setNewText] = useState("");
    const [adding, setAdding] = useState(false);
    const [editTitle, setEditTitle] = useState(false);
    const date = H.dayDate(startDate, day.day);
    const dateLabel = H.fmtDayDate(date);

    const submitNew = () => {
      if (newText.trim()) { mutators.addTask(day.day, newText); setNewText(""); }
      else setAdding(false);
    };

    return (
      <article className={"day-card " + (prog.pct === 100 && prog.total > 0 ? "complete" : "")}>
        <header className="day-card-header">
          <div className="day-num">
            <span className="day-num-label">Day</span>
            <span className="day-num-val">{day.day}</span>
          </div>
          <div className="day-card-title-wrap">
            {editTitle ? (
              <input autoFocus className="day-title-input" defaultValue={day.title}
                onBlur={(e) => { mutators.editDayTitle(day.day, e.target.value); setEditTitle(false); }}
                onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
              />
            ) : (
              <h3 className="day-card-title" onClick={() => setEditTitle(true)}>{day.title}</h3>
            )}
            <div className="day-card-meta">
              <span className="day-card-date">{dateLabel}</span>
              <span className="dot-sep">·</span>
              <span>{prog.done}/{prog.total} · {prog.pct}%</span>
            </div>
          </div>
          <div className="day-bar"><div className="day-bar-fill" style={{ width: prog.pct + "%" }} /></div>
        </header>
        <ul className="task-list">
          {day.tasks.map((t) => (
            <TaskRow key={t.id} task={t}
              onToggle={() => mutators.toggleTask(day.day, t.id)}
              onEdit={(text) => mutators.editTaskText(day.day, t.id, text)}
              onDelete={() => mutators.deleteTask(day.day, t.id)}
              onPatch={(patch) => mutators.patchTask(day.day, t.id, patch)}
            />
          ))}
          {adding ? (
            <li className="task-row adding">
              <div className="task-row-main">
                <span className="checkbox empty" />
                <input autoFocus className="task-input" placeholder="New task…" value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onBlur={submitNew}
                  onKeyDown={(e) => { if (e.key === "Enter") submitNew(); if (e.key === "Escape") { setAdding(false); setNewText(""); } }}
                />
              </div>
            </li>
          ) : (
            <li className="task-row add-row" onClick={() => setAdding(true)}>
              <div className="task-row-main">
                <span className="checkbox empty plus">+</span>
                <span className="task-text muted">Add task</span>
              </div>
            </li>
          )}
        </ul>
      </article>
    );
  }

  // ─────────────────────────────────────────────────────
  // Mutators (shared task operations)
  // ─────────────────────────────────────────────────────

  function buildMutators(plan, mutatePlan) {
    return {
      toggleTask: (dayNum, taskId) =>
        mutatePlan(plan.id, (p) => ({ ...p, days: p.days.map((d) => d.day !== dayNum ? d : { ...d, tasks: d.tasks.map((t) => t.id === taskId ? { ...t, done: !t.done } : t) }) })),
      editTaskText: (dayNum, taskId, text) =>
        mutatePlan(plan.id, (p) => ({ ...p, days: p.days.map((d) => d.day !== dayNum ? d : { ...d, tasks: d.tasks.map((t) => t.id === taskId ? { ...t, text } : t) }) })),
      deleteTask: (dayNum, taskId) =>
        mutatePlan(plan.id, (p) => ({ ...p, days: p.days.map((d) => d.day !== dayNum ? d : { ...d, tasks: d.tasks.filter((t) => t.id !== taskId) }) })),
      addTask: (dayNum, text, extra) =>
        mutatePlan(plan.id, (p) => ({ ...p, days: p.days.map((d) => d.day !== dayNum ? d : { ...d, tasks: [...d.tasks, { id: H.uid("t_"), text: text.trim(), done: false, note: "", subitems: [], priority: "normal", label: "", dueDate: "", ...(extra || {}) }] }) })),
      patchTask: (dayNum, taskId, patch) =>
        mutatePlan(plan.id, (p) => ({ ...p, days: p.days.map((d) => d.day !== dayNum ? d : { ...d, tasks: d.tasks.map((t) => t.id === taskId ? { ...t, ...patch } : t) }) })),
      editDayTitle: (dayNum, title) =>
        mutatePlan(plan.id, (p) => ({ ...p, days: p.days.map((d) => d.day === dayNum ? { ...d, title } : d) })),
    };
  }

  // ─────────────────────────────────────────────────────
  // Timeline View
  // ─────────────────────────────────────────────────────

  function TimelineView({ plan, mutatePlan }) {
    const mutators = useMemo(() => buildMutators(plan, mutatePlan), [plan, mutatePlan]);
    const weekGroups = useMemo(() => {
      const groups = {};
      for (const d of plan.days) {
        const key = d.weekNumber;
        if (!groups[key]) groups[key] = { weekNumber: d.weekNumber, weekTitle: d.weekTitle, days: [] };
        groups[key].days.push(d);
      }
      return Object.values(groups).sort((a, b) => a.weekNumber - b.weekNumber);
    }, [plan.days]);

    const addDay = () => {
      mutatePlan(plan.id, (p) => {
        const maxDay = p.days.reduce((m, d) => Math.max(m, d.day), 0);
        const newDay = maxDay + 1;
        const weekNumber = Math.ceil(newDay / 7);
        const weekTitle = p.days.find((d) => d.weekNumber === weekNumber)?.weekTitle || `Week ${weekNumber}`;
        return { ...p, days: [...p.days, { day: newDay, weekNumber, weekTitle, title: `Day ${newDay}`, tasks: [] }] };
      });
    };

    return (
      <div className="timeline">
        {weekGroups.map((wg) => {
          const all = wg.days.flatMap((d) => d.tasks);
          const doneCount = all.filter((t) => t.done).length;
          const wkStart = H.dayDate(plan.startDate, wg.days[0].day);
          const wkEnd = H.dayDate(plan.startDate, wg.days[wg.days.length - 1].day);
          return (
            <section key={wg.weekNumber} className="week-block">
              <div className="week-header">
                <span className="week-num">Week {wg.weekNumber}</span>
                <span className="week-title">{wg.weekTitle}</span>
                <span className="week-dates">{H.fmtDayDate(wkStart)} → {H.fmtDayDate(wkEnd)}</span>
                <span className="week-pct">{doneCount}/{all.length}</span>
              </div>
              <div className="day-grid">
                {wg.days.map((d) => <DayCard key={d.day} day={d} startDate={plan.startDate} mutators={mutators} />)}
              </div>
            </section>
          );
        })}
        <div className="add-day-row">
          <button className="add-day-btn" onClick={addDay}>+ Add day</button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // Today View — command center
  // ─────────────────────────────────────────────────────

  const PRIORITY_ORDER = { p1: 0, p2: 1, p3: 2, normal: 3 };

  function TodayView({ plan, mutatePlan, state, setState }) {
    const computedToday = useMemo(() => H.todayDayNumber(plan), [plan]);
    const currentDay = state.activeDay || computedToday;
    const day = plan.days.find((d) => d.day === currentDay) || plan.days[0];
    const mutators = useMemo(() => buildMutators(plan, mutatePlan), [plan, mutatePlan]);

    const [adding, setAdding] = useState(false);
    const [newText, setNewText] = useState("");
    const [newPriority, setNewPriority] = useState("normal");

    const submit = () => {
      if (newText.trim()) mutators.addTask(day.day, newText, { priority: newPriority });
      setNewText(""); setNewPriority("normal"); setAdding(false);
    };

    const prog = H.dayProgress(day);
    const planProg = H.planProgress(plan);
    const minDay = plan.days[0]?.day ?? 1;
    const maxDay = plan.days[plan.days.length - 1]?.day ?? 1;
    const date = H.dayDate(plan.startDate, day.day);
    const isToday = day.day === computedToday;

    const habits = plan.habits || [];
    const habitsDoneToday = habits.filter((h) => H.habitDoneToday(h)).length;

    const todayMeetings = useMemo(() => {
      const dISO = H.toISODate(date);
      return (plan.meetings || []).filter((m) => m.date === dISO).sort((a, b) => (a.time || "").localeCompare(b.time || ""));
    }, [plan.meetings, date]);

    const sortedTasks = useMemo(() => {
      return [...day.tasks].sort((a, b) => (PRIORITY_ORDER[a.priority || "normal"] || 3) - (PRIORITY_ORDER[b.priority || "normal"] || 3));
    }, [day.tasks]);

    const upcoming = plan.days.filter((d) => d.day > day.day).slice(0, 3);

    const mrrMetric = (plan.metrics || []).find((m) => m.unit === "$");

    const toggleHabit = (habitId) => {
      const today = H.todayISO();
      mutatePlan(plan.id, (p) => ({
        ...p,
        habits: p.habits.map((h) => {
          if (h.id !== habitId) return h;
          const done = (h.completedDates || []).includes(today);
          return { ...h, completedDates: done ? h.completedDates.filter((d) => d !== today) : [...(h.completedDates || []), today] };
        }),
      }));
    };

    return (
      <div className="today">
        <div className="today-nav">
          <button className="nav-arrow" onClick={() => setState((s) => ({ ...s, activeDay: Math.max(minDay, day.day - 1) }))} disabled={day.day === minDay}>‹</button>
          <div className="today-nav-center">
            <div className="today-label">
              {isToday && <span className="today-pill">TODAY</span>}
              DAY {day.day} · WEEK {day.weekNumber} · {H.fmtDayDate(date, { long: true })}
            </div>
            <h2 className="today-title">{day.title}</h2>
            <div className="today-week-tag">{day.weekTitle}</div>
          </div>
          <button className="nav-arrow" onClick={() => setState((s) => ({ ...s, activeDay: Math.min(maxDay, day.day + 1) }))} disabled={day.day === maxDay}>›</button>
        </div>

        {/* Stats row */}
        <div className="today-stats-row">
          <div className="ts-stat">
            <div className="ts-val">{prog.done}<span className="ts-of">/{prog.total}</span></div>
            <div className="ts-lbl">Tasks today</div>
          </div>
          <div className="ts-stat">
            <div className="ts-val">{habitsDoneToday}<span className="ts-of">/{habits.length || 0}</span></div>
            <div className="ts-lbl">Habits done</div>
          </div>
          <div className="ts-stat">
            <div className="ts-val">{planProg.pct}<span className="ts-of">%</span></div>
            <div className="ts-lbl">Plan · Day {day.day}/{plan.days.length}</div>
          </div>
          <div className="ts-stat">
            <div className="ts-val">
              {mrrMetric ? (mrrMetric.unit === "$" ? "$" : "") + H.fmtNumber(mrrMetric.current) : "—"}
            </div>
            <div className="ts-lbl">{mrrMetric ? mrrMetric.name : "MRR"}</div>
          </div>
        </div>

        <div className="today-cols">
          <div className="today-tasks-col">
            {/* Habits */}
            {habits.length > 0 && (
              <div className="today-habits-section">
                <div className="col-header">
                  <span>Daily Habits</span>
                  <span className={"habits-badge " + (habitsDoneToday === habits.length ? "all-done" : "")}>
                    {habitsDoneToday}/{habits.length}
                  </span>
                </div>
                <ul className="habits-mini-list">
                  {habits.map((h) => {
                    const done = H.habitDoneToday(h);
                    const streak = H.habitStreak(h);
                    return (
                      <li key={h.id} className={"habit-mini-item " + (done ? "done" : "")} onClick={() => toggleHabit(h.id)}>
                        <span className={"checkbox tiny " + (done ? "checked" : "empty")}>
                          {done && <svg viewBox="0 0 12 12" width="9" height="9"><path d="M2.5 6.5l2.5 2.5L9.5 3.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </span>
                        <span className="habit-mini-text">{h.text}</span>
                        {streak > 0 && <span className="habit-streak-badge">🔥{streak}</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Tasks */}
            <div className="col-header" style={{ marginTop: habits.length > 0 ? 20 : 0 }}>
              <span>Tasks</span>
              <button className="ghost-btn small" onClick={() => setAdding(true)}>+ Add</button>
            </div>
            <ul className="task-list large boxed">
              {sortedTasks.map((t) => (
                <TaskRow key={t.id} task={t} large
                  onToggle={() => mutators.toggleTask(day.day, t.id)}
                  onEdit={(text) => mutators.editTaskText(day.day, t.id, text)}
                  onDelete={() => mutators.deleteTask(day.day, t.id)}
                  onPatch={(patch) => mutators.patchTask(day.day, t.id, patch)}
                />
              ))}
              {adding && (
                <li className="task-row adding large">
                  <div className="task-row-main">
                    <span className="checkbox empty" />
                    <input autoFocus className="task-input" placeholder="New task…" value={newText}
                      onChange={(e) => setNewText(e.target.value)}
                      onBlur={submit}
                      onKeyDown={(e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") { setAdding(false); setNewText(""); } }}
                    />
                    <select className="priority-select" value={newPriority} onChange={(e) => setNewPriority(e.target.value)} onMouseDown={(e) => e.stopPropagation()}>
                      <option value="normal">— priority</option>
                      <option value="p1">P1 · Critical</option>
                      <option value="p2">P2 · Important</option>
                      <option value="p3">P3 · Nice to have</option>
                    </select>
                  </div>
                </li>
              )}
              {day.tasks.length === 0 && !adding && (
                <li className="empty-state">No tasks for this day. <button className="link-btn" onClick={() => setAdding(true)}>Add one</button>.</li>
              )}
            </ul>
          </div>

          <div className="today-side-col">
            <div className="today-progress">
              <div className="today-progress-bar"><div className="today-progress-fill" style={{ width: prog.pct + "%" }} /></div>
              <div className="today-progress-text"><strong>{prog.done}</strong> of <strong>{prog.total}</strong> · {prog.pct}%</div>
            </div>

            <div className="col-header"><span>Scheduled for today</span></div>
            <ul className="upcoming-list">
              {todayMeetings.map((m) => (
                <li key={m.id} className="upcoming-item meeting-mini" onClick={() => setState((s) => ({ ...s, activeView: "meetings" }))}>
                  <div className="upcoming-day">{m.time || "All day"}</div>
                  <div className="upcoming-title">{m.title}</div>
                  <div className="upcoming-meta">{m.attendee || "—"}</div>
                </li>
              ))}
              {todayMeetings.length === 0 && <li className="empty-state small">No meetings today.</li>}
            </ul>

            <div className="col-header" style={{ marginTop: 24 }}><span>Up next</span></div>
            <ul className="upcoming-list">
              {upcoming.map((d) => {
                const p = H.dayProgress(d);
                const dDate = H.dayDate(plan.startDate, d.day);
                return (
                  <li key={d.day} className="upcoming-item" onClick={() => setState((s) => ({ ...s, activeDay: d.day }))}>
                    <div className="upcoming-day">Day {d.day} · {H.fmtDayDate(dDate)}</div>
                    <div className="upcoming-title">{d.title}</div>
                    <div className="upcoming-meta">{p.total} tasks</div>
                  </li>
                );
              })}
              {upcoming.length === 0 && <li className="empty-state small">End of plan.</li>}
            </ul>

            <div className="col-header" style={{ marginTop: 24 }}><span>Workspace</span></div>
            <div className="workspace-stats">
              <button className="ws-stat" onClick={() => setState((s) => ({ ...s, activeView: "goals" }))}>
                <div className="ws-stat-num">{(plan.goals || []).length}</div>
                <div className="ws-stat-label">Goals</div>
              </button>
              <button className="ws-stat" onClick={() => setState((s) => ({ ...s, activeView: "contacts" }))}>
                <div className="ws-stat-num">{(plan.contacts || []).length}</div>
                <div className="ws-stat-label">Contacts</div>
              </button>
              <button className="ws-stat" onClick={() => setState((s) => ({ ...s, activeView: "outreach" }))}>
                <div className="ws-stat-num">{(plan.outreach || []).length}</div>
                <div className="ws-stat-label">Outreach</div>
              </button>
              <button className="ws-stat" onClick={() => setState((s) => ({ ...s, activeView: "meetings" }))}>
                <div className="ws-stat-num">{(plan.meetings || []).length}</div>
                <div className="ws-stat-label">Meetings</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // Goals View
  // ─────────────────────────────────────────────────────

  function GoalsView({ plan, mutatePlan }) {
    const [adding, setAdding] = useState(false);

    const addGoal = (goal) => {
      mutatePlan(plan.id, (p) => ({ ...p, goals: [...(p.goals || []), { ...goal, id: H.uid("g_") }] }));
      setAdding(false);
    };
    const updateGoal = (id, patch) => mutatePlan(plan.id, (p) => ({ ...p, goals: p.goals.map((g) => g.id === id ? { ...g, ...patch } : g) }));
    const deleteGoal = (id) => mutatePlan(plan.id, (p) => ({ ...p, goals: p.goals.filter((g) => g.id !== id) }));

    const goals = plan.goals || [];
    const achieved = goals.filter((g) => H.goalProgress(g).pct >= 100).length;

    return (
      <div className="data-view goals-view">
        <div className="data-header">
          <div className="data-header-left">
            <h2>Goals</h2>
            <p className="muted">{goals.length} goals · {achieved} achieved. Track what matters most.</p>
          </div>
          <div className="data-header-right">
            <button className="primary-btn small" onClick={() => setAdding(true)}>+ New goal</button>
          </div>
        </div>

        {adding && (
          <GoalForm onSave={addGoal} onCancel={() => setAdding(false)} />
        )}

        <div className="goal-grid">
          {goals.map((g) => (
            <GoalCard key={g.id} goal={g}
              onUpdate={(patch) => updateGoal(g.id, patch)}
              onDelete={() => deleteGoal(g.id)}
            />
          ))}
          {goals.length === 0 && !adding && (
            <div className="empty-state large-empty">
              No goals yet. <button className="link-btn" onClick={() => setAdding(true)}>Add your first goal</button>.
            </div>
          )}
        </div>
      </div>
    );
  }

  function GoalForm({ onSave, onCancel, initial }) {
    const [g, setG] = useState(initial || { title: "", description: "", dueDate: "", keyResults: [] });
    const [newKR, setNewKR] = useState({ text: "", target: "", unit: "" });
    const [addingKR, setAddingKR] = useState(false);

    const addKR = () => {
      if (!newKR.text.trim()) return;
      const kr = { id: H.uid("kr_"), text: newKR.text.trim(), current: 0, target: Number(newKR.target) || 0, unit: newKR.unit.trim() };
      setG({ ...g, keyResults: [...(g.keyResults || []), kr] });
      setNewKR({ text: "", target: "", unit: "" });
      setAddingKR(false);
    };
    const removeKR = (id) => setG({ ...g, keyResults: g.keyResults.filter((kr) => kr.id !== id) });

    return (
      <div className="form-card goal-form">
        <div className="form-row">
          <Field label="Goal title" wide>
            <input className="form-input" value={g.title} onChange={(e) => setG({ ...g, title: e.target.value })} placeholder="e.g. Get first 10 paying customers" />
          </Field>
          <Field label="Due date">
            <input className="form-input" type="date" value={g.dueDate} onChange={(e) => setG({ ...g, dueDate: e.target.value })} />
          </Field>
        </div>
        <Field label="Description">
          <input className="form-input" value={g.description} onChange={(e) => setG({ ...g, description: e.target.value })} placeholder="What does success look like?" />
        </Field>

        <div className="kr-section">
          <div className="kr-section-label">Key Results</div>
          {(g.keyResults || []).map((kr) => (
            <div key={kr.id} className="kr-row">
              <span className="kr-text">{kr.text}</span>
              <span className="kr-target">{kr.target} {kr.unit}</span>
              <button className="task-delete" onClick={() => removeKR(kr.id)}>
                <svg viewBox="0 0 12 12" width="10" height="10"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
              </button>
            </div>
          ))}
          {addingKR ? (
            <div className="kr-add-form">
              <input className="form-input" placeholder="Key result text…" value={newKR.text} onChange={(e) => setNewKR({ ...newKR, text: e.target.value })} />
              <div className="form-row">
                <Field label="Target"><input className="form-input" type="number" placeholder="100" value={newKR.target} onChange={(e) => setNewKR({ ...newKR, target: e.target.value })} /></Field>
                <Field label="Unit"><input className="form-input" placeholder="emails, $, calls…" value={newKR.unit} onChange={(e) => setNewKR({ ...newKR, unit: e.target.value })} /></Field>
              </div>
              <div className="form-actions">
                <button className="ghost-btn small" onClick={() => setAddingKR(false)}>Cancel</button>
                <button className="primary-btn small" onClick={addKR}>Add KR</button>
              </div>
            </div>
          ) : (
            <button className="kr-add-btn" onClick={() => setAddingKR(true)}>+ Add key result</button>
          )}
        </div>

        <div className="form-actions">
          <button className="ghost-btn small" onClick={onCancel}>Cancel</button>
          <button className="primary-btn small" onClick={() => onSave(g)}>Save goal</button>
        </div>
      </div>
    );
  }

  function GoalCard({ goal, onUpdate, onDelete }) {
    const [editing, setEditing] = useState(false);
    const [editingKR, setEditingKR] = useState(null);
    const progress = H.goalProgress(goal);
    const pct = progress.pct;

    const statusLabel = pct >= 100 ? "Achieved" : pct >= 70 ? "On Track" : pct >= 30 ? "In Progress" : "Just started";
    const statusClass = pct >= 100 ? "achieved" : pct >= 70 ? "on-track" : pct >= 30 ? "in-progress" : "not-started";

    if (editing) {
      return <GoalForm initial={goal} onSave={(patch) => { onUpdate(patch); setEditing(false); }} onCancel={() => setEditing(false)} />;
    }

    const updateKRCurrent = (krId, value) => {
      onUpdate({ keyResults: (goal.keyResults || []).map((kr) => kr.id === krId ? { ...kr, current: Number(value) || 0 } : kr) });
    };

    return (
      <div className={"goal-card " + statusClass}>
        <div className="goal-card-top">
          <div className="goal-card-left">
            <span className={"goal-status-badge status-" + statusClass}>{statusLabel}</span>
            {goal.dueDate && <span className="goal-due">Due {H.fmtDateShort(goal.dueDate)}</span>}
          </div>
          <div className="goal-card-actions">
            <button className="ghost-btn small" onClick={() => setEditing(true)}>Edit</button>
            <button className="ghost-btn small danger" onClick={onDelete}>Delete</button>
          </div>
        </div>
        <div className="goal-title">{goal.title}</div>
        {goal.description && <div className="goal-description">{goal.description}</div>}

        <div className="goal-progress-row">
          <div className="goal-progress-bar"><div className="goal-progress-fill" style={{ width: Math.min(100, pct) + "%" }} /></div>
          <span className="goal-pct">{pct}%</span>
        </div>

        {(goal.keyResults || []).length > 0 && (
          <div className="kr-list">
            {goal.keyResults.map((kr) => {
              const krPct = kr.target ? Math.min(100, Math.round((kr.current / kr.target) * 100)) : 0;
              return (
                <div key={kr.id} className="kr-card-row">
                  <div className="kr-card-text">{kr.text}</div>
                  <div className="kr-card-progress">
                    <div className="kr-bar"><div className="kr-bar-fill" style={{ width: krPct + "%" }} /></div>
                    <div className="kr-values">
                      {editingKR === kr.id ? (
                        <input
                          autoFocus
                          type="number"
                          className="kr-current-input"
                          defaultValue={kr.current}
                          onBlur={(e) => { updateKRCurrent(kr.id, e.target.value); setEditingKR(null); }}
                          onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); if (e.key === "Escape") setEditingKR(null); }}
                        />
                      ) : (
                        <span className="kr-current" onClick={() => setEditingKR(kr.id)} title="Click to update">{kr.unit === "$" ? "$" : ""}{H.fmtNumber(kr.current)}</span>
                      )}
                      <span className="kr-target-val">/ {kr.unit === "$" ? "$" : ""}{H.fmtNumber(kr.target)} {kr.unit !== "$" ? kr.unit : ""}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // Habits View
  // ─────────────────────────────────────────────────────

  function HabitsView({ plan, mutatePlan }) {
    const [adding, setAdding] = useState(false);
    const [newText, setNewText] = useState("");

    const habits = plan.habits || [];
    const today = H.todayISO();

    const addHabit = () => {
      if (!newText.trim()) { setAdding(false); return; }
      mutatePlan(plan.id, (p) => ({ ...p, habits: [...(p.habits || []), { id: H.uid("h_"), text: newText.trim(), completedDates: [] }] }));
      setNewText(""); setAdding(false);
    };

    const toggleHabit = (habitId, dateISO) => {
      mutatePlan(plan.id, (p) => ({
        ...p,
        habits: p.habits.map((h) => {
          if (h.id !== habitId) return h;
          const done = (h.completedDates || []).includes(dateISO);
          return { ...h, completedDates: done ? h.completedDates.filter((d) => d !== dateISO) : [...(h.completedDates || []), dateISO] };
        }),
      }));
    };

    const deleteHabit = (id) => mutatePlan(plan.id, (p) => ({ ...p, habits: p.habits.filter((h) => h.id !== id) }));

    // Build last 7 days
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      last7.push({ iso: H.toISODate(d), label: d.toLocaleDateString("en-US", { weekday: "short" }), isToday: i === 0 });
    }

    const totalDoneToday = habits.filter((h) => H.habitDoneToday(h)).length;

    return (
      <div className="data-view habits-view">
        <div className="data-header">
          <div className="data-header-left">
            <h2>Daily Habits</h2>
            <p className="muted">{habits.length} habits tracked · {totalDoneToday}/{habits.length} done today. Consistency beats intensity.</p>
          </div>
          <div className="data-header-right">
            <button className="primary-btn small" onClick={() => setAdding(true)}>+ New habit</button>
          </div>
        </div>

        {adding && (
          <div className="form-card">
            <Field label="Habit">
              <input autoFocus className="form-input" placeholder="e.g. Send 50 cold emails" value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addHabit(); if (e.key === "Escape") { setAdding(false); setNewText(""); } }}
              />
            </Field>
            <div className="form-actions">
              <button className="ghost-btn small" onClick={() => { setAdding(false); setNewText(""); }}>Cancel</button>
              <button className="primary-btn small" onClick={addHabit}>Add habit</button>
            </div>
          </div>
        )}

        {habits.length > 0 ? (
          <div className="habits-table-wrap">
            <div className="habits-table">
              <div className="habits-head">
                <div className="habits-head-name">Habit</div>
                <div className="habits-head-days">
                  {last7.map((d) => (
                    <div key={d.iso} className={"habits-day-label " + (d.isToday ? "today" : "")}>{d.label}</div>
                  ))}
                </div>
                <div className="habits-head-streak">Streak</div>
              </div>
              {habits.map((h) => {
                const streak = H.habitStreak(h);
                const dates = new Set(h.completedDates || []);
                return (
                  <div key={h.id} className="habits-row">
                    <div className="habits-row-name">
                      <span>{h.text}</span>
                      <button className="task-delete" onClick={() => deleteHabit(h.id)} title="Delete habit">
                        <svg viewBox="0 0 12 12" width="9" height="9"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                      </button>
                    </div>
                    <div className="habits-row-days">
                      {last7.map((d) => {
                        const done = dates.has(d.iso);
                        return (
                          <button
                            key={d.iso}
                            className={"habit-dot " + (done ? "done" : "empty") + (d.isToday ? " is-today" : "")}
                            onClick={() => toggleHabit(h.id, d.iso)}
                            title={d.isToday ? "Today" : d.iso}
                          >
                            {done ? (
                              <svg viewBox="0 0 12 12" width="10" height="10"><path d="M2.5 6.5l2.5 2.5L9.5 3.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                    <div className="habits-row-streak">
                      {streak > 0 ? <span className="streak-chip">🔥{streak}</span> : <span className="streak-chip empty">—</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : !adding && (
          <div className="empty-state large-empty">
            No habits tracked yet. <button className="link-btn" onClick={() => setAdding(true)}>Add your first habit</button>.
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // Content Calendar View
  // ─────────────────────────────────────────────────────

  const CONTENT_PLATFORMS = ["LinkedIn", "Twitter/X", "YouTube", "Blog", "Reddit", "Email Newsletter", "Other"];
  const CONTENT_TYPES = ["Post", "Thread", "Video", "Article", "Newsletter", "Other"];
  const CONTENT_STATUSES = ["Idea", "Draft", "Scheduled", "Published", "Archived"];

  function ContentView({ plan, mutatePlan }) {
    const [adding, setAdding] = useState(false);
    const [filterPlatform, setFilterPlatform] = useState("All");
    const [filterStatus, setFilterStatus] = useState("All");
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState(null);

    const content = plan.content || [];

    const add = (item) => mutatePlan(plan.id, (p) => ({ ...p, content: [{ ...item, id: H.uid("cnt_") }, ...(p.content || [])] }));
    const update = (id, patch) => mutatePlan(plan.id, (p) => ({ ...p, content: p.content.map((c) => c.id === id ? { ...c, ...patch } : c) }));
    const remove = (id) => mutatePlan(plan.id, (p) => ({ ...p, content: p.content.filter((c) => c.id !== id) }));

    const filtered = useMemo(() => {
      let list = content;
      if (filterPlatform !== "All") list = list.filter((c) => c.platform === filterPlatform);
      if (filterStatus !== "All") list = list.filter((c) => c.status === filterStatus);
      if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter((c) => [c.title, c.notes, c.platform, c.type].filter(Boolean).join(" ").toLowerCase().includes(q));
      }
      return [...list].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    }, [content, filterPlatform, filterStatus, search]);

    const counts = useMemo(() => ({
      total: content.length,
      published: content.filter((c) => c.status === "Published").length,
      scheduled: content.filter((c) => c.status === "Scheduled").length,
    }), [content]);

    return (
      <div className="data-view">
        <div className="data-header">
          <div className="data-header-left">
            <h2>Content Calendar</h2>
            <p className="muted">{counts.total} total · {counts.published} published · {counts.scheduled} scheduled.</p>
          </div>
          <div className="data-header-right">
            <input className="search-input" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <FilterPill options={["All", ...CONTENT_PLATFORMS]} value={filterPlatform} onChange={setFilterPlatform} />
            <FilterPill options={["All", ...CONTENT_STATUSES]} value={filterStatus} onChange={setFilterStatus} />
            <button className="primary-btn small" onClick={() => setAdding(true)}>+ New content</button>
          </div>
        </div>

        {adding && (
          <ContentForm onSave={(item) => { add(item); setAdding(false); }} onCancel={() => setAdding(false)} />
        )}

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Platform</th>
                <th>Type</th>
                <th>Title / Topic</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const expanded = expandedId === c.id;
                return (
                  <React.Fragment key={c.id}>
                    <tr className={"data-row " + (expanded ? "expanded" : "")} onClick={() => setExpandedId(expanded ? null : c.id)}>
                      <td className="mono-cell">{H.fmtDateShort(c.date)}</td>
                      <td><PlatformBadge platform={c.platform} /></td>
                      <td className="muted-cell">{c.type || "—"}</td>
                      <td className="truncate">{c.title || <span className="muted">—</span>}</td>
                      <td><ContentStatusBadge status={c.status} /></td>
                      <td className="row-chev">
                        <svg viewBox="0 0 10 10" width="10" height="10" style={{ transform: expanded ? "rotate(180deg)" : "" }}>
                          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="data-row-detail">
                        <td colSpan={6}>
                          <ContentForm initial={c} embedded
                            onSave={(patch) => { update(c.id, patch); setExpandedId(null); }}
                            onCancel={() => setExpandedId(null)}
                            onDelete={() => { remove(c.id); setExpandedId(null); }}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="empty-state">No content {search || filterPlatform !== "All" || filterStatus !== "All" ? "matches" : "yet"}. <button className="link-btn" onClick={() => setAdding(true)}>Add one</button>.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function ContentForm({ initial, onSave, onCancel, onDelete, embedded }) {
    const [c, setC] = useState(initial || { date: H.todayISO(), platform: "LinkedIn", type: "Post", title: "", notes: "", url: "", status: "Idea" });
    return (
      <div className={"form-card " + (embedded ? "embedded" : "")}>
        <div className="form-row">
          <Field label="Date">
            <input className="form-input" type="date" value={c.date} onChange={(e) => setC({ ...c, date: e.target.value })} />
          </Field>
          <Field label="Platform">
            <SelectField value={c.platform} onChange={(v) => setC({ ...c, platform: v })} options={CONTENT_PLATFORMS} />
          </Field>
          <Field label="Type">
            <SelectField value={c.type} onChange={(v) => setC({ ...c, type: v })} options={CONTENT_TYPES} />
          </Field>
          <Field label="Status">
            <SelectField value={c.status} onChange={(v) => setC({ ...c, status: v })} options={CONTENT_STATUSES} />
          </Field>
        </div>
        <Field label="Title / Topic" wide>
          <input className="form-input" value={c.title} onChange={(e) => setC({ ...c, title: e.target.value })} placeholder="e.g. How MSPs lose $X/month on unused M365 licenses" />
        </Field>
        <Field label="URL (once published)">
          <input className="form-input" value={c.url} onChange={(e) => setC({ ...c, url: e.target.value })} placeholder="https://…" />
        </Field>
        <Field label="Notes / body / outline">
          <textarea className="form-input" value={c.notes} onChange={(e) => setC({ ...c, notes: e.target.value })} rows={4} placeholder="Draft, key points, hook idea…" />
        </Field>
        <div className="form-actions">
          {onDelete && <button className="ghost-btn small danger" onClick={onDelete}>Delete</button>}
          <div style={{ flex: 1 }} />
          <button className="ghost-btn small" onClick={onCancel}>Cancel</button>
          <button className="primary-btn small" onClick={() => onSave(c)}>Save</button>
        </div>
      </div>
    );
  }

  function PlatformBadge({ platform }) {
    if (!platform) return <span className="badge badge-neutral">—</span>;
    const key = platform.toLowerCase().replace(/[^a-z]/g, "");
    return <span className={"channel-badge platform-" + key}>{platform}</span>;
  }

  function ContentStatusBadge({ status }) {
    if (!status) return <span className="badge badge-neutral">—</span>;
    const key = status.toLowerCase();
    return <span className={"badge content-badge-" + key}>{status}</span>;
  }

  // ─────────────────────────────────────────────────────
  // Notes View — brain dump / scratch pad
  // ─────────────────────────────────────────────────────

  function NotesView({ plan, mutatePlan }) {
    const [text, setText] = useState(plan.notes || "");
    const saveRef = useRef(null);

    const handleChange = (val) => {
      setText(val);
      if (saveRef.current) clearTimeout(saveRef.current);
      saveRef.current = setTimeout(() => {
        mutatePlan(plan.id, (p) => ({ ...p, notes: val }));
      }, 400);
    };

    useEffect(() => {
      setText(plan.notes || "");
    }, [plan.id]);

    const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

    return (
      <div className="data-view notes-view">
        <div className="data-header">
          <div className="data-header-left">
            <h2>Notes</h2>
            <p className="muted">Brain dump — ideas, decisions, objections heard, anything worth remembering. Autosaves.</p>
          </div>
          <div className="data-header-right">
            <span className="word-count">{wordCount} words</span>
          </div>
        </div>
        <div className="notes-container">
          <textarea
            className="notes-textarea"
            value={text}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={"Write anything here…\n\nIdeas, objections heard on calls, decisions made, next steps, what's working, what's not.\n\nUse # for headings, - for lists."}
          />
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // Metrics View
  // ─────────────────────────────────────────────────────

  function MetricsView({ plan, mutatePlan }) {
    const [adding, setAdding] = useState(false);
    const [draft, setDraft] = useState({ name: "", targetMin: "", targetMax: "", unit: "" });

    const updateMetric = (id, patch) => mutatePlan(plan.id, (p) => ({ ...p, metrics: p.metrics.map((m) => m.id === id ? { ...m, ...patch } : m) }));
    const deleteMetric = (id) => mutatePlan(plan.id, (p) => ({ ...p, metrics: p.metrics.filter((m) => m.id !== id) }));

    const addMetric = () => {
      if (!draft.name.trim()) { setAdding(false); return; }
      mutatePlan(plan.id, (p) => ({
        ...p,
        metrics: [...p.metrics, { id: H.uid("m_"), name: draft.name.trim(), current: 0, targetMin: Number(draft.targetMin) || 0, targetMax: Number(draft.targetMax) || Number(draft.targetMin) || 0, unit: draft.unit.trim() || "", history: [] }],
      }));
      setDraft({ name: "", targetMin: "", targetMax: "", unit: "" });
      setAdding(false);
    };

    return (
      <div className="metrics-view">
        <div className="metrics-intro">
          <h2>Targets</h2>
          <p className="muted">Track the numbers that matter. Click a value to edit, or use the bumpers. Log a snapshot to record progress over time.</p>
        </div>
        <div className="metric-grid">
          {plan.metrics.map((m) => (
            <MetricCard key={m.id} metric={m} onUpdate={(patch) => updateMetric(m.id, patch)} onDelete={() => deleteMetric(m.id)} />
          ))}
          {adding ? (
            <div className="metric-card adding">
              <input autoFocus className="inline-input" placeholder="Metric name (e.g. Cold emails sent)" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              <div className="metric-add-row">
                <input className="inline-input small" placeholder="Min target" value={draft.targetMin} onChange={(e) => setDraft({ ...draft, targetMin: e.target.value })} />
                <input className="inline-input small" placeholder="Max target" value={draft.targetMax} onChange={(e) => setDraft({ ...draft, targetMax: e.target.value })} />
                <input className="inline-input small" placeholder="Unit" value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} />
              </div>
              <div className="metric-add-actions">
                <button className="ghost-btn small" onClick={() => setAdding(false)}>Cancel</button>
                <button className="primary-btn small" onClick={addMetric}>Add metric</button>
              </div>
            </div>
          ) : (
            <button className="metric-card add-card" onClick={() => setAdding(true)}><span>+</span><span>New metric</span></button>
          )}
        </div>
      </div>
    );
  }

  function MetricCard({ metric, onUpdate, onDelete }) {
    const [editing, setEditing] = useState(false);
    const [val, setVal] = useState(metric.current);
    const [showHistory, setShowHistory] = useState(false);
    useEffect(() => { setVal(metric.current); }, [metric.current]);

    const pct = metric.targetMin ? Math.min(120, Math.round((metric.current / metric.targetMin) * 100)) : 0;
    const reached = metric.current >= metric.targetMin && metric.targetMin > 0;
    const bump = (delta) => onUpdate({ current: Math.max(0, (metric.current || 0) + delta) });

    const logSnapshot = () => {
      const entry = { date: H.todayISO(), value: metric.current };
      onUpdate({ history: [...(metric.history || []).filter((h) => h.date !== entry.date), entry] });
    };

    return (
      <div className={"metric-card " + (reached ? "reached" : "")}>
        <div className="metric-card-top">
          <span className="metric-name">{metric.name}</span>
          <button className="task-delete" onClick={onDelete} title="Delete">
            <svg viewBox="0 0 12 12" width="10" height="10"><path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
          </button>
        </div>
        <div className="metric-value-row">
          {editing ? (
            <input autoFocus type="number" className="metric-value-input" value={val}
              onChange={(e) => setVal(e.target.value)}
              onBlur={() => { onUpdate({ current: Number(val) || 0 }); setEditing(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
            />
          ) : (
            <span className="metric-value" onClick={() => setEditing(true)}>
              {metric.unit === "$" ? "$" : ""}{H.fmtNumber(metric.current)}
            </span>
          )}
          <span className="metric-target">
            / {H.fmtNumber(metric.targetMin)}{metric.targetMax > metric.targetMin ? `–${H.fmtNumber(metric.targetMax)}` : ""}
            {metric.unit && metric.unit !== "$" ? ` ${metric.unit}` : ""}
          </span>
        </div>
        <div className="metric-bar"><div className="metric-bar-fill" style={{ width: Math.min(100, pct) + "%" }} /></div>
        <div className="metric-foot">
          <span className="metric-pct">{pct}%</span>
          <div className="metric-bumps">
            <button onClick={() => bump(-1)}>−1</button>
            <button onClick={() => bump(1)}>+1</button>
            <button onClick={() => bump(10)}>+10</button>
            <button onClick={() => bump(100)}>+100</button>
          </div>
        </div>
        <div className="metric-log-row">
          <button className="ghost-btn small" onClick={logSnapshot} title="Save today's value as a snapshot">Log snapshot</button>
          {(metric.history || []).length > 0 && (
            <button className="ghost-btn small" onClick={() => setShowHistory(!showHistory)}>
              {showHistory ? "Hide" : "History"} ({metric.history.length})
            </button>
          )}
        </div>
        {showHistory && (
          <div className="metric-history">
            {[...(metric.history || [])].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10).map((h) => (
              <div key={h.date} className="metric-history-row">
                <span className="metric-history-date">{H.fmtDateShort(h.date)}</span>
                <span className="metric-history-val">{metric.unit === "$" ? "$" : ""}{H.fmtNumber(h.value)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // Meetings View
  // ─────────────────────────────────────────────────────

  const MEETING_STATUSES = ["Scheduled", "Completed", "Cancelled", "No-show"];

  function MeetingsView({ plan, mutatePlan }) {
    const [adding, setAdding] = useState(false);
    const [filter, setFilter] = useState("All");

    const update = (id, patch) => mutatePlan(plan.id, (p) => ({ ...p, meetings: p.meetings.map((m) => m.id === id ? { ...m, ...patch } : m) }));
    const remove = (id) => mutatePlan(plan.id, (p) => ({ ...p, meetings: p.meetings.filter((m) => m.id !== id) }));
    const add = (item) => mutatePlan(plan.id, (p) => ({ ...p, meetings: [{ ...item, id: H.uid("mt_") }, ...p.meetings] }));

    const filtered = useMemo(() => {
      const list = filter === "All" ? plan.meetings : plan.meetings.filter((m) => m.status === filter);
      return [...list].sort((a, b) => { const ka = (a.date || "") + (a.time || ""); const kb = (b.date || "") + (b.time || ""); return kb.localeCompare(ka); });
    }, [plan.meetings, filter]);

    return (
      <div className="data-view">
        <div className="data-header">
          <div className="data-header-left">
            <h2>Meetings</h2>
            <p className="muted">Demos, audits, and calls.</p>
          </div>
          <div className="data-header-right">
            <FilterPill options={["All", ...MEETING_STATUSES]} value={filter} onChange={setFilter} />
            <button className="primary-btn small" onClick={() => setAdding(true)}>+ New meeting</button>
          </div>
        </div>
        {adding && <MeetingForm onSave={(item) => { add(item); setAdding(false); }} onCancel={() => setAdding(false)} contacts={plan.contacts} />}
        <div className="card-grid">
          {filtered.map((m) => <MeetingCard key={m.id} meeting={m} onUpdate={(patch) => update(m.id, patch)} onDelete={() => remove(m.id)} contacts={plan.contacts} />)}
          {filtered.length === 0 && !adding && (
            <div className="empty-state large-empty">No meetings yet. <button className="link-btn" onClick={() => setAdding(true)}>Schedule one</button>.</div>
          )}
        </div>
      </div>
    );
  }

  function MeetingForm({ onSave, onCancel, contacts, initial }) {
    const [m, setM] = useState(initial || { title: "", date: H.todayISO(), time: "10:00", duration: "30 min", attendee: "", contactId: "", link: "", agenda: "", notes: "", status: "Scheduled" });
    return (
      <div className="form-card">
        <div className="form-row">
          <Field label="Title" wide>
            <input className="form-input" value={m.title} onChange={(e) => setM({ ...m, title: e.target.value })} placeholder="e.g. M365 leakage audit — Acme MSP" />
          </Field>
          <Field label="Status">
            <SelectField value={m.status} onChange={(v) => setM({ ...m, status: v })} options={MEETING_STATUSES} />
          </Field>
        </div>
        <div className="form-row">
          <Field label="Date"><input className="form-input" type="date" value={m.date} onChange={(e) => setM({ ...m, date: e.target.value })} /></Field>
          <Field label="Time"><input className="form-input" type="time" value={m.time} onChange={(e) => setM({ ...m, time: e.target.value })} /></Field>
          <Field label="Duration"><input className="form-input" value={m.duration} onChange={(e) => setM({ ...m, duration: e.target.value })} placeholder="30 min" /></Field>
        </div>
        <div className="form-row">
          <Field label="Attendee / company" wide>
            <input className="form-input" value={m.attendee} onChange={(e) => setM({ ...m, attendee: e.target.value })} placeholder="Jane @ Acme MSP" />
          </Field>
          <Field label="Linked contact">
            <SelectField value={m.contactId} onChange={(v) => setM({ ...m, contactId: v })} options={[{ value: "", label: "— none —" }, ...(contacts || []).map((c) => ({ value: c.id, label: `${c.name || "—"} · ${c.company || ""}` }))]} />
          </Field>
        </div>
        <Field label="Meeting link"><input className="form-input" value={m.link} onChange={(e) => setM({ ...m, link: e.target.value })} placeholder="https://meet…" /></Field>
        <Field label="Agenda / notes"><textarea className="form-input" value={m.notes} onChange={(e) => setM({ ...m, notes: e.target.value })} rows={3} placeholder="Goals, talking points, key questions…" /></Field>
        <div className="form-actions">
          <button className="ghost-btn small" onClick={onCancel}>Cancel</button>
          <button className="primary-btn small" onClick={() => onSave(m)}>Save</button>
        </div>
      </div>
    );
  }

  function MeetingCard({ meeting, onUpdate, onDelete, contacts }) {
    const [editing, setEditing] = useState(false);
    if (editing) return <MeetingForm initial={meeting} contacts={contacts} onSave={(patch) => { onUpdate(patch); setEditing(false); }} onCancel={() => setEditing(false)} />;
    return (
      <article className={"data-card meeting-card status-" + (meeting.status || "Scheduled").toLowerCase().replace(/\s/g, "-")}>
        <div className="data-card-top">
          <div>
            <div className="data-card-title">{meeting.title || "Untitled meeting"}</div>
            <div className="data-card-sub">{H.fmtDateTime(meeting.date, meeting.time)}{meeting.duration && <span> · {meeting.duration}</span>}</div>
          </div>
          <StatusBadge status={meeting.status} />
        </div>
        <dl className="data-card-fields">
          {meeting.attendee && <div><dt>Attendee</dt><dd>{meeting.attendee}</dd></div>}
          {meeting.link && <div><dt>Link</dt><dd><a className="ext-link" href={meeting.link} target="_blank" rel="noopener">Join ↗</a></dd></div>}
          {meeting.notes && <div className="full"><dt>Notes</dt><dd className="multiline">{meeting.notes}</dd></div>}
        </dl>
        <div className="data-card-actions">
          <button className="ghost-btn small" onClick={() => setEditing(true)}>Edit</button>
          <button className="ghost-btn small danger" onClick={onDelete}>Delete</button>
        </div>
      </article>
    );
  }

  // ─────────────────────────────────────────────────────
  // Contacts View
  // ─────────────────────────────────────────────────────

  const CONTACT_STATUSES = ["New", "Researching", "Contacted", "Replied", "Demo Booked", "Trial", "Customer", "Lost"];

  function ContactsView({ plan, mutatePlan }) {
    const [adding, setAdding] = useState(false);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState(null);
    const [showFunnel, setShowFunnel] = useState(false);

    const update = (id, patch) => mutatePlan(plan.id, (p) => ({ ...p, contacts: p.contacts.map((c) => c.id === id ? { ...c, ...patch } : c) }));
    const remove = (id) => mutatePlan(plan.id, (p) => ({ ...p, contacts: p.contacts.filter((c) => c.id !== id) }));
    const add = (item) => mutatePlan(plan.id, (p) => ({ ...p, contacts: [{ ...item, id: H.uid("c_") }, ...p.contacts] }));

    const filtered = useMemo(() => {
      let list = plan.contacts;
      if (filter !== "All") list = list.filter((c) => c.status === filter);
      if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter((c) => [c.company, c.name, c.email, c.title, c.country, c.source, c.notes].filter(Boolean).join(" ").toLowerCase().includes(q));
      }
      return list;
    }, [plan.contacts, filter, search]);

    const funnelData = useMemo(() => {
      return CONTACT_STATUSES.map((s) => ({ status: s, count: plan.contacts.filter((c) => c.status === s).length }));
    }, [plan.contacts]);

    return (
      <div className="data-view">
        <div className="data-header">
          <div className="data-header-left">
            <h2>Contacts</h2>
            <p className="muted">{plan.contacts.length} total · pipeline of leads, prospects, and customers.</p>
          </div>
          <div className="data-header-right">
            <button className={"ghost-btn small " + (showFunnel ? "active" : "")} onClick={() => setShowFunnel(!showFunnel)}>Funnel</button>
            <input className="search-input" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <FilterPill options={["All", ...CONTACT_STATUSES]} value={filter} onChange={setFilter} />
            <button className="primary-btn small" onClick={() => setAdding(true)}>+ Add contact</button>
          </div>
        </div>

        {showFunnel && (
          <div className="funnel-wrap">
            {funnelData.map((f) => {
              const max = Math.max(1, ...funnelData.map((x) => x.count));
              const width = f.count === 0 ? 4 : Math.max(8, (f.count / max) * 100);
              return (
                <div key={f.status} className="funnel-row" onClick={() => { setFilter(f.status); setShowFunnel(false); }}>
                  <div className="funnel-label">{f.status}</div>
                  <div className="funnel-bar-wrap">
                    <div className="funnel-bar" style={{ width: width + "%" }} />
                  </div>
                  <div className="funnel-count">{f.count}</div>
                </div>
              );
            })}
          </div>
        )}

        {adding && <ContactForm onSave={(item) => { add(item); setAdding(false); }} onCancel={() => setAdding(false)} />}

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Contact</th>
                <th>Title</th>
                <th>Email</th>
                <th>Country</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const expanded = expandedId === c.id;
                return (
                  <React.Fragment key={c.id}>
                    <tr className={"data-row " + (expanded ? "expanded" : "")} onClick={() => setExpandedId(expanded ? null : c.id)}>
                      <td className="strong">{c.company || <span className="muted">—</span>}</td>
                      <td>{c.name || <span className="muted">—</span>}</td>
                      <td className="muted-cell">{c.title || "—"}</td>
                      <td className="mono-cell">{c.email || "—"}</td>
                      <td className="muted-cell">{c.country || "—"}</td>
                      <td><StatusBadge status={c.status} /></td>
                      <td className="row-chev">
                        <svg viewBox="0 0 10 10" width="10" height="10" style={{ transform: expanded ? "rotate(180deg)" : "" }}>
                          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="data-row-detail">
                        <td colSpan={7}>
                          <ContactForm initial={c} embedded
                            onSave={(patch) => { update(c.id, patch); setExpandedId(null); }}
                            onCancel={() => setExpandedId(null)}
                            onDelete={() => { remove(c.id); setExpandedId(null); }}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="empty-state">No contacts {search || filter !== "All" ? "match" : "yet"}. <button className="link-btn" onClick={() => setAdding(true)}>Add one</button>.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function ContactForm({ initial, onSave, onCancel, onDelete, embedded }) {
    const [c, setC] = useState(initial || { company: "", name: "", title: "", email: "", phone: "", linkedin: "", country: "", source: "", status: "New", personalization: "", notes: "", lastContacted: "" });
    return (
      <div className={"form-card " + (embedded ? "embedded" : "")}>
        <div className="form-row">
          <Field label="Company" wide><input className="form-input" value={c.company} onChange={(e) => setC({ ...c, company: e.target.value })} /></Field>
          <Field label="Status"><SelectField value={c.status} onChange={(v) => setC({ ...c, status: v })} options={CONTACT_STATUSES} /></Field>
        </div>
        <div className="form-row">
          <Field label="Name"><input className="form-input" value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} /></Field>
          <Field label="Title"><input className="form-input" value={c.title} onChange={(e) => setC({ ...c, title: e.target.value })} placeholder="Owner, COO, CEO…" /></Field>
          <Field label="Country"><input className="form-input" value={c.country} onChange={(e) => setC({ ...c, country: e.target.value })} placeholder="US, UK, AU…" /></Field>
        </div>
        <div className="form-row">
          <Field label="Email"><input className="form-input" value={c.email} onChange={(e) => setC({ ...c, email: e.target.value })} /></Field>
          <Field label="Phone"><input className="form-input" value={c.phone} onChange={(e) => setC({ ...c, phone: e.target.value })} /></Field>
          <Field label="LinkedIn"><input className="form-input" value={c.linkedin} onChange={(e) => setC({ ...c, linkedin: e.target.value })} placeholder="linkedin.com/in/…" /></Field>
        </div>
        <div className="form-row">
          <Field label="Source"><input className="form-input" value={c.source} onChange={(e) => setC({ ...c, source: e.target.value })} placeholder="Apollo, LinkedIn, Reddit…" /></Field>
          <Field label="Last contacted"><input className="form-input" type="date" value={c.lastContacted} onChange={(e) => setC({ ...c, lastContacted: e.target.value })} /></Field>
        </div>
        <Field label="Personalization note">
          <input className="form-input" value={c.personalization} onChange={(e) => setC({ ...c, personalization: e.target.value })} placeholder="Something specific for outreach…" />
        </Field>
        <Field label="Notes">
          <textarea className="form-input" value={c.notes} onChange={(e) => setC({ ...c, notes: e.target.value })} rows={3} />
        </Field>
        <div className="form-actions">
          {onDelete && <button className="ghost-btn small danger" onClick={onDelete}>Delete</button>}
          <div style={{ flex: 1 }} />
          <button className="ghost-btn small" onClick={onCancel}>Cancel</button>
          <button className="primary-btn small" onClick={() => onSave(c)}>Save</button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // Outreach View
  // ─────────────────────────────────────────────────────

  const OUTREACH_CHANNELS = ["Email", "LinkedIn", "Phone", "Reddit", "Other"];
  const OUTREACH_STATUSES = ["Draft", "Sent", "Opened", "Replied", "Booked", "Bounced", "Closed"];

  function OutreachView({ plan, mutatePlan }) {
    const [adding, setAdding] = useState(false);
    const [filterCh, setFilterCh] = useState("All");
    const [filterSt, setFilterSt] = useState("All");
    const [search, setSearch] = useState("");
    const [expandedId, setExpandedId] = useState(null);

    const update = (id, patch) => mutatePlan(plan.id, (p) => ({ ...p, outreach: p.outreach.map((o) => o.id === id ? { ...o, ...patch } : o) }));
    const remove = (id) => mutatePlan(plan.id, (p) => ({ ...p, outreach: p.outreach.filter((o) => o.id !== id) }));
    const add = (item) => mutatePlan(plan.id, (p) => ({ ...p, outreach: [{ ...item, id: H.uid("o_") }, ...p.outreach] }));

    const filtered = useMemo(() => {
      let list = plan.outreach;
      if (filterCh !== "All") list = list.filter((o) => o.channel === filterCh);
      if (filterSt !== "All") list = list.filter((o) => o.status === filterSt);
      if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter((o) => [o.contactName, o.contactEmail, o.subject, o.notes, o.company].filter(Boolean).join(" ").toLowerCase().includes(q));
      }
      return [...list].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    }, [plan.outreach, filterCh, filterSt, search]);

    const counts = useMemo(() => ({
      total: plan.outreach.length,
      sent: plan.outreach.filter((o) => ["Sent", "Opened", "Replied", "Booked"].includes(o.status)).length,
      replied: plan.outreach.filter((o) => ["Replied", "Booked"].includes(o.status)).length,
    }), [plan.outreach]);

    return (
      <div className="data-view">
        <div className="data-header">
          <div className="data-header-left">
            <h2>Outreach log</h2>
            <p className="muted">{counts.total} total · {counts.sent} sent · {counts.replied} replied/booked.</p>
          </div>
          <div className="data-header-right">
            <input className="search-input" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <FilterPill options={["All", ...OUTREACH_CHANNELS]} value={filterCh} onChange={setFilterCh} />
            <FilterPill options={["All", ...OUTREACH_STATUSES]} value={filterSt} onChange={setFilterSt} />
            <button className="primary-btn small" onClick={() => setAdding(true)}>+ Log outreach</button>
          </div>
        </div>
        {adding && <OutreachForm contacts={plan.contacts} onSave={(item) => { add(item); setAdding(false); }} onCancel={() => setAdding(false)} />}
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th><th>Channel</th><th>Contact</th><th>Subject / topic</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const expanded = expandedId === o.id;
                return (
                  <React.Fragment key={o.id}>
                    <tr className={"data-row " + (expanded ? "expanded" : "")} onClick={() => setExpandedId(expanded ? null : o.id)}>
                      <td className="mono-cell">{H.fmtDateShort(o.date)}</td>
                      <td><ChannelBadge channel={o.channel} /></td>
                      <td>
                        <div className="strong">{o.contactName || <span className="muted">—</span>}</div>
                        <div className="muted-cell">{o.company || o.contactEmail || ""}</div>
                      </td>
                      <td className="truncate">{o.subject || <span className="muted">—</span>}</td>
                      <td><StatusBadge status={o.status} /></td>
                      <td className="row-chev">
                        <svg viewBox="0 0 10 10" width="10" height="10" style={{ transform: expanded ? "rotate(180deg)" : "" }}>
                          <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </td>
                    </tr>
                    {expanded && (
                      <tr className="data-row-detail">
                        <td colSpan={6}>
                          <OutreachForm initial={o} contacts={plan.contacts} embedded
                            onSave={(patch) => { update(o.id, patch); setExpandedId(null); }}
                            onCancel={() => setExpandedId(null)}
                            onDelete={() => { remove(o.id); setExpandedId(null); }}
                          />
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="empty-state">No outreach yet. <button className="link-btn" onClick={() => setAdding(true)}>Log one</button>.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function OutreachForm({ initial, contacts, onSave, onCancel, onDelete, embedded }) {
    const [o, setO] = useState(initial || { date: H.todayISO(), channel: "Email", status: "Sent", contactId: "", contactName: "", contactEmail: "", company: "", subject: "", notes: "" });
    const onSelectContact = (id) => {
      if (!id) { setO({ ...o, contactId: "" }); return; }
      const c = (contacts || []).find((x) => x.id === id);
      if (!c) return;
      setO({ ...o, contactId: id, contactName: c.name, contactEmail: c.email, company: c.company });
    };
    return (
      <div className={"form-card " + (embedded ? "embedded" : "")}>
        <div className="form-row">
          <Field label="Date"><input className="form-input" type="date" value={o.date} onChange={(e) => setO({ ...o, date: e.target.value })} /></Field>
          <Field label="Channel"><SelectField value={o.channel} onChange={(v) => setO({ ...o, channel: v })} options={OUTREACH_CHANNELS} /></Field>
          <Field label="Status"><SelectField value={o.status} onChange={(v) => setO({ ...o, status: v })} options={OUTREACH_STATUSES} /></Field>
        </div>
        <div className="form-row">
          <Field label="Link to contact">
            <SelectField value={o.contactId} onChange={onSelectContact} options={[{ value: "", label: "— manual entry —" }, ...(contacts || []).map((c) => ({ value: c.id, label: `${c.name || "—"} · ${c.company || ""}` }))]} />
          </Field>
        </div>
        <div className="form-row">
          <Field label="Contact name"><input className="form-input" value={o.contactName} onChange={(e) => setO({ ...o, contactName: e.target.value })} /></Field>
          <Field label="Email"><input className="form-input" value={o.contactEmail} onChange={(e) => setO({ ...o, contactEmail: e.target.value })} /></Field>
          <Field label="Company"><input className="form-input" value={o.company} onChange={(e) => setO({ ...o, company: e.target.value })} /></Field>
        </div>
        <Field label="Subject / topic"><input className="form-input" value={o.subject} onChange={(e) => setO({ ...o, subject: e.target.value })} placeholder="Quick M365 license audit for Acme?" /></Field>
        <Field label="Notes / body"><textarea className="form-input" value={o.notes} onChange={(e) => setO({ ...o, notes: e.target.value })} rows={4} /></Field>
        <div className="form-actions">
          {onDelete && <button className="ghost-btn small danger" onClick={onDelete}>Delete</button>}
          <div style={{ flex: 1 }} />
          <button className="ghost-btn small" onClick={onCancel}>Cancel</button>
          <button className="primary-btn small" onClick={() => onSave(o)}>Save</button>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────
  // Accounts (Vault) View
  // ─────────────────────────────────────────────────────

  const ACCOUNT_CATEGORIES = ["Email / Domain", "Outreach Tool", "CRM", "Marketplace", "Payment", "Social", "Other"];

  function AccountsView({ plan, mutatePlan }) {
    const [adding, setAdding] = useState(false);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");

    const update = (id, patch) => mutatePlan(plan.id, (p) => ({ ...p, accounts: p.accounts.map((a) => a.id === id ? { ...a, ...patch } : a) }));
    const remove = (id) => mutatePlan(plan.id, (p) => ({ ...p, accounts: p.accounts.filter((a) => a.id !== id) }));
    const add = (item) => mutatePlan(plan.id, (p) => ({ ...p, accounts: [{ ...item, id: H.uid("a_") }, ...p.accounts] }));

    const filtered = useMemo(() => {
      let list = plan.accounts;
      if (filter !== "All") list = list.filter((a) => a.category === filter);
      if (search.trim()) {
        const q = search.toLowerCase();
        list = list.filter((a) => [a.service, a.url, a.email, a.notes].filter(Boolean).join(" ").toLowerCase().includes(q));
      }
      return list;
    }, [plan.accounts, filter, search]);

    return (
      <div className="data-view">
        <div className="data-header">
          <div className="data-header-left">
            <h2>Accounts</h2>
            <p className="muted">Service logins, marketplaces, and tools. Stored locally in your browser only.</p>
          </div>
          <div className="data-header-right">
            <input className="search-input" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <FilterPill options={["All", ...ACCOUNT_CATEGORIES]} value={filter} onChange={setFilter} />
            <button className="primary-btn small" onClick={() => setAdding(true)}>+ Add account</button>
          </div>
        </div>
        <div className="vault-notice">
          <span className="vault-icon" aria-hidden="true">!</span>
          <span>Data is stored in localStorage, not encrypted. Don't use this for sensitive production credentials — use a real password manager.</span>
        </div>
        {adding && <AccountForm onSave={(item) => { add(item); setAdding(false); }} onCancel={() => setAdding(false)} />}
        <div className="card-grid">
          {filtered.map((a) => <AccountCard key={a.id} account={a} onUpdate={(patch) => update(a.id, patch)} onDelete={() => remove(a.id)} />)}
          {filtered.length === 0 && !adding && (
            <div className="empty-state large-empty">No accounts {search || filter !== "All" ? "match" : "yet"}. <button className="link-btn" onClick={() => setAdding(true)}>Add one</button>.</div>
          )}
        </div>
      </div>
    );
  }

  function AccountForm({ initial, onSave, onCancel, onDelete, embedded }) {
    const [a, setA] = useState(initial || { service: "", url: "", email: "", username: "", password: "", category: "Other", notes: "" });
    const [showPw, setShowPw] = useState(false);
    return (
      <div className={"form-card " + (embedded ? "embedded" : "")}>
        <div className="form-row">
          <Field label="Service" wide><input className="form-input" value={a.service} onChange={(e) => setA({ ...a, service: e.target.value })} placeholder="Apollo, OpenPhone, Pax8…" /></Field>
          <Field label="Category"><SelectField value={a.category} onChange={(v) => setA({ ...a, category: v })} options={ACCOUNT_CATEGORIES} /></Field>
        </div>
        <Field label="URL"><input className="form-input" value={a.url} onChange={(e) => setA({ ...a, url: e.target.value })} placeholder="https://…" /></Field>
        <div className="form-row">
          <Field label="Email / username"><input className="form-input" value={a.email} onChange={(e) => setA({ ...a, email: e.target.value })} /></Field>
          <Field label="Password">
            <div className="password-input">
              <input className="form-input" type={showPw ? "text" : "password"} value={a.password} onChange={(e) => setA({ ...a, password: e.target.value })} />
              <button className="eye-btn" type="button" onClick={() => setShowPw(!showPw)}>{showPw ? "Hide" : "Show"}</button>
            </div>
          </Field>
        </div>
        <Field label="Notes"><textarea className="form-input" value={a.notes} onChange={(e) => setA({ ...a, notes: e.target.value })} rows={2} placeholder="Recovery codes, 2FA hint, etc." /></Field>
        <div className="form-actions">
          {onDelete && <button className="ghost-btn small danger" onClick={onDelete}>Delete</button>}
          <div style={{ flex: 1 }} />
          <button className="ghost-btn small" onClick={onCancel}>Cancel</button>
          <button className="primary-btn small" onClick={() => onSave(a)}>Save</button>
        </div>
      </div>
    );
  }

  function AccountCard({ account, onUpdate, onDelete }) {
    const [editing, setEditing] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [copied, setCopied] = useState("");
    if (editing) return <AccountForm initial={account} onSave={(patch) => { onUpdate(patch); setEditing(false); }} onCancel={() => setEditing(false)} onDelete={() => { onDelete(); setEditing(false); }} />;
    const copy = (val, key) => {
      if (!val) return;
      try { navigator.clipboard.writeText(val); setCopied(key); setTimeout(() => setCopied(""), 1200); } catch (e) {}
    };
    return (
      <article className="data-card account-card">
        <div className="data-card-top">
          <div><div className="data-card-title">{account.service || "Untitled"}</div><div className="data-card-sub">{account.category}</div></div>
        </div>
        <dl className="data-card-fields">
          {account.url && <div><dt>URL</dt><dd><a className="ext-link" href={account.url.startsWith("http") ? account.url : "https://" + account.url} target="_blank" rel="noopener">Open ↗</a></dd></div>}
          {account.email && <div><dt>Email</dt><dd><span className="mono-cell">{account.email}</span><button className="mini-copy" onClick={() => copy(account.email, "email")}>{copied === "email" ? "✓" : "Copy"}</button></dd></div>}
          {account.password && <div><dt>Password</dt><dd><span className="mono-cell">{showPw ? account.password : "••••••••"}</span><button className="mini-copy" onClick={() => setShowPw(!showPw)}>{showPw ? "Hide" : "Show"}</button><button className="mini-copy" onClick={() => copy(account.password, "pw")}>{copied === "pw" ? "✓" : "Copy"}</button></dd></div>}
          {account.notes && <div className="full"><dt>Notes</dt><dd className="multiline">{account.notes}</dd></div>}
        </dl>
        <div className="data-card-actions">
          <button className="ghost-btn small" onClick={() => setEditing(true)}>Edit</button>
          <button className="ghost-btn small danger" onClick={onDelete}>Delete</button>
        </div>
      </article>
    );
  }

  // ─────────────────────────────────────────────────────
  // Shared form atoms
  // ─────────────────────────────────────────────────────

  function Field({ label, children, wide }) {
    return (
      <label className={"field " + (wide ? "wide" : "")}>
        <span className="field-label">{label}</span>
        {children}
      </label>
    );
  }

  function SelectField({ value, onChange, options }) {
    const normalized = options.map((o) => (typeof o === "string" ? { value: o, label: o } : o));
    return (
      <select className="form-input form-select" value={value} onChange={(e) => onChange(e.target.value)}>
        {normalized.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    );
  }

  function FilterPill({ options, value, onChange }) {
    return (
      <select className="filter-pill" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  function StatusBadge({ status }) {
    if (!status) return <span className="badge badge-neutral">—</span>;
    const key = status.toLowerCase().replace(/[\s/]/g, "-");
    return <span className={"badge badge-" + key}>{status}</span>;
  }

  function ChannelBadge({ channel }) {
    if (!channel) return <span className="badge badge-neutral">—</span>;
    return <span className={"channel-badge channel-" + channel.toLowerCase()}>{channel}</span>;
  }

  // ─────────────────────────────────────────────────────
  // Export
  // ─────────────────────────────────────────────────────

  window.PV = {
    ProgressRing,
    TodayView,
    TimelineView,
    GoalsView,
    HabitsView,
    ContentView,
    NotesView,
    MetricsView,
    MeetingsView,
    ContactsView,
    OutreachView,
    AccountsView,
  };
})();
