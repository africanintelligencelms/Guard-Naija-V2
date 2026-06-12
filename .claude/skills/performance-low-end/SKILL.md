---
name: performance-low-end
description: Performance budget and rules for low-end Android devices and 2G/3G networks — bundle size limits, dependency replacements (drop d3/recharts/Tailwind CDN), code splitting, rendering discipline. Use when adding any dependency, building charts/maps, or before any release.
---

# Performance for low-end devices & slow networks

Target device: ~₦60k Android phone, 1–2GB RAM, Android 6–10, on MTN/Glo
3G with data measured in ₦ per MB. Every KB shipped costs the user money.

## Hard budgets (enforce on every PR)

- Initial JS (gzipped) for the citizen home screen: **≤ 200KB**
- Any lazy chunk: ≤ 100KB
- Time-to-interactive on simulated "Slow 3G + 4x CPU throttle": ≤ 5s
- Images: ≤ 200KB each after on-device compression
- Check with `npx vite-bundle-visualizer` after dependency changes.

## Mandatory dependency changes (current state is ~750KB+ of libs)

1. **Tailwind CDN → build-time Tailwind.** `index.html` loads
   `cdn.tailwindcss.com` (the full JIT engine, ~110KB + runtime cost, and
   it requires network at startup — fatal for offline). Install
   `tailwindcss` + `postcss` + `autoprefixer`, move the theme from the
   inline `<script>` into `tailwind.config.js`, ship purged CSS (~10KB).
2. **Drop `d3` entirely.** `IncidentMap.tsx` uses it only for
   `scaleLinear`/`select`/transitions — replace with plain SVG + React and
   two lines of linear interpolation math, or with the real map below.
3. **Drop `recharts` (+ its d3 deps) for citizens.** Citizen screens need at
   most a bar/sparkline — hand-rolled SVG (≤ 50 lines). If admin insists on
   rich charts, lazy-load recharts ONLY inside the admin chunk.
4. **Map**: use **MapLibre GL is too heavy — use Leaflet (~42KB)** with
   OpenStreetMap raster tiles, lazy-loaded only when the Map screen opens.
   Cache tiles via the service worker (cache-first, 7d). On
   `saveData`/2G, default to list view with a "Load map" button.
5. **Firebase**: import modular pieces only (already the case); never import
   `firebase/analytics` or `firebase/storage` into the entry chunk —
   storage loads lazily with the report flow.
6. **lucide-react**: import icons individually
   (`import { Shield } from "lucide-react"` is fine with Vite tree-shaking;
   verify no barrel-file bloat in the bundle report).

## Code splitting map

`React.lazy` + route-level chunks:

- **entry**: app shell, auth, home screen
- **report**: IncidentForm + media compression helpers + storage SDK
- **map**: Leaflet + map screen
- **admin**: all admin/agency dashboards, charts, user management
  (citizens must never download admin code — it's most of today's bundle)
- **chat**: SafetyChat (and it must call a Cloud Function, not bundle a
  Gemini client with an exposed key)

## Rendering discipline

- Lists: virtualize anything > 50 rows; prefer pagination (25/page) over
  virtualization where possible.
- No `backdrop-blur`, no large `box-shadow` animations, no `animate-pulse`
  on many elements simultaneously (current map pulses every High/Critical
  marker — cap at the 10 most recent).
- Memoize list items (`React.memo`) — Firestore snapshots replace the whole
  array each update.
- Skeleton screens over spinners; render cached data first (see
  `offline-first-data` skill).
- Fonts: system stack only. Zero webfont requests.

## Verification before release

```bash
npm run build && npx vite preview
# Lighthouse (mobile, Slow 3G/4x CPU): Performance ≥ 85 on Home
# Check chunk sizes:
ls -la dist/assets/
```

Run Chrome DevTools device emulation "Moto G4 / Slow 3G" as the standard
test profile for every feature.
