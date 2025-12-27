# Development Guide

This document covers how to set up and contribute to Day Timeline. For an overview of what the app does, see the [README](../README.md).

---

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **State Management**: Zustand
- **Backend**: AWS Amplify Gen 2 (AppSync + DynamoDB)
- **Auth**: AWS Cognito (email login, invite-only)
- **Hosting**: AWS Amplify

---

## Architecture

**npm workspaces monorepo** with two packages:

- `shared/` - TypeScript types and utilities
- `frontend/` - React + Vite application

**Amplify Gen 2 backend** (`amplify/`):
- `auth/resource.ts` - Cognito user pool configuration
- `data/resource.ts` - AppSync GraphQL API + DynamoDB

**Data flow:**
- Frontend uses Amplify Data client (`generateClient`)
- DayState stored in DynamoDB with owner-based authorization
- One record per user per day (composite key: userId + date)
- Real-time sync via AppSync subscriptions

---

## Project Structure

```
day-timeline/
├── frontend/          # React + Vite app
│   └── src/
│       ├── components/   # UI components
│       ├── store/        # Zustand state management
│       └── ...
├── shared/            # Shared TypeScript types
│   └── src/
│       └── index.ts     # Block, DayState, TimeSession types
├── amplify/           # Amplify Gen 2 backend
│   ├── auth/
│   └── data/
└── package.json       # Workspace root
```

---

## Development Setup

### Prerequisites

- Node.js 20+
- npm 9+
- AWS account with credentials configured (`aws configure`)

### First Time Setup

```bash
# Clone the repo
git clone <repo-url>
cd day-timeline

# Install dependencies
npm install

# Build shared types (required before first run)
npm run build:shared

# Start Amplify sandbox (creates isolated AWS resources)
npm run sandbox

# In another terminal, start the frontend
npm run dev:frontend
```

The app will be available at http://localhost:3000

### Available Commands

```bash
# Development
npm run sandbox          # Start Amplify sandbox (generates amplify_outputs.json)
npm run dev              # Start sandbox + frontend dev server
npm run dev:frontend     # Frontend only (port 3000) - requires sandbox running

# Build
npm run build:shared     # Build shared types
npm run build            # Build all packages
npm run typecheck        # TypeScript check all packages
```

---

## Key Concepts

### Core Types (in `shared/src/index.ts`)

- **Block** - A time block with estimate, sessions, completed state
- **DayState** - Full day state with blocks array and dayStartAt
- **TimeSession** - Start/end timestamps for time tracking
- **calculateBlockActualMinutes()** - Computes actual time from sessions

### Frontend State (`frontend/src/store/dayStore.ts`)

- Zustand store with all block/session actions
- Auto-saves to Amplify Data on every change
- Recalculates metrics every second when a session is active

### Real-time Sync

Changes sync across devices via AppSync subscriptions. The frontend subscribes to DayState updates and merges incoming changes.

---

## Default Block Templates

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

## Local Development Notes

- Amplify sandbox creates real AWS resources in an isolated environment
- `amplify_outputs.json` is generated in `frontend/` and configures the frontend
- Each developer gets their own sandbox environment
- Sandbox resources are cleaned up when you stop the sandbox
