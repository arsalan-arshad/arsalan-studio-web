# Contributing

Thanks for helping improve Arsalan Studio (web).

## How to contribute

1. Fork the repo and create a branch from `main`.
2. Keep changes focused (one concern per PR).
3. Do not commit `.env`, secrets, `uploads/`, or local DB files.
4. Run checks before opening a PR:

```bash
npm run lint
npm run typecheck
npm run build
```

5. Open a PR against `main`. Branch protection requires a PR (and CI once checks are green).

## Local tips

- Use `docker compose up -d` for Postgres.
- Copy `.env.example` → `.env` and set `AUTH_SECRET`.
- Seed admin with `npm run db:seed` after migrations.

## Code of conduct

Be respectful. This is a personal brand / marketplace project — keep UI and copy consistent with the existing Prussian/slate-teal direction unless the PR is intentionally redesigning.
