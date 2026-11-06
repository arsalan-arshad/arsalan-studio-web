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
| Auth | Auth.js (NextAuth v5) credentials + JWT cookie (web); mobile Bearer access JWTs + rotatable refresh tokens |
| Email | Resend (`RESEND_API_KEY`) from `noreply@arsalandev.studio` — verification + inquiry notify; inquiries always persist |
| Analytics | Free **GA4** via `NEXT_PUBLIC_GA_MEASUREMENT_ID` (script omitted when unset) |
| Host | Railway (`railway.toml`) |

### Schema (Prisma)

- **User** — `CLIENT` \| `ADMIN`, bcrypt `passwordHash`, optional `emailVerified`
- **EmailVerificationToken** — signup verify links (24h)
- **RefreshToken** — opaque mobile/API refresh tokens (sha256 at rest, 30d, rotatable)
- **Inquiry** — public contact submissions
- **Thread** / **Message** — client chat (+ optional attachments); gated until email verified

### Auth model (web vs Bearer)

| Surface | Mechanism | Lifetime |
|---|---|---|
| **Web (browser)** | Auth.js JWT **session cookie** | Unchanged Auth.js defaults (~30d) — kept for UX; no refresh-token dance in the browser |
| **Mobile / API** | Bearer **access** JWT (`Authorization: Bearer …`) | **1 hour** (`expiresIn: 3600`) |
| **Mobile / API** | Opaque **refresh** token (POST body only; never in URLs) | **30 days**; stored hashed; **rotated** on each `/api/auth/refresh` |

Bearer endpoints:

- `POST /api/auth/token` — login → `{ accessToken, refreshToken, expiresIn }` (also `token` alias = access)
- `POST /api/auth/register` — same token shape
- `POST /api/auth/refresh` — `{ refreshToken }` → new access + refresh; old refresh revoked
- `POST /api/auth/logout` — `{ refreshToken }` or `{ all: true }` with session/Bearer

Access verification stays in `auth-helpers` via `verifyMobileToken` (expired access → 401). Refresh tokens are not JWTs; an access JWT submitted as `refreshToken` is rejected.

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
| `AUTH_SECRET` | Auth.js + mobile access-JWT HMAC (refresh tokens are opaque DB rows, not signed with this) |
| `AUTH_URL` | Public site origin |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed admin (`npm run db:seed`) |
| `RESEND_API_KEY` | Send verification + contact notify |
| `EMAIL_FROM` | From address (default `noreply@arsalandev.studio`) |
| `CONTACT_TO_EMAIL` / `CONTACT_NOTIFY_TO` | Inquiry notify recipient |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Free GA4 Measurement ID (`G-…`); omit to disable |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` | Cloudflare R2 private attachments |
| `NEXT_PUBLIC_SITE_URL` | Public URL for links |

### File storage (Cloudflare R2)

1. Cloudflare → **R2** → create bucket (e.g. `arsalan-studio-uploads`) — keep **private**.
2. **Manage R2 API Tokens** → create token with Object Read & Write on that bucket.
3. Set Railway env: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`.
4. Chat **Attach** → `POST /api/uploads` → object key stored on the message; clients receive **signed URLs** (~1h) when loading the thread (not public forever).

### Email verification

1. Signup creates an unverified client and emails a link from `EMAIL_FROM`.
2. Open `/verify-email?token=…` (also works without being logged in).
3. Messages (`/chat` + `/api/threads*`) stay gated until verified. Use **Resend verification** on the chat gate (rate-limited ~60s).
4. Without `RESEND_API_KEY`, the token is still created and the verify URL is logged (local-friendly).

### Analytics (free forever)

1. [Google Analytics](https://analytics.google.com) → create a **GA4** property → Web data stream for `arsalandev.studio`.
2. Copy the Measurement ID (`G-XXXXXXXX`) into Railway / `.env` as `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
3. Redeploy. The site loads gtag only when the env is set; events include `page_view`, `signup`, `contact_submit`.
4. Later: [Google Search Console](https://search.google.com/search-console) for queries/indexing. Optional: PostHog free tier if you want product analytics + mobile later — not required for visit/source reporting.

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
   - `EMAIL_FROM=noreply@arsalandev.studio`
   - `RESEND_API_KEY`, `CONTACT_TO_EMAIL` / `CONTACT_NOTIFY_TO`
   - Optional: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`
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
| Auth | `/login`, `/signup`, `/verify-email` |
| Chat | `/chat` (email verified) |
| Admin | `/admin` (server-gated `role === ADMIN`) |
| SEO | `/sitemap.xml`, `/robots.txt` |

---

## Contributing

Issues and PRs welcome. Branch from `main`, keep changes focused, and ensure `lint` / `typecheck` / `build` pass. See [CONTRIBUTING.md](./CONTRIBUTING.md).
