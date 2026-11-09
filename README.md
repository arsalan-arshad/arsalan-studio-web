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

- **User** — `CLIENT` \| `ADMIN` \| `SUB_ADMIN`, optional bcrypt `passwordHash` (null for Google-only), optional `emailVerified`
- **Account** — Auth.js OAuth link rows (Google `provider` + `providerAccountId`)
- **EmailVerificationToken** — signup verify links (24h; soft-consumed via `usedAt` for idempotent retries)
- **PasswordResetToken** — forgot-password / invite set-password links
- **AuthBootstrapToken** — one-time web sign-in after verify (no password in the link)
- **RefreshToken** — opaque mobile/API refresh tokens (sha256 at rest, 30d, rotatable)
- **Inquiry** — public contact submissions
- **Thread** / **Message** — client chat (+ optional attachments); bodies encrypted at rest when `CHAT_ENCRYPTION_SECRET` is set

### Role matrix

| Capability | CLIENT | SUB_ADMIN (Support) | ADMIN |
|---|---|---|---|
| Own client chat threads / messages | ✅ | ❌ | ✅ (all clients) |
| Decrypt chat message bodies (API) | ✅ (own) | ❌ | ✅ |
| Contact inquiries inbox (`/admin`) | ❌ | ✅ | ✅ |
| Invite users | ❌ | CLIENT + SUB_ADMIN | CLIENT + SUB_ADMIN + ADMIN |
| Delete users | ❌ | ❌ | ✅ |
| Change own password (`/admin/settings`) | ❌ | ✅ | ✅ |
| `/admin` desk | ❌ | Inquiries home | Threads + inquiries |

### Messages architecture (why one table)

Chat is **multi-tenant by thread**, not by physical table:

- **Thread** is the isolation boundary (`clientId`). Clients only load `where: { clientId: user.id }`; **ADMIN** sees all threads; **SUB_ADMIN** is denied all `/api/threads*` and `/api/uploads`.
- **Message** rows always carry `threadId` (+ `senderId`). Every message API loads the thread first and **rejects** if the caller is not the thread’s client (or ADMIN).
- Indexes: `(threadId, createdAt)`, `(threadId, id)`, `(senderId)`, and Thread `(clientId, updatedAt)`.

**Do not** create one message table per user — that breaks Prisma models, analytics, admin inbox, migrations, and foreign keys. Schema-per-tenant is for huge SaaS; for this marketplace, a single `Message` table scoped by thread membership is the correct design. Per-user “separation” is a **query/authorization** concern, already enforced in `/api/threads*`.

### Chat encryption (at rest — honesty)

This is **encrypted at rest for authorized participants**, not true zero-knowledge E2E:

- On write, message `body` (and optionally `attachmentName`) are sealed with **AES-256-GCM** using a key derived from `CHAT_ENCRYPTION_SECRET`, a random 12-byte IV per field (`bodyNonce` / `attachmentNameNonce`), and `bodyVersion` / `attachmentNameVersion` = `1`.
- Ciphertext lives in Postgres. A DB dump without the secret does not yield plaintext.
- On read, only **authorized** thread APIs decrypt (thread client or **ADMIN**). **SUB_ADMIN never decrypts or lists client chat.**
- The **server can read** messages whenever it holds `CHAT_ENCRYPTION_SECRET` — required so ADMIN can support clients in `/chat`. True client-only E2E would block that.
- Attachments remain **private R2 objects** with short-lived signed URLs; filenames may be encrypted the same way as bodies.
- Legacy plaintext rows (`bodyVersion = 0`) are **lazy-migrated** on thread GET when the secret is set. Batch migrate anytime with `npm run db:encrypt-messages`.
- Without `CHAT_ENCRYPTION_SECRET`, new messages stay plaintext (`bodyVersion = 0`) for local convenience — **set it on Railway before production chat**.

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
# set AUTH_SECRET and CHAT_ENCRYPTION_SECRET: openssl rand -base64 32
npm install
npx prisma migrate deploy
npm run db:seed          # ADMIN from ADMIN_EMAIL / ADMIN_PASSWORD
# optional: npm run db:encrypt-messages  # seal legacy plaintext after setting CHAT_ENCRYPTION_SECRET
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
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Optional GA4 Measurement ID (`G-…`). **Omit / leave empty** until you create a real ID — do not invent one; gtag is not loaded when unset |
| `R2_ACCOUNT_ID` / `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` / `R2_BUCKET_NAME` | Cloudflare R2 private attachments |
| `CHAT_ENCRYPTION_SECRET` | AES-256-GCM key material for message bodies at rest (`openssl rand -base64 32`) |
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

