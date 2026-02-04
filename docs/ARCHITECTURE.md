# Mindleaf - Technical Architecture

## Overview

Mindleaf is a client-side Progressive Web App (PWA) for mental wellness, combining reading tracking, journaling, mood logging, and goal management. All data is stored locally in the browser via IndexedDB — there is no backend server.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 18, TypeScript 5.6 |
| Routing | React Router DOM 6 |
| State | Zustand 5 |
| Database | Dexie 4 (IndexedDB) |
| Editor | TipTap 2 (ProseMirror) |
| Styling | Tailwind CSS 4 |
| Animations | Framer Motion 11 |
| Charts | Recharts 2 |
| Build | Vite 6 |
| PWA | vite-plugin-pwa (Workbox) |
| Testing | Vitest, Testing Library |

## System Architecture

```
+----------------------------------------------------------+
|                        Browser                            |
|                                                           |
|  +----------------------------------------------------+  |
|  |                   React App                         |  |
|  |                                                     |  |
|  |  +-----------+  +------------+  +---------------+  |  |
|  |  |  Pages    |  |  Features  |  |  Shared       |  |  |
|  |  |           |  |            |  |  Components   |  |  |
|  |  | Dashboard |  | reading/   |  |  Button       |  |  |
|  |  | Reading   |  | journal/   |  |  Card         |  |  |
|  |  | Journal   |  | mood/      |  |  Modal        |  |  |
|  |  | Mood      |  | goals/     |  |  Toast        |  |  |
|  |  | Goals     |  | dashboard/ |  |  MoodSelector |  |  |
|  |  | Settings  |  | settings/  |  |  ...          |  |  |
|  |  +-----------+  +------------+  +---------------+  |  |
|  |        |              |                             |  |
|  |        v              v                             |  |
|  |  +------------+  +-------------+                    |  |
|  |  | Zustand    |  | Feature     |                    |  |
|  |  | Stores     |  | Services    |                    |  |
|  |  | (UI state) |  | (business   |                    |  |
|  |  |            |  |  logic)     |                    |  |
|  |  +------------+  +------+------+                    |  |
|  |                         |                           |  |
|  |                         v                           |  |
|  |               +---------+----------+                |  |
|  |               | Dexie (IndexedDB)  |                |  |
|  |               | MindleafDB         |                |  |
|  |               +--------------------+                |  |
|  +----------------------------------------------------+  |
|                                                           |
|  +--------------------+  +-----------------------------+  |
|  | Service Worker     |  | Open Library API (external) |  |
|  | (Workbox/PWA)      |  | - Book search              |  |
|  | - Asset caching    |  | - ISBN lookup               |  |
|  | - Cover caching    |  | - Cover images              |  |
|  +--------------------+  +-----------------------------+  |
+----------------------------------------------------------+
```

## Data Flow

### Read Path (displaying data)
```
Component
  -> useLiveQuery (Dexie React Hook)
    -> IndexedDB query
      -> Reactive update on data change
        -> Component re-renders
```

### Write Path (saving data)
```
User Action
  -> Component event handler
    -> Feature service function
      -> Dexie put/add/update
        -> IndexedDB write
          -> useLiveQuery auto-refreshes subscribers
```

### State Management Split

| Store | Purpose | Persistence |
|-------|---------|-------------|
| **Dexie (IndexedDB)** | All user data (books, sessions, entries, moods, goals) | Persistent across sessions |
| **Zustand** | Transient UI state (active forms, modals, toasts, theme) | In-memory only (some synced to localStorage) |

## Database Schema

```
MindleafDB
  |
  |-- books
  |     id, title, author, isbn, coverUrl, totalPages,
  |     currentPage, status, dateAdded, dateCompleted, tags
  |
  |-- readingSessions
  |     id, bookId -> books.id, startTime, endTime,
  |     duration, pagesRead, quotes[], thoughts[],
  |     moodBefore, moodAfter
  |
  |-- journalEntries
  |     id, content (HTML), plainText, dateCreated,
  |     dateModified, moodBefore, moodAfter, tags[],
  |     bookId -> books.id, isDraft
  |
  |-- moodEntries
  |     id, timestamp, moodLevel (1-5),
  |     specificEmotions[], activityTags[], note
  |
  |-- goals
  |     id, type, frequency, target, unit,
  |     createdAt, isActive
  |
  |-- achievements
  |     id, type, name, description, earnedAt, icon
  |
  |-- tags
        id, name, category, color, isCustom
```

