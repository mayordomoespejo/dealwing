# DealWing ✈️

> **Find the best flight deals, visualized on an interactive map.**

DealWing is a full-stack portfolio project that helps users discover affordable flights through a beautiful split-view interface: a smart search form on the left, a live map with arc routes and price bubbles on the right.

---

## Features

### Core MVP

- **Interactive map** — MapLibre GL JS with curved arc routes + animated price bubble markers
- **Airport autocomplete** — debounced search with IATA/city/country matching
- **Flight search** — one-way & round-trip, date pickers, adults selector, currency switcher
- **Deal Score (0–100)** — composite score vs. the full result set (price 60%, duration 30%, stops 10%)
- **CO₂ estimation** — approximate per-passenger emissions (ICAO method, with disclaimer)
- **Search history** — last 8 searches in localStorage, one-click restore
- **Saved flights** — heart-save any offer, review at `/saved`
- **Filters & sorting** — max price slider, stops filter, airline selector; sort by price/duration/deal score
- **Flight detail modal** — full itinerary, segments, layovers, deal gauge, CO₂ card

### UX / DX

- Keyboard shortcuts: `/` → focus search field, `Esc` → close modal
- Skeleton loading cards + graceful empty / error states
- Dark mode via `prefers-color-scheme` + CSS custom properties
- Micro-animations: Framer Motion stagger cards, spring modal, fade toasts
- Collapsible sidebar with animated toggle
- Fully accessible: ARIA roles, focus trap in modal, keyboard nav in autocomplete
- Mobile responsive (drawer layout on small screens)

---

## Tech Stack

| Layer         | Technology                                               |
| ------------- | -------------------------------------------------------- |
| Frontend      | React 19 + Vite 7                                        |
| Routing       | React Router v7                                          |
| Data fetching | TanStack Query v5                                        |
| Forms         | react-hook-form + Zod v4                                 |
| HTTP          | Native `fetch` (no axios)                                |
| Map           | MapLibre GL JS v5 + OpenFreeMap tiles (free, no API key) |
| Animations    | Framer Motion v12                                        |
| Styling       | CSS Modules + CSS custom properties                      |
| BFF           | Vercel Serverless Functions (`/api/`)                    |
| Flight API    | Amadeus Self-Service (test environment)                  |
| Testing       | Vitest + Testing Library + Playwright                    |
| Lint/Format   | ESLint 9 + Prettier                                      |
| Git hooks     | Husky v9 + lint-staged                                   |
| CI            | GitHub Actions                                           |
| Deploy        | Vercel (frontend + functions)                            |

---

## Architecture

```
dealwing/
├── api/                         # Vercel Serverless Functions (BFF)
│   ├── _amadeus.js              # OAuth2 token helper + amadeusGet()
│   ├── _mock.js                 # Realistic mock data (no credentials needed)
│   ├── flight-offers.js         # GET /api/flight-offers
│   └── locations.js             # GET /api/locations?q=...
│
├── src/
│   ├── app/                     # Router, providers, layout, header
│   ├── pages/                   # Home, Saved, NotFound
│   ├── features/
│   │   ├── search/              # SearchForm, AirportAutocomplete, schema, history
│   │   ├── flights/             # api, hooks, mapper, dealScore, CO2, cards, detail
│   │   ├── map/                 # MapView + useMap hook
│   │   └── saved/               # useSaved hook + SavedList
│   ├── components/ui/           # Button, Modal, Skeleton, Badge, Toast
│   ├── hooks/                   # useLocalStorage, useKeyboard
│   ├── lib/                     # airports (~100), formatters, geo, http, queryKeys
│   └── styles/                  # variables.css (design tokens), reset.css
│
├── e2e/                         # Playwright end-to-end tests
├── .github/workflows/ci.yml    # Lint + test + build CI
└── vercel.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### 1. Clone and install

```bash
git clone https://github.com/your-username/dealwing.git
cd dealwing
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

For **local development with mock data** (no Amadeus account needed):

```env
VITE_MOCK_API=true
```

For **real Amadeus data** (register at https://developers.amadeus.com/self-service):

```env
VITE_MOCK_API=false
AMADEUS_CLIENT_ID=your_client_id
AMADEUS_CLIENT_SECRET=your_client_secret
AMADEUS_ENV=test
AMADEUS_MOCK_MODE=false
```

### 3. Run locally

```bash
# Mock mode — frontend only, no backend needed
npm run dev

# Real Amadeus — start Vercel dev server (frontend + /api functions)
npx vercel dev
```

Open [http://localhost:5173](http://localhost:5173) (or port shown in terminal).

---

## Environment Variables

| Variable                | Description                                 | Default         |
| ----------------------- | ------------------------------------------- | --------------- |
| `VITE_MOCK_API`         | `"true"` → skip BFF, use built-in mock data | `"true"` in dev |
| `AMADEUS_CLIENT_ID`     | Amadeus API client ID                       | —               |
| `AMADEUS_CLIENT_SECRET` | Amadeus API client secret                   | —               |
| `AMADEUS_ENV`           | `"test"` or `"production"`                  | `"test"`        |
| `AMADEUS_MOCK_MODE`     | `"true"` → BFF returns mock data            | `"false"`       |

---

## Scripts

```bash
npm run dev           # Vite dev server (http://localhost:5173)
npm run build         # Production build
npm run preview       # Serve production build locally
npm run lint          # ESLint (errors = fail)
npm run lint:fix      # ESLint with auto-fix
npm run format        # Prettier — format all files
npm run format:check  # Prettier — CI check (no write)
npm run test          # Vitest unit tests (single run)
npm run test:watch    # Vitest watch mode
npm run test:e2e      # Playwright end-to-end
```

---

## API Integration

DealWing proxies all external calls through a small BFF layer (`/api/`) so API keys are never exposed in the browser.

### Amadeus Self-Service endpoints used

| Endpoint                           | Purpose                         |
| ---------------------------------- | ------------------------------- |
| `POST /v1/security/oauth2/token`   | OAuth2 token (cached in-memory) |
| `GET /v2/shopping/flight-offers`   | Search flight offers            |
| `GET /v1/reference-data/locations` | Airport autocomplete            |

### Mock mode

Set `VITE_MOCK_API=true` (default in development) to use the built-in mock dataset — no Amadeus account required. Includes ~20 realistic offers from **MAD**, **LHR**, and **JFK** origins.

---

## Deployment (Vercel)

1. Push to GitHub and import the repo in [Vercel](https://vercel.com)
2. Set environment variables in Vercel dashboard:
   - `AMADEUS_CLIENT_ID`
   - `AMADEUS_CLIENT_SECRET`
   - `AMADEUS_ENV` = `test`
   - `VITE_MOCK_API` = `false`
3. Deploy — Vercel auto-detects Vite + the `/api/` serverless functions

---

## Roadmap

- [ ] **Explore mode** — cheapest destinations from any origin (no fixed destination)
- [ ] **Price calendar** — heatmap of cheapest days (Amadeus Flight Dates API)
- [ ] **Multi-city** — add a leg builder for complex itineraries
- [ ] **Booking links** — affiliate redirects (Kayak, Google Flights)
- [ ] **Price alerts** — notify when a saved search drops in price
- [ ] **PWA** — offline support + install prompt

---

## License

MIT — Built for portfolio purposes. Not affiliated with Amadeus IT Group.
