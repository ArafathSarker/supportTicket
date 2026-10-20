# Support Ticket System

A reusable, drop-in **support-ticket component** for any project:

- **Backend** — a single pluggable Django app `support_ticket/` (tickets with
  S3-compatible attachments, visiting logs, dynamic dropdowns, WebSocket chat).
  Decoupled from the host project: user/role/company are resolved through
  configurable hooks.
- **Frontend** — a single self-contained module `src/support-ticket/`
  (React + Tailwind 4). One barrel export, one `<SupportProvider>` for
  endpoints/auth/branding, ready-made pages + à-la-carte components.

This repository ships a runnable **demo** (IoT support scenario) around the
component: Django `accounts` app as the demo auth provider, a Vite host app,
Docker Compose, and demo seed data.

## Quick start (Docker Compose)

The complete demo runs with PostgreSQL, Django, and Vite only. It does not
use Redis or Nginx.

```bash
docker compose up --build
```

This automatically:

1. Starts PostgreSQL and waits for it to become healthy.
2. Runs Django migrations and demo seed data.
3. Starts the Django API and WebSocket server.
4. Starts the Vite frontend with API and WebSocket proxying.

- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- PostgreSQL: localhost:5432

Copy [backend/.env.example](/home/arafath/supportTicket/backend/.env.example)
to `backend/.env` when you need custom values. Compose values can also be
provided in a root `.env` file.

For manual PostgreSQL schema initialization outside Django, use:

```bash
npm install
npm run db:init
```

The script uses the idempotent query object in
[`scripts/schema.mjs`](/home/arafath/supportTicket/scripts/schema.mjs).

Demo identities (created by `seed_demo`):

| user | role | company |
|---|---|---|
| `superadmin` | super_admin | (all companies) |
| `alpha_admin` | company_admin | Alpha IoT Farms |
| `greenleaf_admin` | company_admin | GreenLeaf Cold Chain |

The demo has no login screen and no credential authentication. It defaults to
the seeded `superadmin` identity. To exercise company-admin behavior from an
API client, send `X-Demo-User: alpha_admin` (or `greenleaf_admin`) on requests;
WebSocket clients use `?user=alpha_admin`.

# Reusing the component in another project

## Backend: single Django app

1. **Copy** `backend/support_ticket/` into any Django project (the folder is
   dependency-complete: models, serializers, views, URLs, admin, storage,
   Channels middleware/routing — no imports from the demo `accounts` app).

2. **Configure** in `settings.py`:

   ```python
   INSTALLED_APPS = [..., 'support_ticket']

   SUPPORT_TICKET = {
       # Company/org model of the host project ('<app>.<Model>')
       'COMPANY_MODEL': 'myapp.Organization',
       # (user) -> 'super_admin' | 'company_admin' | ''
       'ROLE_RESOLVER': 'myapp.support.resolve_role',
       # (user) -> the company instance the user belongs to, or None
       'COMPANY_RESOLVER': 'myapp.support.resolve_company',
       # optional: custom serializer for the companies dropdown
       # 'COMPANY_SERIALIZER': 'myapp.serializers.CompanySerializer',
       'PAGE_SIZE': 10,
   }
   # Required by the support-ticket migration (use your own company model).
   SUPPORT_TICKET_COMPANY_MODEL = 'myapp.Organization'
   ```

   Defaults work without any host hooks: Django superusers are `super_admin`,
   everyone else `company_admin` (with no company until a resolver is set).

3. **Mount** the routes and ASGI app:

   ```python
   # urls.py
   path('api/', include('support_ticket.urls')),

   # asgi.py
   from support_ticket.routing import websocket_urlpatterns
   from support_ticket.middleware import DemoUserMiddlewareStack

   application = ProtocolTypeRouter({
       'http': django_http_app,
       'websocket': DemoUserMiddlewareStack(URLRouter(websocket_urlpatterns)),
   })
   ```

