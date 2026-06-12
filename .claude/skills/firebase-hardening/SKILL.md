---
name: firebase-hardening
description: Firebase security and backend rules for GuardNG — Firestore/Storage rules with role enforcement, Cloud Functions for Gemini proxying and stats aggregation, FCM alerts, region/latency choices. Use when touching firestore.rules, storage.rules, functions/, or anything involving Gemini API keys or push notifications.
---

# Firebase hardening & backend

Safety-critical app: reports may identify users to hostile actors, and the
data can be life-or-death. Current rules are dangerously permissive and the
Gemini key ships in the client bundle. Fix pattern by pattern below.

## Firestore rules (replace current permissive set)

Current bug: **any authenticated user can read, update, and delete ALL
incidents** — a malicious actor could harvest reporter identities or erase
evidence. Required model:

```
function role() { return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role; }
function isAdmin()  { return role() == 'admin'; }
function isAgency() { return role() == 'agency'; }

match /users/{uid} {
  allow read: if request.auth.uid == uid || isAdmin();
  allow create: if request.auth.uid == uid
                && request.resource.data.role == 'citizen';   // self-signup is citizen-only
  allow update: if (request.auth.uid == uid
                    && request.resource.data.role == resource.data.role) // can't self-promote
                || isAdmin();
  allow delete: if isAdmin();
}

match /incidents/{id} {
  allow create: if request.auth != null
                && request.resource.data.userId == request.auth.uid
                && request.resource.data.keys().hasAll(['type','description','location','severity','timestamp','status'])
                && request.resource.data.status == 'Submitted'
                && request.resource.data.description.size() <= 5000;
  allow read:   if isAdmin() || isAgency()
                || resource.data.userId == request.auth.uid;
  allow update: if isAdmin()
                || (isAgency() && request.resource.data.diff(resource.data)
                      .affectedKeys().hasOnly(['status']));    // agencies: status only
  allow delete: if isAdmin();
}

match /logs/{id}    { allow read: if isAdmin(); allow write: if false; } // functions only
match /stats/{id}   { allow read: if request.auth != null; allow write: if false; }
match /newsCache/{id}{ allow read: if request.auth != null; allow write: if false; }
```

Anonymous reports: keep `userId` on the doc for outbox/dedup but expose an
`isAnonymous` flag; agency/admin UIs must hide reporter identity when set,
and a Cloud Function-backed "public feed" copy strips `userId` entirely.

## Storage rules

```
match /incidents/{incidentId}/{file} {
  allow write: if request.auth != null
               && request.resource.size < 5 * 1024 * 1024
               && (request.resource.contentType.matches('image/.*')
                   || request.resource.contentType.matches('audio/.*'));
  allow read: if request.auth != null;  // tighten to role-based once feed is public-copy based
}
```

## Cloud Functions (functions/ is currently an empty helloWorld)

Implement in `functions/src/`, region **`europe-west1`** (closest stable
full-feature region to Nigeria; also move Firestore from `nam5` for new
projects — existing DB location can't change, note this in the roadmap):

1. **`analyzeIncident`** (callable): proxies Gemini for incident
   auto-categorization. The `VITE_GEMINI_API_KEY` currently in the client
   bundle must be revoked and replaced with a server-side secret
   (`firebase functions:secrets:set GEMINI_API_KEY`). Same for SafetyChat —
   a `safetyChat` callable with the system prompt server-side.
2. **`onIncidentWrite`** (Firestore trigger): maintains `stats/global`
   counters (total/active/critical/resolved) so dashboards read one doc
   instead of whole collections; appends audit log entries; strips
   `userId` into `publicFeed/{id}` for the community feed.
3. **`onCriticalIncident`** (trigger): when severity == Critical or SOS,
   send FCM to topic `alerts-{stateCode}` (geo-bucketed by report state) and
   notify agency users. Citizens subscribe to their state's topic —
   this is the "Get Safety Alerts Near You" feature from the designs.
4. **`refreshNews`** (scheduled, every 6h): runs the Gemini
   news-with-search query once, writes to `newsCache/latest`. Clients read
   the cache — zero per-user Gemini cost, works with rules above.
5. **`cleanupOrphanMedia`** (scheduled daily): delete Storage files with no
   matching incident doc.

## Operational rules

- App Check (Play Integrity on Android, reCAPTCHA v3 web) on Firestore,
  Storage, and Functions once packaging is done.
- Never log PII in Cloud Functions logs (no phone numbers, no precise
  coordinates in plaintext logs).
- `firebase deploy --only firestore:rules,storage` after every rules edit;
  test with the emulator suite (`firebase emulators:start`) and rules unit
  tests in `functions/test/rules.test.ts`.
- Keys/secrets: nothing secret in `VITE_*` vars — they are public by
  definition. Firebase web config is fine to ship; Gemini key is not.
