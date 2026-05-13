# CLAUDE.md — Task Manager Project

This file gives you permanent context about this project.
Read it at the start of every conversation before touching any code.

---

## What this project is

A fullstack team task manager with a calendar UI.
Users can create, assign, and manage tasks with optional recurrence (every N days).
No database — data is persisted in a local JSON file on the backend.

---

## Stack

| Layer | Technology |
|---|---|
| Backend | .NET 8 Web API (C#) |
| Frontend | React 18 + TypeScript + Vite |
| Storage | JSON file (`backend/data.json`) |
| Auth | Simple token-based (token stored in localStorage) |
| Styling | Plain CSS / inline styles — NO UI libraries |

---

## Project structure

```
/task-manager
  /backend
    Program.cs
    Controllers/
      AuthController.cs
      TasksController.cs
      UsersController.cs
    Models/
      AppTask.cs
      User.cs
      RecurrenceRule.cs
    Services/
      DataService.cs          ← all JSON read/write lives here
      RecurrenceService.cs    ← expands recurring tasks into instances
    data.json                 ← live data file (gitignored)
  /frontend
    src/
      App.tsx
      api/
        client.ts             ← ALL fetch calls go here, nowhere else
      components/
        Calendar/
          CalendarMonth.tsx
          CalendarWeek.tsx
          CalendarHeader.tsx
        Tasks/
          TaskCard.tsx
          TaskModal.tsx
          TaskList.tsx
        Auth/
          LoginPage.tsx
      hooks/
        useTasks.ts
        useAuth.ts
      types/
        index.ts              ← all shared TypeScript types
```

---

## Running the project

```bash
# Backend (runs on http://localhost:5000)
cd backend
dotnet run

# Frontend (runs on http://localhost:5173)
cd frontend
npm run dev
```

---

## Architecture rules — always follow these

### Backend
- `DataService` is the ONLY place that reads or writes `data.json`. Never do file I/O in controllers.
- `RecurrenceService.ExpandInstances(task, from, to)` generates virtual instances for a date range. It does NOT write to disk.
- Recurrence overrides (e.g. marking one instance done) are stored as a separate list in `data.json`, keyed by `{ taskId, instanceDate }`.
- All endpoints are protected by a simple token middleware — check the `Authorization` header for a valid token.
- CORS is open to `http://localhost:5173` only.
- Return consistent error shapes: `{ error: "message" }` with appropriate HTTP status codes.

### Frontend
- ALL API calls go through `src/api/client.ts`. Never use `fetch` directly in components or hooks.
- Auth state (current user + token) lives in React Context (`useAuth` hook). Never read from localStorage directly in components.
- Task data fetching and mutation lives in `useTasks` hook. Components only call hook methods — they don't know about fetch.
- No Redux, no Zustand, no external state libraries.
- No `any` types — everything must be typed via `src/types/index.ts`.
- One responsibility per file. If a component file exceeds ~150 lines, split it.

---

## Data models

### User
```typescript
interface User {
  id: string;           // uuid
  name: string;
  email: string;
  passwordHash: string;
  color: string;        // hex, e.g. "#3b82f6" — used for avatar
}
```

### Task
```typescript
interface AppTask {
  id: string;
  title: string;
  description: string;
  dueDate: string;          // ISO8601
  assignedTo: string[];     // array of user ids
  status: 'todo' | 'inprogress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdBy: string;        // user id
  recurrence: RecurrenceRule | null;
}

interface RecurrenceRule {
  intervalDays: number;     // repeat every N days
  startDate: string;        // ISO8601
  endDate: string | null;   // ISO8601 or null = forever
}

interface RecurrenceOverride {
  taskId: string;
  instanceDate: string;     // ISO8601
  status: 'todo' | 'inprogress' | 'done';
}
```

---

## API endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/login | `{ email, password }` → `{ token, user }` |
| POST | /api/auth/logout | Invalidates token |
| GET | /api/users | Returns all users (for assignee picker) |
| GET | /api/tasks?from=&to= | Tasks + expanded recurrence instances in range |
| POST | /api/tasks | Create task |
| PUT | /api/tasks/{id} | Update task |
| DELETE | /api/tasks/{id} | Delete task + all its overrides |
| PATCH | /api/tasks/{id}/status | `{ instanceDate?, status }` — updates one instance or base task |

---

## UI conventions

### Colors
```
Background:       #ffffff
Surface:          #f5f5f5
Text primary:     #111111
Text secondary:   #6b7280
Border:           #e5e5e5

Priority low:     #6b7280  (gray)
Priority medium:  #3b82f6  (blue)
Priority high:    #ef4444  (red)

Status todo:      #6b7280
Status inprogress:#f59e0b
Status done:      #22c55e
```

### Components
- **TaskModal**: opens as a centered overlay with a subtle backdrop. CSS transition for open/close — no animation library.
- **Calendar pills**: small colored chips showing task title + assignee avatar dot. Truncate with ellipsis if too long.
- **User avatar**: circle with initials (first + last name initial), background = user's `color` field.
- **Priority badge**: small pill with priority color background (10% opacity) and colored text.

---

## Seed data

On first run (if `data.json` doesn't exist), seed with:

**Users:**
- Alice Johnson / alice@team.com / color: #3b82f6
- Bob Smith / bob@team.com / color: #8b5cf6
- Carol White / carol@team.com / color: #10b981

**Password for all seed users:** `password123`

**Sample tasks:**
- "Q2 Planning" — assigned to Alice, due next Monday, priority high
- "Weekly sync prep" — assigned to Alice + Bob, recurs every 7 days, priority medium

---

## What NOT to do

- Do NOT use FullCalendar, MUI, Ant Design, or any heavy UI library
- Do NOT add a real database — JSON file only
- Do NOT use Redux or Zustand
- Do NOT fetch data directly in components — always go through hooks
- Do NOT write file I/O outside of DataService
- Do NOT use `any` in TypeScript
- Do NOT add features not listed here without asking first
