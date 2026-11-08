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
| Auth | Auth.js (NextAuth v5) credentials + optional Google OAuth; JWT cookie (web); mobile Bearer access JWTs + rotatable refresh tokens |
| Email | Resend (`RESEND_API_KEY`) from `noreply@arsalandev.studio` — verification, password reset, inquiry notify |
| Analytics | Free **GA4** via `NEXT_PUBLIC_GA_MEASUREMENT_ID` (script omitted when unset) |
| Host | Railway (`railway.toml`) |

### Schema (Prisma)

- **User** — `CLIENT` \| `ADMIN`, optional bcrypt `passwordHash` (null for Google-only), optional `emailVerified`
- **Account** — Auth.js OAuth link rows (Google `provider` + `providerAccountId`)
- **EmailVerificationToken** — signup verify links (24h; soft-consumed via `usedAt` for idempotent retries)
- **PasswordResetToken** — forgot-password links (1h)
- **AuthBootstrapToken** — one-time web sign-in after verify (no password in the link)
- **RefreshToken** — opaque mobile/API refresh tokens (sha256 at rest, 30d, rotatable)
- **Inquiry** — public contact submissions
- **Thread** / **Message** — client chat (+ optional attachments); gated until email verified

### Messages architecture (why one table)

Chat is **multi-tenant by thread**, not by physical table:

- **Thread** is the isolation boundary (`clientId`). Clients only load `where: { clientId: user.id }`; admins see all threads.
- **Message** rows always carry `threadId` (+ `senderId`). Every message API loads the thread first and **rejects** if the caller is not the thread’s client (or ADMIN).
- Indexes: `(threadId, createdAt)`, `(threadId, id)`, `(senderId)`, and Thread `(clientId, updatedAt)`.

**Do not** create one message table per user — that breaks Prisma models, analytics, admin inbox, migrations, and foreign keys. Schema-per-tenant is for huge SaaS; for this marketplace, a single `Message` table scoped by thread membership is the correct design. Per-user “separation” is a **query/authorization** concern, already enforced in `/api/threads*`.

### Auth model (web vs Bearer)

| Surface | Mechanism | Lifetime |
|---|---|---|
| **Web (browser)** | Auth.js JWT **session cookie** (credentials and/or Google) | Unchanged Auth.js defaults (~30d) |
| **Mobile / API** | Bearer **access** JWT (`Authorization: Bearer …`) | **1 hour** (`expiresIn: 3600`) |
| **Mobile / API** | Opaque **refresh** token (POST body only; never in URLs) | **30 days**; stored hashed; **rotated** on each `/api/auth/refresh` |

Bearer endpoints:

- `POST /api/auth/token` — login → `{ accessToken, refreshToken, expiresIn }` (also `token` alias = access)
- `POST /api/auth/register` — same token shape
- `POST /api/auth/refresh` — `{ refreshToken }` → new access + refresh; old refresh revoked
- `POST /api/auth/logout` — `{ refreshToken }` or `{ all: true }` with session/Bearer
- `POST /api/auth/forgot-password` — email reset link (no enumeration)
- `POST /api/auth/reset-password` — `{ token, password }` with strong-password rules

Access verification stays in `auth-helpers` via `verifyMobileToken` (expired access → 401). Refresh tokens are not JWTs; an access JWT submitted as `refreshToken` is rejected.

**Passwords** (signup, reset, any future change-password): min **10** chars, upper + lower + number + special — shared Zod helper in `src/lib/password.ts`. Rules are shown in the UI.

