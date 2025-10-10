# Where Was I - Planning Document

## Overview

**Problem**: Users lose valuable context when browser tabs are closed. Traditional browser history only shows URLs without context, making it difficult to reconstruct what you were working on or why specific tabs were important.

**Solution**: AI-powered browser extension that intelligently captures and remembers your browsing context, enabling quick restoration of entire sessions with meaningful descriptions and natural language search capabilities.

## Features

- **Automatic Tab Capture**: Captures content, title, URL, and timestamp when tabs close. Groups related tabs into sessions.
- **AI Summarization**: Generates searchable summaries of tabs and sessions with key concepts and metadata.
- **Smart Search**: Natural language search across sessions with fuzzy matching.
- **Session Restoration**: One-click restore of entire sessions or selective tabs.
- **Timeline View**: Visual timeline organized by sessions with filtering capabilities.
- **Tagging & Organization**: Auto and manual tagging with custom categories.
- **Export/Import**: Share or backup sessions as JSON.
- **Privacy Controls**: Local storage, configurable retention, site exclusions.

## User Flow

Tab Close → Capture Data → AI Summary → Local Storage → Search/Browse → Restore

## Dasboard

**Header Section**

- Search bar with natural language input
- Quick filters (Today, This Week, By Domain, By Tags)
- Settings/Export buttons

**Main Content Area**

- **Timeline View** (default): Chronological session cards with thumbnails
- **Grid View**: Compact session tiles with key details
- **List View**: Dense text-based session listing

**Session Cards Include**

- Session title/auto-generated name
- Timestamp and duration
- Tab count and key domains
- AI-generated summary preview
- Quick action buttons (Restore All, Restore Selected, Tag, Delete)

**Sidebar Panel**

- Recent sessions (last 10)
- Saved/starred sessions
- Tag cloud with counts
- Storage usage indicator

**Footer**

- Pagination/infinite scroll
- Bulk actions (Delete, Export, Tag)
- View options toggle

**Interactive Elements**

- Hover previews for session details
- Expandable session cards showing individual tabs
- Drag-and-drop for tagging
- Keyboard shortcuts for power users
