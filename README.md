# IoT Support Ticket System

IoT-based support system: companies raise support tickets for their deployed IoT
systems, the super-admin acknowledges them with on-site visiting logs, and both
sides can chat live about a ticket.

- **Backend** — Django 6 + DRF + Django Channels (WebSocket chat), JWT auth,
  PostgreSQL in production, S3-compatible storage via Supabase.
- **Frontend** — Vite + React 19 + Tailwind CSS 4, modular feature-folder
  architecture, paginated lists everywhere.

## Quick start (local dev)

Two terminals:

```bash
# 1. Backend — http://localhost:8000
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requrements.txt
python manage.py migrate
python manage.py seed_demo          # demo users + dynamic dropdown options
uvicorn config.asgi:application --port 8000   # HTTP + WebSocket in one server

# 2. Frontend — http://localhost:5173 (proxies /api and /ws to :8000)
cd frontend
npm install
npm run dev
```

Demo accounts (created by `seed_demo`):

| user | role | company |
|---|---|---|
| `superadmin` / `SuperAdmin#123` | super_admin | (all companies) |
| `alpha_admin` / `CompanyAdmin#123` | company_admin | Alpha IoT Farms |
| `greenleaf_admin` / `CompanyAdmin#123` | company_admin | GreenLeaf Cold Chain |

## Quick start (Docker)

```bash
cp .env.example .env    # optional: add Supabase S3 keys for real file storage
docker compose up --build
```

- Frontend → http://localhost:5173 (nginx proxies `/api` + `/ws` to the backend)
- Backend → http://localhost:8000 (Postgres + Redis come up as companions)

> Add your Supabase S3-compatible key set (`SUPABASE_S3_*`) to `.env` to switch
> ticket attachments from local `/media` storage to the S3 bucket automatically.

## Screens / routes

| Route | Who | What |
|---|---|---|
| `/login` | – | JWT login (role + company resolved) |
| `/tickets` | both | Paginated ticket list w/ filters; company admins create tickets here (title, dynamic affected system & category dropdowns, urgency/priority, description, image/video upload) |
| `/tickets/:id` | both | Ticket detail, attachments, status control (super admin), **live chat** |
| `/visiting-log` | super admin | Acknowledgement: company, visiting date, persons, phones, reason, dynamic work-performed checklist |
| `/visiting-report` | both | Visiting reports; the `role` prop from auth session distinguishes super-admin vs company view |

## Frontend architecture (modular)

```
frontend/src/
├── main.tsx, App.tsx
├── app/               # router composition (AppRoutes)
├── lib/               # api client (auth, refresh, errors), config, pagination
├── types/             # shared types (auth/user)
├── components/
│   ├── ui/            # Button, Field/Input/Select/Textarea, Badge, Card,
│   │                  # Pagination, FileDrop, Status loaders
│   └── layout/        # AppLayout (nav), RequireAuth, RequireRole
└── features/
    ├── auth/          # api, hooks (useAuth), LoginPage
    ├── options/       # dynamic dropdown loader (/api/options/)
    ├── tickets/       # api.ts, hooks.ts, types.ts
    │   ├── components/ # TicketForm, TicketList, TicketCard, TicketDetail
    │   └── pages/      # TicketsPage, TicketDetailPage
    ├── visits/        # api.ts, hooks.ts, types.ts, constants.ts
    │   ├── components/ # VisitingLogForm, VisitingReportList (role prop)
    │   └── pages/      # VisitingLogPage, VisitingReportPage
    └── chat/          # WebSocket hook (useTicketChat), TicketChat
```

Rules of the architecture:

- `components/ui` never imports from `features/*` (pure presentational).
- Each feature owns its API client, types, hooks, components and pages behind an
  `index.ts` barrel — cross-feature imports go through the barrel.
- Pagination: server-side via DRF `PageNumberPagination` (`?page=`), with the
  shared `Pagination` component in `components/ui`.
- Dynamic dropdowns (systems, categories, work-performed checklist) come from
  the backend `DynamicOption` table — add a row in Django admin or `seed_demo`
  and the frontend picks it up, no redeploy.

## Backend architecture

```
backend/
├── config/        # settings (env-driven: sqlite↔postgres, memory↔redis, media↔s3),
│                  # urls, asgi (HTTP → Django, WS → Channels)
├── accounts/      # Company, Profile(role), JWT auth, /me, companies list
├── core/          # DynamicOption (config for dropdowns), Supabase S3 storage
├── tickets/       # Ticket, TicketAttachment (S3), TicketMessage; viewsets+filters
├── visits/        # VisitingLog (acknowledgement), role-aware API
└── chat/          # JWT-auth middleware, TicketChatConsumer, ws routing
```

REST endpoints (all JWT, `Authorization: Bearer <access>`):

```
POST  /api/accounts/auth/token/          # login → access/refresh + user(role)
GET   /api/accounts/me/                  # current user + role
GET   /api/accounts/companies/           # company dropdown (visiting log)
GET   /api/options/                      # dynamic dropdown values by key
GET   /api/tickets/?page=&status=&search=# role-scoped (company vs all)
POST  /api/tickets/                      # multipart ok (file + file_type)
GET   /api/tickets/<id>/
PATCH /api/tickets/<id>/                 # status change (super admin)
GET   /api/tickets/<id>/messages/        # chat history
GET   /api/tickets/<id>/attachments/     # attachment list (S3 URLs)
GET   /api/visiting-logs/?page=&company= # role-scoped
POST  /api/visiting-logs/                # super admin only
WS    /ws/tickets/<id>/chat/?token=<jwt> # live chat (Channels)
```

Roles: `super_admin` (sees everything, updates status, creates visiting logs)
and `company_admin` (own company's tickets only). A Django superuser is treated
as super_admin.

## Creating dynamic dropdown values

Django admin (`/admin/`, superadmin is staff) → **Dynamic options**:

- key `system` – affected systems
- key `category` – problem categories
- key `work_performed` – work-performed checklist items

`seed_demo` preloads sensible IoT defaults; add more rows any time — the
frontend dropdowns/checklists update instantly.
