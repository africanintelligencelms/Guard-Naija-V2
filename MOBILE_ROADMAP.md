# GuardNG — Mobile App Roadmap

Goal: turn GuardNG into a high-fidelity, user-friendly **Android** app
(per the Figma designs) for users on low-end smartphones and limited
networks in Nigeria.

Architecture: React + Vite client (this repo root) talking to an
**Express + MongoDB API** (`server/`), with AI proxied server-side through
**OpenRouter**. The client gets packaged with **Capacitor** into an APK/AAB
(with the PWA as a free fallback).

## Project skills (in `.claude/skills/`)

| Skill | Use when |
|---|---|
| `guardng-design-system` | building/styling any screen or component |
| `screen-builder` | implementing each screen from the Figma designs |
| `offline-first-data` | data fetching, report submission, media, caching |
| `performance-low-end` | adding deps, charts, maps; pre-release checks |
| `api-hardening` | anything in `server/`, auth flows, AI endpoints |
| `android-packaging` | Capacitor setup, native plugins, APK/AAB builds |

## Phases

**Phase 1 — Foundation** ✅ DONE
Build-time Tailwind with design tokens; react-router with lazy route chunks
(admin/agency/report/chat split out of the citizen entry); `components/ui/`
primitives; first-pass mobile citizen screens (Home, My Reports, Start
Report, Map placeholder, Profile) behind a bottom tab shell; offline read
cache; SOS flow with `tel:112` fallback.

**Phase 2 — Backend & security (MongoDB migration)** ✅ DONE
Replaced Firebase entirely with `server/`: Express + Mongoose API with JWT
auth (bcrypt), role-enforced routes (citizen/agency/admin), bounded queries,
anonymous-report identity stripping, GridFS media endpoint (5MB,
image/audio only), audit logs, rate limiting, helmet. AI moved server-side
to OpenRouter (`anthropic/claude-haiku-4.5` with automatic fallbacks);
news is RSS-aggregated from Nigerian outlets and cached in Mongo. Client
data layer rewired to the API with stale-while-revalidate caching and
polling. Dockerfile + seed script included.

**Phase 3 — Citizen screens to design + true offline writes**
Auth flows to design (login/signup/forgot/OTP); Home, Start Report with
compressed media upload + **IndexedDB outbox** (`clientRef` dedup), My
Reports detail w/ status timeline, Map (Leaflet, lazy), Emergency/hotlines,
Alerts, Profile. Remove d3. Service worker (vite-plugin-pwa) for app-shell
precache + Background Sync.

**Phase 4 — Admin/agency screens (lazy chunk)**
Dashboard on server aggregates, Manage Reports (cursor pagination), View
Report with media, User/Agency management — card-based mobile layouts.

**Phase 5 — Android packaging & release**
Capacitor + plugins (geolocation, camera, network), push notifications
(FCM is still the only Android push channel — used standalone, no Firebase
data services), splash/icons, permission explainer sheets, signed AAB +
sideloadable APK. Test profile: Android 6, 1GB RAM, Slow 3G.

## Definition of success

- Report with photo filed in airplane mode syncs automatically on reconnect.
- Citizen home screen interactive ≤ 5s on Slow 3G / 4× CPU throttle.
- Initial citizen bundle ≤ 200KB gzipped; APK ≤ 12MB.
- No citizen can read another citizen's report; agencies can only change status.
- Push alert received for critical incidents in the user's state.
