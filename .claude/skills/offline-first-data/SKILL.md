---
name: offline-first-data
description: Offline-first data layer for GuardNG on the Express/MongoDB API — read caching, outbox queue for reports submitted without network, media compression and deferred upload, polling and network-aware UX. Use when touching IncidentContext, report submission, media upload, or any data fetching.
---

# Offline-first data layer (API + MongoDB backend)

Most users are on 2G/3G with intermittent connectivity. The app must be
fully usable offline: a citizen in danger must be able to file a report with
zero bars and have it sync later. The network is an enhancement.

Since the backend is a plain REST API (no Firestore sync), ALL offline
behavior is the client's job. The building blocks:

## 1. Read path: stale-while-revalidate everywhere

- Pattern (already in `IncidentContext`): hydrate state from a
  `localStorage` cache key synchronously on mount → fetch → update state +
  cache. Every new data hook copies this pattern.
- Polling, not websockets: 30s interval + refresh on window focus. Kinder
  to 2G and batteries, survives proxies, and matches how rarely this data
  changes. Pause polling when `document.hidden`.
- Every list endpoint call is bounded (server caps at 200; client asks for
  what the screen needs).
- Move caches from localStorage to IndexedDB (idb-keyval, ~1KB) when
  payloads grow past ~1MB or when media blobs enter the picture.

## 2. Write path: report outbox (guaranteed submission)

For incident reports — the one thing that must never be lost:

- On submit with no network (or on POST failure): write the full report
  (including compressed media Blobs) to IndexedDB via `idb-keyval`, mark it
  `queued`, and show it in "My Reports" immediately with a
  **Pending sync** badge.
- A sync worker (app start, `online` event, Background Sync API where
  available) drains the outbox: POST `/api/media` per blob → POST
  `/api/incidents` with returned media ids → delete outbox entry.
- Exponential backoff on retry; never drop an entry. Server-side dedup:
  send a client-generated `clientRef` so retries can't double-create.
- SOS alerts use the same outbox but also offer immediate `tel:112` as the
  no-data fallback (already in `useSosAlert`).

## 3. Media pipeline

1. Capture via `<input capture="environment">` or Capacitor Camera.
2. Compress on-device first: images → canvas resize to 1280px long edge,
   JPEG q0.7 (target ≤ 200KB); audio → MediaRecorder opus ~24kbps, 60s cap.
3. Store the compressed Blob in the outbox entry.
4. Upload to `POST /api/media` (5MB hard cap server-side) → `{ id }` →
   reference ids in the incident's `media` field. Render via
   `GET /api/media/:id`.

## 4. Auth offline

- JWT lives in localStorage; `AuthContext` restores the session optimistically
  when `/auth/me` is unreachable (offline) and only logs out on a real 401.
  Never log a user out because they're in a dead zone.

## 5. Network-aware UX

- `useNetworkStatus()` + `OfflineBanner` (exists): amber "You're offline —
  reports will be sent when you reconnect."
- Save Data mode: respect `navigator.connection.saveData` / `effectiveType`
  — on 2g/saveData skip news fetch, skip map tiles (list view + "Load map"
  button), defer media upload until wifi (user-overridable).
- Screens render cached data first with skeletons; no full-screen spinners
  blocking on the network.

## Acceptance test

Airplane mode ON → open app (loads from cache) → file a report with a photo
→ see it in My Reports as "Pending sync" → airplane mode OFF → report and
photo appear in MongoDB within 30s without user action.
