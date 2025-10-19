<div align="center" style="margin-top: 30px">
    <img src="./assets/logo.png" alt="Logo" width="80" />
    <h1 style="margin-top: 12px;">Where Was I</h1>
    <p>
        A Chrome extension that remembers your sessions by capturing tabs, grouping<br/> them into sessions, with AI-powered summaries.
    </p>
</div>

---

<!-- Short Demo Video -->

## What it does

Where Was I watches your browsing and, when a tab is closed, it saves the tab’s title, URL, favicon, and metadata. Tabs are auto-grouped into “sessions”. These sessions are summarized with AI so you can quickly recall what you were doing and jump back in.

From the Dashboard, you can:

- Browse your sessions in Timeline, List, or Sessions views
- Search using natural language across titles, URLs, and summaries
- Edit session titles, remove tabs, and move tabs between sessions
- Session sorting and filtering
- Export/Import data as JSON for backup or sharing

**Privacy**

All data is stored locally in your browser. No servers used.

---

## Key features

- Automatic capture of closed tabs (title, URL, favicon, timestamps)
- Auto grouping into sessions
- AI-generated session summaries
- Search and filters
- Move tabs across sessions using drag and drop
- Sessions sorting
- Export/Import to JSON

---

## How it works

- Background service worker listens when a browser tab is closed.
- The worker searches for a suitable sessions to add the closed tab to using **Gemini AI**.
- If suitable session is found, the tab is added to it. Otherwise, a new session is created.
- Session summary is generated from **Summarizer API**.
- All data is stored locally in the browser.
- The Dashboard provides a user interface to browse, search, and manage your sessions.

---

<!-- Installation -->

<!-- Technical Details -->

<!-- Contributing and Project Structure -->

<!-- Motivation -->

<!-- Image Gallery -->

<!-- Tips and Tricks -->

## Roadmap

**v1.0.0**

- [x] Improve the content provided to AI while grouping sessions.
- [ ] Improve dashboard search with fuzzy finding.
- [ ] Add summaries from Summarizer API
- [ ] Error handling AI fails.
- [ ] Browser processing queue.
- [ ] Performance and optimizations

**🚀 Coming Soon**