4. **Storage** — attachments go to local `/media` by default. To store them in
   an S3-compatible bucket (Supabase, AWS, MinIO…):

   ```python
   SUPPORT_TICKET.update({
       'S3_ENDPOINT_URL': 'https://<ref>.supabase.co/storage/v1/s3',
       'S3_ACCESS_KEY_ID': '...',
       'S3_SECRET_ACCESS_KEY': '...',
       'S3_REGION': 'auto',
       'S3_BUCKET': 'tickets',
   })
   STORAGES = {'default': {'BACKEND': 'support_ticket.storage.SupportS3Storage'}}
   ```

5. **Migrate** — `python manage.py makemigrations support_ticket && python manage.py migrate`
   (migrations live inside the app; added keys become options in `/api/options/`).

REST endpoints (relative to the mount point, all JWT-authenticated):

```
GET/POST tickets/                     role-scoped (?status=&urgency=&priority=&search=&company=)
GET/PATCH tickets/<id>/               status change = super admin
GET/POST tickets/<id>/messages/       chat history / send message
GET/POST tickets/<id>/attachments/    attachment list / upload
GET/POST visiting-logs/               role-scoped; POST = super admin acknowledgement
GET/PATCH/DELETE visiting-logs/<id>/
GET  options/                         dynamic dropdown values grouped by key
GET  companies/                       company dropdown (role-scoped)
WS   /ws/tickets/<id>/chat/?token=<jwt>
```

Dynamic dropdowns (affected systems, problem categories, work-performed
checklist): rows of `DynamicOption` in Django admin — the frontend picks them
up with no redeploy.

## Frontend: one folder

1. **Copy** `frontend/src/support-ticket/` into any React (≥18) + Tailwind 4
   project. Everything — api client, types, hooks, screens, UI primitives,
   brand CSS — is inside the folder; the only imports from outside are
   `react`, `react-router-dom`, `lucide-react` and Tailwind itself.

2. **Import the styles once** (or override the `--color-brand-*` tokens):

   ```css
   @import 'tailwindcss';
   @import './support-ticket/styles.css';
   ```

3. **Wire it** (auth/branding/routing all come from the host):

   ```tsx
   import { SupportProvider, SupportRoutes } from '@/support-ticket'

   <SupportProvider config={{
     apiBase: '/api',                       // REST base (default '/api')
     wsBase: 'wss://host',                  // WebSocket origin for chat
     user: { id: 2, username: 'acme', role: 'company_admin', companyName: 'Acme' },
     getAuthHeaders: () => ({ Authorization: `Bearer ${token}` }),
     getAccessToken: () => token,           // for the WebSocket ?token= auth
     onUnauthorized: () => redirectToLogin(),
     onLogout: () => clearSession(),
     loginPath: '/login',
     basePath: '',                          // set when mounted under a prefix
     branding: { title: 'My Support' },
   }}>
     <SupportRoutes />    // place inside your <Routes>, e.g. <Route path="/support/*" element={<SupportRoutes/>} />
   </SupportProvider>
   ```

   Screens are also exported à la carte: `TicketsPage`, `TicketDetailPage`,
   `VisitingLogPage`, `VisitingReportPage` (takes the `role` prop), `TicketForm`,
   `TicketList`, `TicketDetail`, `TicketChat`, `useOptions`, the API objects and
   hooks, plus the `ui` primitives (`Button`, `Input`, `Select`, `FileDrop`,
   `Pagination`, `Badge`, `Card`, `Loading`, `Empty`…).

## Demo-only files (safe to ignore)

```
backend/accounts/      # demo auth (JWT login) + hook resolvers feeding the component
backend/config/        # demo project settings/urls/asgi
frontend/src/auth/     # demo login screen + session store
frontend/src/lib/      # demo session storage
frontend/src/app/      # demo app shell (Router + SupportProvider wiring)
seed_demo              # demo users/companies + option values
```

> Add your Supabase S3-compatible key set (`SUPABASE_S3_*`) to `.env` to switch
> ticket attachments from local `/media` storage to the S3 bucket automatically.
