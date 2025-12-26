# day-timeline

A block-based daily timeline with planned vs actual tracking.

This is a small, personal web app I built to help myself have better days without rigid schedules or productivity theatre. It’s designed for flexibility: you plan your day in rough blocks, track what actually happens, and let the timeline adapt as the day unfolds.

It’s opinionated, but intentionally simple.

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
- see whether you’re ahead or behind without guilt

---

## What it is not

- Not a productivity app
- Not a task manager
- Not a habit tracker
- Not optimised for teams or collaboration

This is a tool for running *one* day at a time.

---

## Features (MVP)

- “I’m awake” button to start the day
- Flexible, reorderable day blocks
- Per-block time tracking (multiple sessions)
- Planned vs actual time comparison
- Bedtime forecast based on remaining plan
- Daily totals (work, movement, downtime)
- Syncs across devices
- Touch-friendly UI (works well on iPad)

---

## Tech stack

- Frontend: React + Vite + TypeScript
- Hosting: AWS Amplify
- Auth: AWS Cognito
- Backend: AWS Lambda + HTTP API
- Storage: S3 (JSON per day)

There’s no database. State is stored as small JSON files.

---

## Status

This is an early MVP built for personal use.

It works, but it’s intentionally minimal and will evolve slowly. Backwards compatibility is not guaranteed.

---

## Running locally

Instructions will be added once the initial version is stable.

For now, this repo focuses on the hosted version.

---

## License

MIT © Sean McNamara

Use it however you like. If it helps you have better days, that’s a win.
