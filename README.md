# Todolio — Personal workspace

A responsive, local-first task planner built with React 19, Vite, React Router, and Lucide icons.

## Run locally

Use Node.js 22 or later and npm:

```bash
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:5173`). Keep the terminal running. Press Ctrl+C to stop.

```bash
npm test          # Behavior tests; no additional test dependencies
npm run lint     # ESLint
npm run build    # Production bundle in dist/
npm run preview  # Preview the production bundle locally
```

## Features

- All Tasks, Today (including older overdue tasks), Upcoming, Completed, and Trash.
- Search task titles and notes. Combine category, priority, and due-date filters with sorting by due date, priority, newest, or title.
- Task notes, optional local due dates/times, three priority levels, custom categories, and independently checked subtasks.
- Completion and deletion with an eight-second Undo notification. Restore archived tasks at any time. Permanent deletion from Trash requires confirmation.
- Daily counts and progress: tasks completed today divided by tasks completed today plus active tasks due today. Historical completions without a timestamp are excluded.
- Light/dark themes, system preference on first use, mobile navigation, keyboard focus styles, accessible forms, and reduced-motion support.
- JSON backup export and validated import with counts and confirmation before replacing existing data.

## Local data and backups

Tasks stay in this browser at this site address; there are no accounts or cloud sync. Different devices, browsers, ports, and site addresses have separate storage. Export a backup before clearing browser data or changing addresses.

The first run automatically migrates the original `tasks`, `completedTasks`, `deletedTasks`, and `categories` local storage keys into `pransxzy.tasks.v1`. It keeps the original keys as a recovery copy. Duplicate task IDs are replaced without dropping tasks. Migrated tasks get medium priority, empty notes/subtasks, and unknown creation/completion timestamps.

Date-only deadlines expire at the end of the local calendar day. A time only applies when a date is selected. Views refresh every 30 seconds and when the window regains focus.

Use **Export** in the sidebar to download all tasks (including Completed and Trash) and categories. Use **Import** to select a Todolio version 1 JSON backup, review the counts, and confirm replacement. Import supports files up to 10 MB. Themes are saved separately and do not change during import.

If saved data cannot be parsed or validated, automatic writes are blocked. Export a recovery copy containing the original storage values, import a valid backup, or explicitly confirm a fresh start. A recovery copy is raw diagnostic data, not an importable task backup. If storage becomes full or unavailable after editing, changes remain in memory and an error banner offers export and retry.

Google Fonts supplies DM Sans and Space Grotesk when available; standard sans-serif fonts work offline. No task data is sent to a backend.

## Implementation

- `src/lib/tasks.js` handles migration, backup validation, task transitions, filters, sorting, local-date logic, and statistics.
- `src/App.jsx` provides workspace navigation, persistence, themes, backup flows, and task views.
- `src/components/` contains the shared task card, task editor, and accessible native dialog.

The existing `/`, `/completed`, and `/deleted` routes remain available. `/today` and `/upcoming` are added. Static hosting must send these routes to `index.html` for direct links to work.