### Entity Relationships

```
books ----< readingSessions     (one book has many sessions)
books ----< journalEntries      (optional: entry linked to book)
moodEntries >---- tags          (mood entries reference emotion/activity tags)
journalEntries >---- tags       (entries have multiple tags)
goals -----> aggregates from readingSessions, journalEntries, moodEntries
achievements -----> triggered by milestones across all entities
```

## Feature Data Flows

### Reading Session Flow
```
Search Open Library API -> Select book -> Save to books table
  -> Start session (Zustand readingStore tracks active state)
    -> worker-timers runs background timer
      -> User adds quotes/thoughts during session
        -> End session -> Save to readingSessions table
          -> Update book.currentPage
            -> Dashboard charts refresh via useLiveQuery
```

### Journal Entry Flow
```
Open editor -> Create draft in journalEntries (isDraft: true)
  -> TipTap editor captures rich text (HTML + plainText)
    -> useAutoSave debounces writes (1s) to IndexedDB
      -> User adds mood, tags, linked book
        -> Publish -> Set isDraft: false
          -> Journal list refreshes via useLiveQuery
```

### Mood Logging Flow
```
Select mood level (1-5) -> Select emotions -> Select activities -> Add note
  -> Save to moodEntries table
    -> insightService analyzes correlations
      -> Dashboard mood trend chart updates
        -> Achievement checks run
```

### Goal Progress Flow
```
Create goal (type, frequency, target) -> Save to goals table
  -> goalService.calculateProgress() aggregates from:
      - readingSessions (reading-time, reading-pages goals)
      - journalEntries (journal-entries goals)
      - moodEntries (mood-logs goals)
    -> GoalCard renders progress percentage
```

## Project Structure

```
src/
  pages/              # Route-level components (lazy-loaded)
  router/             # React Router config
  layouts/            # MainLayout (sidebar/bottom nav)
  features/           # Feature modules
    dashboard/        #   components/ + services/
    reading/          #   components/ + hooks/ + services/
    journal/          #   components/ + hooks/ + services/ + data/
    mood/             #   components/ + services/
    goals/            #   components/ + services/
    settings/         #   services/
  db/                 # Dexie database, schema, hooks
  store/              # Zustand stores (5 stores)
  shared/
    components/       # Reusable UI components
    hooks/            # Shared React hooks
    utils/            # Date helpers, formatters, cn()
```

## Routing

All routes are lazy-loaded with `React.lazy()` and wrapped in `Suspense`.

| Route | Page | Notes |
|-------|------|-------|
| `/` | Redirect to `/dashboard` | |
| `/dashboard` | DashboardPage | Landing page with insights |
| `/reading` | ReadingPage | Book library |
| `/reading/:bookId` | BookDetailPage | Book details, sessions, quotes |
| `/reading/:bookId/session` | ReadingSessionPage | Full-screen reading mode |
| `/journal` | JournalPage | Entry list |
| `/journal/new` | JournalEditorPage | New entry |
| `/journal/:entryId` | JournalEditorPage | Edit entry |
| `/mood` | MoodPage | Mood history + logging |
| `/goals` | GoalsPage | Goal management |
| `/settings` | SettingsPage | Theme, export, preferences |

## Responsive Layout

- **Desktop (1024px+):** Fixed sidebar navigation + main content area
- **Mobile (<1024px):** Bottom navigation bar + full-width content
- **Reading sessions:** Full-screen layout (no nav)

## External Dependencies

### Open Library API
- **Search:** `openlibrary.org/search.json` — book discovery
- **ISBN:** `openlibrary.org/isbn/{isbn}.json` — ISBN lookup
- **Covers:** `covers.openlibrary.org/b/id/{id}-{size}.jpg` — book cover images
- Cover images cached by service worker (CacheFirst, 30 days, 100 max entries)

## PWA & Offline

- **Service Worker:** Auto-update registration via Workbox
- **Asset Caching:** JS, CSS, HTML, images, fonts
- **Runtime Caching:** Book covers (CacheFirst strategy)
- **Offline:** Fully functional — all data in IndexedDB, only book search requires network
- **Installable:** Standalone display mode, portrait orientation