**Google (web):** set `AUTH_GOOGLE_ID` + `AUTH_GOOGLE_SECRET`. Same Google email links to an existing User (`allowDangerousEmailAccountLinking`) **only when Google’s profile `email_verified` is `true`**. Unverified Google emails are rejected (redirect to `/login?error=GoogleEmailNotVerified`) — we do not create or sign in that user as verified. When verified, we set `User.emailVerified` and allow access. Mobile does **not** implement Google OAuth yet; use email/password on mobile, or Google on the web.

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
| `AUTH_URL` | Public site origin (must match production URL for OAuth + email links) |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | Optional Google OAuth (web) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seed admin (`npm run db:seed`) |
| `RESEND_API_KEY` | Send verification, password reset, contact notify |
| `EMAIL_FROM` | From address (default `noreply@arsalandev.studio`) |
| `CONTACT_TO_EMAIL` / `CONTACT_NOTIFY_TO` | Inquiry notify recipient |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Free GA4 Measurement ID (`G-…`); omit to disable |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` | Cloudflare R2 private attachments |
| `NEXT_PUBLIC_SITE_URL` | Public URL for links in emails |

### Google OAuth setup (web)

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → **Credentials** → Create **OAuth 2.0 Client ID** (Web application).
2. **Authorized JavaScript origins:** `https://arsalandev.studio` (and Railway URL if still in use).
3. **Authorized redirect URIs:** `https://arsalandev.studio/api/auth/callback/google` (same host as `AUTH_URL`).
4. Copy Client ID → Railway `AUTH_GOOGLE_ID`; Client secret → `AUTH_GOOGLE_SECRET`.
5. Redeploy. Login/signup show **Continue with Google** when both vars are set.
6. Sign-in is allowed only if Google reports `email_verified: true` on the profile; otherwise the user sees a clear error on `/login`.

### File storage (Cloudflare R2)

1. Cloudflare → **R2** → create bucket (e.g. `arsalan-studio-uploads`) — keep **private**.
2. **Manage R2 API Tokens** → create token with Object Read & Write on that bucket.
3. Set Railway env: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`.
4. Chat **Attach** → `POST /api/uploads` → object key stored on the message; clients receive **signed URLs** (~1h) when loading the thread (images/PDFs preview inline; **Download** always available).

### Email verification

1. Signup creates an unverified client and emails a link from `EMAIL_FROM`.
2. Open `/verify-email?token=…` (works logged out). Successful verify is **idempotent** (soft-consumed token + single client attempt), issues a short bootstrap sign-in token, creates a session, and refreshes JWT so `emailVerified` / `isEmailVerified` is true.
3. Messages (`/chat` + `/api/threads*`) stay gated until verified. Use **Resend verification** on the chat gate (rate-limited ~60s).
4. Keep `AUTH_URL` and `NEXT_PUBLIC_SITE_URL` aligned with the live origin so links and OAuth callbacks match.
5. Without `RESEND_API_KEY`, the token is still created and the verify URL is logged (local-friendly).

### Forgot password

1. `/forgot-password` → `POST /api/auth/forgot-password` → email from `noreply@arsalandev.studio`.
2. `/reset-password?token=…` → `POST /api/auth/reset-password` with strong password rules.
3. Google-only accounts (no `passwordHash`) do not receive a reset email (same generic success response).

### Admin users & invites

1. `/admin/users` (ADMIN only) lists name, email, role, `emailVerified`, createdAt.
2. **Invite:** admin enters name + email (+ optional role, default `CLIENT`) → `POST /api/admin/users` creates a user with **no password**, issues a **7-day** `PasswordResetToken` (`purpose=INVITE`), emails `/set-password?token=…` from `noreply@arsalandev.studio`.
3. Invitee sets a strong password → `emailVerified` is set (token proves inbox ownership) → log in.
4. **Delete:** `DELETE /api/admin/users/:id` with confirm UI. Cleans threads/messages and cascades tokens/accounts. Blocks deleting yourself or the last admin.

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
   - Optional Google: `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`
   - R2: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`
4. Deploy. `railway.toml` runs `prisma generate` on build and `prisma migrate deploy` on start.
5. After first deploy: open the Railway URL, then seed admin if not auto-run:
   - Locally against prod DB only if needed, or use Railway shell: `npm run db:seed`
6. **Later (DNS ready):** Railway → Custom Domain → `arsalandev.studio`, then update `AUTH_URL` and `NEXT_PUBLIC_SITE_URL`, and Google OAuth redirect URIs.

Mobile production should point `EXPO_PUBLIC_API_URL` at the Railway URL (then the custom domain).

---

## Key routes

| Surface | Path |
|---|---|
| Contact | `/contact` → `POST /api/contact` |
| Auth | `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/set-password`, `/verify-email` |
| Chat | `/chat` (email verified) |
| Admin | `/admin`, `/admin/users` (server-gated `role === ADMIN`) |
| SEO | `/sitemap.xml`, `/robots.txt` |

---

## Contributing

Issues and PRs welcome. Branch from `main`, keep changes focused, and ensure `lint` / `typecheck` / `build` pass. See [CONTRIBUTING.md](./CONTRIBUTING.md).
