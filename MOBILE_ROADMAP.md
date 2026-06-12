# GuardNG — Mobile App Roadmap

Goal: turn the current React/Vite/Firebase **web** app into a high-fidelity,
user-friendly **Android** app (per the Figma designs) for users on low-end
smartphones and limited networks in Nigeria.

Strategy: keep the React + Firebase codebase, restructure it screen-by-screen
to the mobile designs, make it offline-first, and package with **Capacitor**
into an APK/AAB (with the PWA as a free fallback). No rewrite.

## Current state (audit summary)

**Works**: role-based auth (citizen/agency/admin), real-time incidents via
Firestore, report form with GPS, SOS flow, admin/agency dashboards, Gemini
AI categorization + news.

**Must fix**:
1. Media upload is broken — only filenames are saved, files never reach Storage.
2. Firestore rules let any authenticated user read/update/delete ALL incidents.
3. Gemini API key ships in the client bundle (`VITE_GEMINI_API_KEY`).
4. Zero offline capability; Tailwind loads from CDN (app won't even style offline).
5. ~750KB+ of JS (d3 + recharts + firebase) on a single unsplit bundle.
6. Desktop-website layout (hero sections, tables) — not the mobile designs.
7. Cloud Functions folder is an empty helloWorld; stats counted client-side
   over full collection downloads.

## Project skills (in `.claude/skills/`)

| Skill | Use when |
|---|---|
| `guardng-design-system` | building/styling any screen or component |
| `screen-builder` | implementing each screen from the Figma designs |
| `offline-first-data` | anything touching Firestore reads/writes, reports, media |
| `performance-low-end` | adding deps, charts, maps; pre-release checks |
| `firebase-hardening` | rules, Cloud Functions, Gemini proxy, FCM alerts |
| `android-packaging` | Capacitor setup, native plugins, APK/AAB builds |

## Phases

**Phase 1 — Foundation (unblocks everything)**
Build-time Tailwind with design tokens; react-router with lazy route chunks;
`components/ui/` primitives (BottomNav, PrimaryButton, IncidentCard,
StatusBadge, TextField, EmptyState…); Firestore offline persistence.

**Phase 2 — Security & backend**
New Firestore/Storage rules; Cloud Functions (`analyzeIncident`, `safetyChat`,
`onIncidentWrite` stats/audit/public-feed, `refreshNews`, `onCriticalIncident`
FCM); revoke + rotate the exposed Gemini key.

**Phase 3 — Citizen screens to design**
Auth flows (login/signup/forgot/OTP), Home, Start Report (with real
compressed media upload + outbox), My Reports, Map (Leaflet, lazy),
Emergency/hotlines, Alerts, Profile. Remove d3.

**Phase 4 — Admin/agency screens (lazy chunk)**
Dashboard with `stats/global`, Manage Reports (paginated), View Report,
User/Agency management — all card-based mobile layouts.

**Phase 5 — Android packaging & release**
Capacitor + plugins (geolocation, camera, push, network), splash/icons,
permission explainer sheets, signed AAB for Play Store + sideloadable APK,
PWA manifest + service worker. Test profile: Android 6, 1GB RAM, Slow 3G.

## Definition of success

- Report with photo filed in airplane mode syncs automatically on reconnect.
- Citizen home screen interactive ≤ 5s on Slow 3G / 4× CPU throttle.
- Initial citizen bundle ≤ 200KB gzipped; APK ≤ 12MB.
- No citizen can read another citizen's report; agencies can only change status.
- Push alert received for critical incidents in the user's state.
