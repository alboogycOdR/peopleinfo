# Person Info Portal — Supabase + Vercel Deploy Guide

Resume guide for deploying this app to Supabase (database) and Vercel (hosting).

## Current state (as of pause)

- App code complete; tests passing locally.
- `vercel.json`, `api/index.ts` (serverless entry), and `drizzle/0000_high_beast.sql` migration are committed.
- `.env.example` exists; **no `.env`** file yet.
- Git: only the initial commit `2b34989` on `main`. **No remote configured, nothing pushed to GitHub.**
- Supabase project: not yet created (or status unknown — verify in dashboard).
- Vercel project: not yet created.
- Migration: not yet applied to any database.

## Required env vars

| Name | Where it goes | Notes |
|---|---|---|
| `DATABASE_URL` | local `.env` + Vercel | **Supabase pooled** URI, port 6543 |
| `ADMIN_PASSWORD` | local `.env` + Vercel | Password for `/admin` login |
| `JWT_SECRET` | local `.env` + Vercel | Long random string; signs session cookies |
| `PORT` | local `.env` only (optional) | Defaults to 3000 |

---

## Step 1 — Supabase

1. https://supabase.com → sign in → **New project**.
   - Generate a strong DB password and **save it**.
   - Pick a region close to where Vercel will deploy.
2. Wait ~2 min for provisioning.
3. Get the **pooled** connection string:
   - Project → **Settings** → **Database** → **Connection string**
   - Tab: **Transaction** (port **6543**, *not* 5432)
   - Copy the URI; replace `[YOUR-PASSWORD]` with your saved password.
   - Format: `postgresql://postgres.PROJECTREF:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres`

## Step 2 — Local `.env` and migration

From the project root:

1. `cp .env.example .env`
2. Fill in:
   - `DATABASE_URL` — pooled URI from step 1
   - `ADMIN_PASSWORD` — your choice
   - `JWT_SECRET` — long random string (e.g. `openssl rand -hex 32`)
3. Apply the schema to Supabase:
   ```
   pnpm db:push
   ```
   This runs `drizzle-kit generate && drizzle-kit migrate` and creates `person_records` and `users`. Verify in Supabase → **Table Editor**.
4. Smoke-test locally:
   ```
   pnpm dev
   ```
   - Submit the public form at `http://localhost:3000`
   - Log into `/admin` with `ADMIN_PASSWORD`
   - Confirm the row appears in the dashboard and in Supabase Table Editor

## Step 3 — Push to GitHub

```
git remote add origin https://github.com/<you>/person-info-portal.git
git branch -M main
git push -u origin main
```

Before pushing, confirm `.env` is gitignored — only `.env.example` should be in the repo.

## Step 4 — Vercel

1. https://vercel.com → **Add New** → **Project** → import the GitHub repo.
2. Framework preset: **Other** (`vercel.json` drives the build).
3. Build settings (leave defaults unless noted):
   - Build command: `vite build`
   - Output dir: `dist/public`
   - Install command: `pnpm install` (set this if not auto-detected)
4. **Environment Variables** — add for **Production** (and Preview if desired):
   - `DATABASE_URL`
   - `ADMIN_PASSWORD`
   - `JWT_SECRET`
5. **Deploy**.
6. Verify on the live URL:
   - Public form submit succeeds
   - `/admin` login works
   - Submitted row appears in Supabase Table Editor

---

## Gotchas

- **Pooled URL is mandatory** for Vercel. Serverless functions will exhaust Supabase's pool on direct port-5432 connections (`too many connections` errors). The `.env.example` comment calls this out.
- **`api/index.ts` is the only function entry.** `vercel.json` rewrites every `/api/*` request to it. Don't add other files under `api/` unless you intend to create new functions.
- **`JWT_SECRET` must match** between local and production; changing it invalidates existing admin sessions.
- If Vercel build fails with a pnpm version mismatch, add `"engines": { "pnpm": ">=10" }` to `package.json` or set `ENABLE_EXPERIMENTAL_COREPACK=1` in Vercel env vars.

## Resume checklist

- [ ] Supabase project created
- [ ] Pooled `DATABASE_URL` saved
- [ ] Local `.env` filled in
- [ ] `pnpm db:push` succeeded; tables visible in Supabase
- [ ] Local smoke test passed
- [ ] GitHub repo created and `git push` done
- [ ] Vercel project imported
- [ ] Vercel env vars set
- [ ] Vercel deploy green
- [ ] Production smoke test passed
