# Solo Planner

A personal command center for solo entrepreneurs running a marketing launch — tasks, daily habits, goals (OKRs), content calendar, outreach log, contacts pipeline, and metrics, all in one offline-first browser app.

Built as a static HTML + React + Babel app — no build step, no server, no database. All data lives in your browser's `localStorage`.

## Features

- **Today** — Command-center dashboard with stats row, habit checklist, and priority-sorted tasks
- **Plan** — 30-day timeline broken into weeks and days
- **Goals** — OKR-style objectives with key results and progress tracking
- **Habits** — Daily habit tracker with 7-day streak visualization
- **Content Calendar** — Track LinkedIn, YouTube, Reddit, Blog, Newsletter posts by status
- **Meetings** — Schedule and review demos / audit calls
- **Contacts** — MSP CRM with a pipeline funnel visualization
- **Outreach** — Log every cold email, LinkedIn DM, and call
- **Metrics** — Numeric KPIs with snapshot history
- **Notes** — Autosaving brain dump for ideas, decisions, and call notes
- **Accounts** — Local-only credential vault for marketing tools
- **Dark mode** toggle in the sidebar

Pre-loaded with a 30-day MSP marketing plan as an example. Click **Reset data** in the sidebar to start fresh.

## Run locally

You need a static file server because `<script src="*.jsx">` cannot be loaded over `file://`.

```bash
npx serve .
```

Then open the printed URL (usually <http://localhost:3000>).

Or use Python:

```bash
python -m http.server 8000
```

## Deploy

This is a pure static site. Drop the files on any host:

- **GitHub Pages** — push to GitHub, then in repo Settings → Pages, set the source to the `main` branch (root).
- **Netlify / Vercel / Cloudflare Pages** — drag and drop the folder, no build command needed.

## Stack

- React 18 (loaded from CDN)
- Babel Standalone (in-browser JSX compilation)
- Vanilla CSS with OKLCH color tokens
- `localStorage` for persistence

## License

MIT
