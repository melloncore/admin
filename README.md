# Nexlayer Admin

Admin dashboard for the Nexlayer company portfolio website. Built with
**Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**.

This project is intentionally **static-first**: every screen reads and
writes through a small local data layer (backed by `localStorage`) instead
of a real backend. That data layer is written so a real API can be dropped
in later without touching any component — see [Swapping in a real API](#swapping-in-a-real-api).

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`. You'll be redirected to `/login`.

**Demo credentials:**
- Email: `admin@nexlayer.example`
- Password: `nexlayer123`

Or use "Sign up" to create a new local account.

## What's included

| Area | Route | Capability |
|---|---|---|
| Dashboard | `/dashboard` | Traffic snapshot, new leads, unread messages, top clicks |
| Analytics | `/analytics` | Visitors/page views over time, click tracking, cookie-consent breakdown |
| Hero | `/hero` | Edit headline, subheadline, CTAs, hero image |
| Services | `/services` | Full CRUD on services, including nested engagement models |
| About | `/about` | Company description + CRUD on values and stats/percentages |
| Team | `/team` | CRUD on team member cards |
| Testimonials | `/testimonials` | CRUD on client testimonials |
| Blog | `/blog` | CRUD on posts with a rich text editor and inline images |
| Availability | `/calendar` | Weekly hours + blocked dates for booking |
| Messages | `/messages` | Live chat-style inbox with customers |
| Contact | `/contact` | CRUD on email/phone/address channels + response time |
| Leads | `/leads` | List + detail view of inbound project inquiries |
| Footer | `/footer` | Logo, description, socials, company/services/contact link lists, copyright year |
| Appearance | `/appearance` | Primary/secondary/tertiary brand color editor with live preview |
| Account | `/settings` | Profile + change password |
| Auth | `/login`, `/signup`, `/forgot-password` | Local mock authentication |

## Project structure

```
src/
  app/                  Route segments (App Router), one folder per page
    (admin)/            Auth-protected admin routes, wrapped in AdminShell
    login|signup|forgot-password/
  components/
    ui/                 Generic, reusable UI primitives (Button, Modal, DataTable, ...)
    layout/             Sidebar, Topbar, AdminShell, AuthGuard
    domain/             Feature-specific composite components (ServiceForm, BlogForm, ...)
  context/               AuthContext, ToastContext
  hooks/                 useCollection, useSettings — generic data-fetching hooks
  lib/
    api/                 One module per domain (services, blog, leads, ...) — the API seam
    mock/                Seed data
    utils/               cn, id/slug, date, storage helpers
  types/                 Shared TypeScript types for every domain
```

## Swapping in a real API

Every domain in `src/lib/api/index.ts` is built from two generic factories in
`src/lib/api/collection.ts`:

- `createCollectionApi<T>(key, seed)` — for list resources (services, team, blog, leads, ...)
- `createSettingsApi<T>(key, seed)` — for single-object settings (hero, about, footer, appearance, ...)

Both currently persist to `localStorage`. To connect a real backend, replace
the body of each function (`list`, `create`, `update`, `remove`, `get`,
`replace`) with `fetch()` calls to your API. Nothing in `hooks/` or any page
component needs to change, since they only depend on the function
signatures (`Promise<T>`, `Promise<T[]>`, etc.).

## Scripts

```bash
npm run dev          # start the dev server
npm run build         # production build
npm run lint          # ESLint
npm run lint:fix       # ESLint with autofix
npm run format         # Prettier
npm run typecheck      # tsc --noEmit
npm run test           # Jest
npm run test:watch     # Jest in watch mode
npm run validate       # lint + typecheck + test (what CI/pre-commit run)
```

## Quality tooling

- **ESLint** (`next/core-web-vitals` + Prettier) catches bugs and enforces
  consistent style.
- **Prettier** (with `prettier-plugin-tailwindcss`) formats code and sorts
  Tailwind classes.
- **Husky + lint-staged** run ESLint/Prettier automatically on staged files
  before every commit, plus a full `typecheck`.
- **Jest + React Testing Library** cover utility functions, the generic CRUD
  data layer, and key UI components. Add tests under `__tests__` folders
  next to the code they cover.

## Notes on the "static-first" approach

- Image fields accept either a pasted URL or a local file upload (stored as
  a data URL) so every visual editor works before a media/storage API
  exists.
- The blog editor uses a small `contentEditable`-based rich text editor
  (`src/components/domain/RichTextEditor.tsx`) — no external editor
  dependency required. Swap it for something like Tiptap later if needed.
- Brand colors (Appearance page) are applied at runtime as CSS variables
  (`src/lib/theme-runtime.ts`), so changes preview instantly without a
  rebuild — the same mechanism the public site would use once it reads the
  same settings from the API.
