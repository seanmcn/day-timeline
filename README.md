# day-timeline

A block-based daily timeline with planned vs actual tracking.

This is a small, personal web app I built to help myself have better days without rigid schedules or productivity theatre. It's designed for flexibility: you plan your day in rough blocks, track what actually happens, and let the timeline adapt as the day unfolds.

It's opinionated, but intentionally simple.

---

## What it is

- A **daily timeline**, not a calendar
- Based on **blocks** (e.g. Wake, Deep Work, Food, Wind-down)
- Each block has:
  - an estimated duration
  - actual time tracked via start/stop
- Shows **planned vs actual**, including how your day (and bedtime) drifts
- Designed for night owls and non-linear days

You can:
- reorder blocks
- duplicate blocks (e.g. multiple work or break sessions)
- adjust estimates day by day
- see whether you're ahead or behind without guilt

---

## What it is not

- Not a productivity app
- Not a task manager
- Not a habit tracker
- Not optimised for teams or collaboration

This is a tool for running *one* day at a time.

---

## Features (MVP)

- "I'm awake" button to start the day
- Flexible, reorderable day blocks
- Per-block time tracking (multiple sessions)
- Planned vs actual time comparison
- Bedtime forecast based on remaining plan
- Daily totals (work, movement, downtime)
- Syncs across devices
- Touch-friendly UI (works well on iPad)

---

## Tech stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **State**: Zustand
- **Backend**: AWS Lambda (Node.js 20) + API Gateway HTTP API
- **Auth**: AWS Cognito
- **Storage**: S3 (JSON per day)
- **Hosting**: AWS Amplify
- **Local Dev**: Docker + LocalStack

There's no database. State is stored as small JSON files.

---

## Project structure

```
day-timeline/
├── frontend/          # Vite React app
├── backend/           # Lambda functions
├── shared/            # Shared TypeScript types
├── docker/            # Docker/LocalStack configuration
├── scripts/           # Development scripts
└── docker-compose.yml
```

---

## Running locally

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- npm 9+

### Quick start

```bash
# Clone the repo
git clone <repo-url>
cd day-timeline

# Run the setup script
chmod +x scripts/dev-setup.sh
./scripts/dev-setup.sh

# Start the frontend
npm run dev:frontend
```

The app will be available at http://localhost:3000

### Available commands

```bash
npm run dev:frontend   # Start frontend dev server
npm run dev:backend    # Watch backend for changes
npm run docker:up      # Start LocalStack
npm run docker:down    # Stop LocalStack
npm run docker:logs    # View LocalStack logs
npm run build          # Build all packages
npm run typecheck      # Run TypeScript checks
```

### Test user

For local development, a test user is automatically created:
- Email: `test@example.com`
- Password: `TestPass123`

---

## Default blocks

| Block | Default Time | Category |
|-------|-------------|----------|
| Wake + Warm-up | 90 min | routine |
| Deep Work | 150 min | work |
| Break + Movement | 30 min | movement |
| Food + Admin | 90 min | routine |
| Dota | 90 min | leisure |
| Light Work | 90 min | work |
| Wind-down | 120 min | routine |
| Bed (Comics) | 120 min | routine |

---

## Status

This is an early MVP built for personal use.

It works, but it's intentionally minimal and will evolve slowly. Backwards compatibility is not guaranteed.

---

## License

MIT © Sean McNamara

Use it however you like. If it helps you have better days, that's a win.
