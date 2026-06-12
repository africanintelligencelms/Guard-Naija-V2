---
name: offline-first-data
description: Offline-first data layer for GuardNG — Firestore offline persistence, outbox queue for reports submitted without network, media compression and deferred upload, and network-aware UX. Use when touching IncidentContext, report submission, media upload, or anything that reads/writes Firestore.
---

# Offline-first data layer

Most users are on 2G/3G with intermittent connectivity. The app must be
fully usable offline: a citizen in danger must be able to file a report with
zero bars and have it sync later. Treat the network as an enhancement.

## 1. Firestore offline persistence (do this first)

In `services/firebase.ts`, replace `getFirestore(app)` with:

```ts
import { initializeFirestore, persistentLocalCache,
         persistentSingleTabManager } from "firebase/firestore";

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager({}),
  }),
});
```

This gives cached reads + queued writes for free. All `onSnapshot` listeners
then serve cached data instantly and update when online.

## 2. Report outbox (guaranteed submission)

Firestore's write queue dies with the page. For incident reports — the one
thing that must never be lost — add an explicit outbox:

- On submit: write the full report (including compressed media as Blobs) to
  IndexedDB (`idb-keyval` is ~1KB, use it), mark it `queued`, show the report
  in "My Reports" immediately with a **Pending sync** badge.
- A sync worker (run on app start, on `online` event, and via Background Sync
  API where available) drains the outbox: upload media to Storage → write
  Firestore doc with download URLs → delete outbox entry.
- Retries with exponential backoff; never drop an entry on failure.
- SOS alerts go through the same outbox but also attempt an immediate
  `tel:112` prompt so the user has a non-data fallback.

## 3. Media handling (currently broken — fix as part of this)

`IncidentForm.tsx` today stores only **filenames**, never uploads files.
Correct pipeline:

1. Capture via `<input capture="environment">` or Capacitor Camera.
2. Compress on-device before anything else:
   - Images: canvas resize to max 1280px long edge, JPEG quality 0.7
     (target ≤ 200KB). Use `browser-image-compression` or a 30-line canvas
     helper — do not ship a heavy lib.
   - Audio: record with `MediaRecorder` in `audio/webm;codecs=opus` at
     ~24kbps, cap 60s.
3. Store compressed Blob in the outbox entry.
4. Upload with `uploadBytesResumable` to
   `incidents/{incidentId}/{type}-{ts}` and store the download URL on the
   incident doc. Resumable = survives flaky connections.

## 4. Read-path frugality

- **Never** fetch unbounded collections. Every query gets `limit()`:
  citizen home feed `limit(20)`, admin tables paginate with
  `startAfter` cursors (25/page).
- Citizen reads: own reports (`where userId ==`) + a public, pre-aggregated
  feed. Do NOT stream the whole `incidents` collection to citizens.
- Aggregate stats (counts for dashboards) come from a single
  `stats/global` doc maintained by a Cloud Function trigger — not from
  counting client-side over a full collection download (current
  `IncidentContext.stats` does this; replace it).
- News/AI calls (Gemini) are cached in Firestore by a scheduled Cloud
  Function; clients read the cached doc. Clients never call Gemini directly
  on a metered connection (also fixes the exposed-API-key problem).

## 5. Network-aware UX

- Global `useNetworkStatus()` hook (`navigator.onLine` + `online/offline`
  events + Capacitor Network plugin when wrapped). Show a slim amber
  "You're offline — reports will be sent when you reconnect" banner.
- Save Data mode: respect `navigator.connection.saveData` and
  `effectiveType` — when `2g`/`slow-2g` or saveData, skip news fetch,
  skip map tiles (show list view), and defer media upload until wifi
  (user-overridable).
- Every screen renders meaningfully from cache with skeletons — no
  full-screen spinners that block on the network.

## Acceptance test

Airplane mode ON → open app (loads from cache) → file a report with a photo
→ see it in My Reports as "Pending sync" → airplane mode OFF → report and
photo appear in Firestore within 30s without user action.
