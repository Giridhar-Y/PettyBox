# PettyBox

PettyBox is a local-first petty cash workspace built with React, TypeScript, and Vite. It provides a finance-oriented UI for reviewing claims, managing entities and teams, and adjusting workspace settings without requiring a backend service.

## What It Does

- Review and update petty cash claims
- Create new claims with attached receipt files
- Manage legal entities and team directories
- Persist workspace data in the browser with seeded demo data
- Export claims and directory data to Excel or PDF

## Stack

- React 19
- TypeScript
- Vite 8
- Tailwind CSS 4
- Framer Motion
- Recharts
- jsPDF and SheetJS
- Sonner

## Local Development

Install dependencies if needed:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Run lint:

```bash
npm run lint
```

## Notes

- Workspace data is stored in `localStorage` through [src/lib/mockData.ts](/d:/PettyBox/src/lib/mockData.ts).
- The app seeds demo data on first load and supports resetting the workspace from the Settings page.
- There is no backend integration yet. The current experience is intentionally local-first so the product can be demoed and iterated quickly.

## Verification Status

Current repository state has been verified with:

- `npm.cmd run lint`
- `npm.cmd run build`

The production build succeeds. Vite still reports a large chunk warning, so code-splitting would be a good next optimization step before shipping broadly.
