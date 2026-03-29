# Feather Hi-Fi Prototype (Next.js)

A high-fidelity prototype based on the uploaded paper sketch.

## Features included
- Four-stage task board: To Do, In Progress, Review, Completed
- Task allocation with assignees, priority, difficulty, expected vs actual time, due dates, and progress
- Group chat and private chat
- Reactions + AI summary block to reduce chat clutter
- Shared weekly availability timetable
- Accountability panel showing balanced workload
- Editable/customisable home screen widgets

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Structure

```text
app/
  globals.css
  layout.tsx
  page.tsx
components/
  AvailabilityPanel.tsx
  ChatPanel.tsx
  CustomizationPanel.tsx
  TaskBoard.tsx
  data.ts
```
