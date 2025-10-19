# WhereWasI Dashboard

The Dashboard provides a user interface to browse and manage your saved browsing sessions.
Access the dashboard from the extension popup by clicking the extension icon from the toolbar.

**Keyboard Shortcut:**

- Windows/Linux: `Ctrl+Shift+Y`
- macOS: `Cmd+Shift+Y`

## Views

- Sessions: Grid of sessions with expandable details
- Timeline: Sessions grouped by day with a vertical timeline layout
- List: Sessions grouped by day in a compact table-like list

## Search

- Natural language search across titles, URLs, and AI-generated summaries
- Filters by date range and minimum number of tabs

## Sorting

- Sort sessions by date (newest/oldest).

## Interactions

- Right-click on sessions and tabs for context menu actions (edit title, remove tabs, delete)
- Drag n Drop to move a tab from one session to another
- Bulk remove tabs from a session

## Tech

- Vite + React + TypeScript
- TailwindCSS
- Jotai
- Shadcn UI

## Development

Run the dashboard locally with Vite:

```bash
cd dashboard
npm install
npm run dev
```

Build for production (consumed by the extension options_page):

```bash
npm run build
```
