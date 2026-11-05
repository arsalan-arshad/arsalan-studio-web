# Arsalan Studio — Web

Personal **brand marketplace** for [Arsalan Arshad](https://github.com/arsalan-arshad): clients inquire and chat; he is the sole worker. Conversion-led offers, case studies, and daily collaboration.

| | |
|---|---|
| **Brand** | Arsalan Arshad |
| **Domain** | [`arsalandev.studio`](https://arsalandev.studio) (custom DNS later; launch on Railway-generated URL first) |
| **Companion app** | [`arsalan-studio-mobile`](https://github.com/arsalan-arshad/arsalan-studio-mobile) (`studio.arsalan.app`) |
| **License** | [MIT](./LICENSE) |

Open source PRs are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript + Tailwind v4 |
| API | Route Handlers under `src/app/api/*` |
| DB | PostgreSQL + Prisma 6 |
| Auth | Auth.js (NextAuth v5) credentials + JWT; mobile Bearer JWTs signed with `AUTH_SECRET` |
| Email | Optional Resend (`RESEND_API_KEY`); inquiries always persist |
| Host | Railway (`railway.toml`) |

### Schema (Prisma)

- **User** — `CLIENT` \| `ADMIN`, bcrypt `passwordHash`
- **Inquiry** — public contact submissions
- **Thread** / **Message** — client chat (+ optional attachments)

---

## Local setup

### 1. Postgres

```bash
docker compose up -d
# DATABASE_URL=postgresql://portfolio:portfolio@localhost:5432/portfolio?schema=public
```

### 2. App

```bash
cp .env.example .env
# set AUTH_SECRET: openssl rand -base64 32
npm install
npx prisma migrate deploy
npm run db:seed          # ADMIN from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev              # http://localhost:3000
```

Checks:

```bash
npm run lint
npm run typecheck
npm run build
```

---

## Environment

See [`.env.example`](./.env.example). Never commit `.env`.

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection |
| `AUTH_SECRET` | Auth.js + mobile JWT HMAC |
| `AUTH_URL` | Public site origin |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed admin (`npm run db:seed`) |
| `CONTACT_TO_EMAIL` / `RESEND_API_KEY` | Optional notify |
| `UPLOAD_DIR` | Attachment storage root |
| `NEXT_PUBLIC_SITE_URL` | Public URL for links |

---

## Deploy on Railway (generated domain first)

Do **not** wait on custom DNS. Use Railway’s `*.up.railway.app` URL first; add `arsalandev.studio` later when DNS propagates.

1. [Railway](https://railway.app) → **New Project** → **Deploy from GitHub** → select **`arsalan-studio-web`** (repo root is the app; no subdirectory).
2. Add **PostgreSQL** → link it so `DATABASE_URL` is available on the web service.
3. Set variables on the web service:
   - `AUTH_SECRET` (long random)
   - `AUTH_URL` = `https://YOUR-SERVICE.up.railway.app`
   - `NEXT_PUBLIC_SITE_URL` = same as `AUTH_URL` for now
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`
   - Optional: `RESEND_API_KEY`, `CONTACT_*`, volume at `/data/uploads` + `UPLOAD_DIR=/data/uploads`
4. Deploy. `railway.toml` runs `prisma generate` on build and `prisma migrate deploy` on start.
5. After first deploy: open the Railway URL, then seed admin if not auto-run:
   - Locally against prod DB only if needed, or use Railway shell: `npm run db:seed`
6. **Later (DNS ready):** Railway → Custom Domain → `arsalandev.studio`, then update `AUTH_URL` and `NEXT_PUBLIC_SITE_URL`.

Mobile production should point `EXPO_PUBLIC_API_URL` at the Railway URL (then the custom domain).

---

## Key routes

| Surface | Path |
|---|---|
| Contact | `/contact` → `POST /api/contact` |
| Auth | `/login`, `/signup` |
| Chat | `/chat` |
| Admin | `/admin` (server-gated `role === ADMIN`) |

---

## Contributing

Issues and PRs welcome. Branch from `main`, keep changes focused, and ensure `lint` / `typecheck` / `build` pass. See [CONTRIBUTING.md](./CONTRIBUTING.md).
