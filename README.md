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

From the **Dashboard**, you can:

- Browse your sessions in Timeline, List, or Sessions views
- Find across titles, URLs, and summaries
- Edit session titles, remove tabs, and move tabs between sessions
- Session sorting and filtering
- Export/Import data as JSON for backup or sharing
**
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

## Installation

### Chrome Web Store

*Currently the extension is not uploaded to Web Store*

### Manual

1. Clone the repository
```sh
git clone https://github.com/Jay-Karia/wherewasi
```

2. Build the extension by running the script based on your system (Windows/Unix)
```sh
# For Unix (Linux/Mac)
./scripts/build.sh

# For Windows (PowerShell)
./scripts/build.ps1
```

3. Open Chrome and navigate to `chrome://extensions/`
4. Enable "Developer mode" using the toggle in the top right corner.
5. Click on "Load unpacked" and select the `build` folder from the cloned repository.

## Roadmap

**v0.1.0**

- [x] Improve the content provided to AI while grouping sessions.
- [ ] Add summaries from Summarizer API
- [x] Error handling AI fails.

**v1.0.0**
- [ ] Regenerate Session Title
- [ ] Merge Sessions
- [ ] Tabs caching
- [ ] Ignore injecting scripts to same window when refreshed
- [ ] Browser processing queue.
- [ ] Improve dashboard search with fuzzy finding.

<br>

**🚀 Coming Soon**
