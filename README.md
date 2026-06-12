# GuardNG — Citizen Security Reporting for Nigeria

Mobile-first app for reporting security incidents, tracking responses, and
receiving safety alerts. React + Vite client, Express + MongoDB API.

## Architecture

```
[React PWA / Capacitor Android]  ──HTTP/JSON──>  [Express API]  ──>  [MongoDB]
        (this repo root)                          (server/)          (Atlas or self-hosted)
                                                      │
                                                      └──> OpenRouter (AI analysis & safety chat, server-side key)
```

## Run locally

**Prerequisites:** Node.js 20+, a MongoDB instance (local `mongod` or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster).

1. **API server**
   ```bash
   cd server
   npm install
   cp .env.example .env       # set MONGODB_URI, JWT_SECRET (and OPENROUTER_API_KEY for AI)
   npm run seed               # creates the first admin (ADMIN_EMAIL/ADMIN_PASSWORD in .env)
   npm run dev                # http://localhost:4000
   ```
2. **Client**
   ```bash
   npm install
   npm run dev                # http://localhost:3000 — /api is proxied to :4000
   ```

## Deploy

- **API**: any Node host (Render, Railway, Fly.io, a VPS) — `server/Dockerfile`
  is provided. Set `MONGODB_URI`, `JWT_SECRET`, `OPENROUTER_API_KEY`,
  `CORS_ORIGIN`.
- **Client**: `npm run build` → static `dist/` for any static host/CDN.
  Set `VITE_API_URL` at build time to the deployed API origin + `/api`.

## Project guides

See `MOBILE_ROADMAP.md` for the phased plan and `.claude/skills/` for the
design system, offline-first rules, performance budgets, API security
conventions, and Android packaging guide.