### Admin / support desk

1. `/admin` — **ADMIN**: threads + inquiries. **SUB_ADMIN**: inquiries inbox only (no chat).
2. `/admin/users` — staff can list users. **Invite** roles: ADMIN → any; SUB_ADMIN → `CLIENT` | `SUB_ADMIN` only. **Delete** is ADMIN-only.
3. Invite creates a user with **no password**, 7-day `PasswordResetToken` (`purpose=INVITE`), email `/set-password?token=…`.
4. `/admin/settings` — staff change **own** password (`PATCH /api/admin/password`, strong rules + current password).
5. Header: Admin/Support + Users/Invite shortcuts when signed in as staff.

### Analytics (GA4 — optional, env-gated)

**Default:** leave `NEXT_PUBLIC_GA_MEASUREMENT_ID` unset. No Measurement ID is baked into the repo; inventing a placeholder ID would send traffic nowhere and is not supported.

When you want visit/source reporting:

1. [Google Analytics](https://analytics.google.com) → create a **GA4** property → **Admin → Data streams → Web** for `arsalandev.studio`.
2. Copy the real Measurement ID (`G-…`) into Railway / `.env.local` as `NEXT_PUBLIC_GA_MEASUREMENT_ID`.
3. Redeploy. `GoogleAnalytics` + `lib/analytics` load gtag **only** when that env is non-empty; events include `page_view`, `signup`, `contact_submit`.
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
   - **`CHAT_ENCRYPTION_SECRET`** (`openssl rand -base64 32`) — required for encrypted chat at rest
4. Deploy. `railway.toml` runs `prisma generate` on build and `prisma migrate deploy` on start.
5. Optional after deploy: `npm run db:encrypt-messages` against prod DB to seal any legacy plaintext rows (lazy migrate also runs on thread open).
6. After first deploy: open the Railway URL, then seed admin if not auto-run:
   - Locally against prod DB only if needed, or use Railway shell: `npm run db:seed`
7. **Later (DNS ready):** Railway → Custom Domain → `arsalandev.studio`, then update `AUTH_URL` and `NEXT_PUBLIC_SITE_URL`, and Google OAuth redirect URIs.

Mobile production should point `EXPO_PUBLIC_API_URL` at the Railway URL (then the custom domain).

---

## Key routes

| Surface | Path |
|---|---|
| Contact | `/contact` → `POST /api/contact` |
| Auth | `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/set-password`, `/verify-email` |
| Chat | `/chat` (email verified) |
| Admin / Support | `/admin`, `/admin/users`, `/admin/settings` (gated `ADMIN` \| `SUB_ADMIN`) |
| SEO | `/sitemap.xml`, `/robots.txt`, JSON-LD Person/Organization, `/llms.txt` |
| Notifications | Header bell + `/notifications` (SSE `/api/notifications/stream`) |
| Chat live | Thread SSE `/api/threads/[id]/stream` (CLIENT / ADMIN; not SUB_ADMIN) |

---

## Contributing

Issues and PRs welcome. Branch from `main`, keep changes focused, and ensure `lint` / `typecheck` / `build` pass. See [CONTRIBUTING.md](./CONTRIBUTING.md).
