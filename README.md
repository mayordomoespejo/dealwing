# DealWing

Find the best flight deals, visualized on an interactive map.

---

## Stack

| Layer         | Technology                            |
| ------------- | ------------------------------------- |
| Frontend      | React 19 + Vite 7                     |
| Routing       | React Router v7                       |
| Data fetching | TanStack Query v5                     |
| Forms         | react-hook-form + Zod v4              |
| Map           | MapLibre GL JS v5 + OpenFreeMap tiles |
| Animations    | Framer Motion v12                     |
| Styling       | CSS Modules + CSS custom properties   |
| i18n          | react-i18next (EN / ES)               |
| BFF           | Vercel Serverless Functions (`/api/`) |
| Flight API    | Duffel (Sandbox)                      |
| Testing       | Vitest + Testing Library + Playwright |
| Lint / Format | ESLint 9 (flat config) + Prettier     |
| Git hooks     | Husky v9 + lint-staged                |
| Deploy        | Vercel                                |

---

## Demo

https://dealwing.vercel.app

---

## Features

- Interactive map with curved arc routes and animated price bubble markers
- Airport autocomplete with debounced search and IATA/city/country matching
- Flight search supporting one-way and round-trip, date pickers, and passenger count
- Deal Score (0-100) composite rating relative to the full result set (price 60%, duration 30%, stops 10%)
- CO2 estimation per passenger using a simplified ICAO method
- Search history storing the last 8 searches in localStorage with one-click restore
- Saved flights — heart-save any offer and review them at `/saved`
- Filters and sorting by max price, stops, airline, price, duration, and deal score
- Flight detail modal with full itinerary, segments, layovers, deal gauge, and CO2 card
- Three-way theme toggle (system / light / dark) persisted across sessions
- English and Spanish interface via react-i18next
- Micro-animations with Framer Motion stagger cards, spring modal, and fade toasts
- Collapsible sidebar with animated toggle
- Fully accessible: ARIA roles, focus trap in modal, keyboard navigation in autocomplete and custom selects
- Mobile responsive layout with drawer on small screens
- Keyboard shortcuts: `/` focuses the search field, `Esc` closes the modal
- React error boundary isolating flight-list crashes from the rest of the page

---

## Getting started

### Prerequisites

- Node.js 20+
- npm 10+

Clone and install:

```bash
git clone https://github.com/your-username/dealwing.git
cd dealwing
npm install
```

Copy the environment file:

```bash
cp .env.example .env.local
```

Run locally (frontend + BFF together via Vercel dev):

```bash
npx vercel dev
```

Open the URL shown in the terminal (typically http://localhost:5173).

For local development without a Duffel account, set `VITE_MOCK_API=true` in `.env.local` to use the built-in mock dataset.

---

## Environment variables

| Variable              | Description                                                |
| --------------------- | ---------------------------------------------------------- |
| `VITE_MOCK_API`       | Set to `"true"` to skip the BFF and use built-in mock data |
| `DUFFEL_ACCESS_TOKEN` | Duffel access token for flight search (server-only)        |
| `RAPIDAPI_KEY`        | RapidAPI key for AeroDataBox airport search (server-only)  |

---

## Scripts

| Command                 | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Vite dev server at http://localhost:5173 |
| `npm run build`         | Production build                         |
| `npm run preview`       | Serve the production build locally       |
| `npm run lint`          | ESLint check (errors fail the run)       |
| `npm run lint:fix`      | ESLint with auto-fix                     |
| `npm run format`        | Prettier — format all files              |
| `npm run format:check`  | Prettier — CI check without writing      |
| `npm run test`          | Vitest unit tests (single run)           |
| `npm run test:watch`    | Vitest in watch mode                     |
| `npm run test:coverage` | Vitest with coverage report              |
| `npm run test:e2e`      | Playwright end-to-end tests              |

---

## License

MIT
