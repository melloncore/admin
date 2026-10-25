# Mellon Strata Core Admin

Admin dashboard for the Mellon Strata Core company portfolio website. Built with
**Next.js (App Router)**, **TypeScript**, and **Tailwind CSS**.

Admin authentication, profile/password changes, analytics, inbound project
inquiries, blog publishing, editorial content, settings, and admin-managed
operations records use the backend API.
Use `.env` for local development and `.env.production` for production builds.
In local development, API calls use the same-origin `/api/v1` path and are
proxied to `http://localhost:4000` by default (override with `BACKEND_URL` if
the backend uses another port). Set `BACKEND_URL` in the production file; API
calls are proxied by `next.config.mjs`. Configure backend CORS to allow the
browser origin of the admin app.
The local admin runs at `http://localhost:3001`; it shares localhost cookies
with the client and marketplace running on ports 3000 and 3002.

## Getting started

```bash
npm install
npm run dev
```

Visit `http://localhost:3001`. You'll be redirected to `/login`.

Use `/signup` only for the initial administrator bootstrap. Once the first
administrator exists, further accounts must be created through the backend
invite flow. No demo credentials or browser-stored passwords are provided.

## What's included

| Area         | Route                                   | Capability                                                                      |
| ------------ | --------------------------------------- | ------------------------------------------------------------------------------- |
| Dashboard    | `/dashboard`                            | Traffic snapshot, new leads, unread messages, top clicks                        |
| Analytics    | `/analytics`                            | Visitors/page views over time, click tracking, cookie-consent breakdown         |
| Hero         | `/hero`                                 | Edit headline, subheadline, CTAs, hero image                                    |
| Services     | `/services`                             | Full CRUD on services, including nested engagement models                       |
| About        | `/about`                                | Company description + CRUD on values and stats/percentages                      |
| Team         | `/team`                                 | CRUD on team member cards                                                       |
| Testimonials | `/testimonials`                         | CRUD on client testimonials                                                     |
| Blog         | `/blog`                                 | Create, edit, publish, and delete backend-backed posts; upload 1–3 images       |
| Availability | `/calendar`                             | Weekly hours + blocked dates for booking                                        |
| Messages     | `/messages`                             | Conversation and message records stored through the backend API                 |
| Contact      | `/contact`                              | CRUD on email/phone/address channels + response time                            |
| Leads        | `/leads`                                | List + detail view of inbound project inquiries                                 |
| Footer       | `/footer`                               | Logo, description, socials, company/services/contact link lists, copyright year |
| Appearance   | `/appearance`                           | Primary/secondary/tertiary brand color editor with live preview                 |
| Account      | `/settings`                             | Profile + change password                                                       |
| Auth         | `/login`, `/signup`, `/forgot-password` | Backend cookie authentication; first-admin bootstrap; password changes          |

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
    api/                 Backend API clients and local editorial data adapters
    mock/                Seed data
    utils/               cn, id/slug, date, storage helpers
  types/                 Shared TypeScript types for every domain
```

## Backend API integration

Editorial collections and settings use the authenticated backend endpoints in
`/api/v1/admin/content` and `/api/v1/admin/settings`. Content is persisted in
PostgreSQL and shared across authorized admin sessions. Existing localStorage
collection/settings values are imported on first read when they are not already
present in the backend; demo collection seeds are not automatically uploaded.

`src/lib/api/operations.ts` also exposes typed clients for the backend's
books, role clarity, daily-task, decision, target, and team endpoints. The
existing legacy tracker screens retain their current fields and use separate
backend content collections rather than being mapped onto the semantically
different operations models.

The Leads screen reads and updates inquiries submitted through the portfolio
contact form. The Analytics screen reads consented client and marketplace page
views/clicks from the backend. Account login uses HTTP-only backend cookies and
should be served from an origin allowed by the backend's `CLIENT_URL`.
Invite, staff-profile, and onboarding-review endpoints are available through
`src/lib/api/invites.ts` and `src/lib/api/staff.ts`; dedicated admin pages for
those workflows are not part of the current dashboard.

Blog posts are persisted in PostgreSQL and published posts are available to the
client portfolio. Configure the three Cloudinary credentials in the backend
environment to enable file uploads. Each post requires 1–3 JPEG, PNG, WebP, or
AVIF images (maximum 5 MB each) with alternative text. The backend sanitizes
article HTML before saving it.

All backend clients live under `src/lib/api/`, with shared request handling in
`http.ts` and domain modules alongside it. React Query manages API query and
mutation state. Editorial content is not yet consumed by the public client
website; it is persisted and accessible to authenticated admin clients.

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

## Notes on content and messaging

- Other image fields accept either a pasted URL or a local file upload (stored
  as a data URL); blog images are uploaded to Cloudinary instead.
- Message and conversation records persist in the admin content API. The client
  website currently has no chat widget or public message-submission endpoint.
- The blog editor uses a small `contentEditable`-based rich text editor
  (`src/components/domain/RichTextEditor.tsx`) and a separate Cloudinary-backed
  image manager, limiting each post to three uploaded images.
- Brand colors (Appearance page) are applied at runtime as CSS variables
  (`src/lib/theme-runtime.ts`), so changes preview instantly without a
  rebuild — the same mechanism the public site would use once it reads the
  same settings from the API.
