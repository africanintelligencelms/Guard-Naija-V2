---
name: screen-builder
description: Step-by-step recipe for implementing a GuardNG mobile screen from the Figma designs — routing, file layout, data wiring, and a definition-of-done checklist. Use every time a new screen is built or an existing web screen is converted to the mobile design.
---

# Building a GuardNG screen

Follow this recipe for every screen so the app converges on the mobile
designs instead of accumulating one-off layouts. Read
`guardng-design-system` for visual specs first.

## File & routing conventions

- Screens live in `screens/<area>/<ScreenName>.tsx`
  (`screens/citizen/Home.tsx`, `screens/auth/Login.tsx`,
  `screens/admin/ManageReports.tsx`). Shared UI in `components/ui/`.
- Routing: the app currently has ad-hoc `useState` view switching in
  `App.tsx`. Use **react-router v7 with `createBrowserRouter` + lazy route
  modules** — it's small, enables the code-splitting map in
  `performance-low-end`, and gives Android back-button support for free
  inside Capacitor (WebView history). Route groups:
  - `/auth/*` — no chrome
  - `/` citizen shell — `BottomNav` + `AppHeader`
  - `/admin/*`, `/agency/*` — role-guarded shells
- Role guard: a `<RequireRole role="admin">` wrapper reading `useAuth()`;
  redirect to `/` (not an error page) on mismatch.

## Recipe

1. **Identify the screen in the Figma board** (screen inventory is in
   `guardng-design-system`) and list its states: loading (skeleton), empty,
   populated, error, offline.
2. **Compose from `components/ui/` primitives.** If a primitive is missing,
   add it to `components/ui/` — never style one-off buttons/cards inline.
3. **Wire data through a hook**, not inline Firestore calls:
   `hooks/useMyReports.ts`, `hooks/useStats.ts`, etc. Hooks own the query
   (`limit()`, cursors), expose `{ data, isLoading, error, isOffline }`,
   and follow `offline-first-data` rules (cache-first, bounded reads).
4. **Build mobile-only**: wrap in the shell's `max-w-md mx-auto pb-20`
   (padding for BottomNav), 16px side padding, touch targets ≥ 44px.
5. **Hook up navigation**: back chevron pops history; Android hardware back
   must behave identically (router history handles this).
6. **Lazy-register the route** in the correct chunk (see code-splitting map
   in `performance-low-end`).

## Definition of done (check all before calling a screen complete)

- [ ] Matches design tokens (colors, radius, spacing, typography) — no raw
      hex values outside `tailwind.config`.
- [ ] All five states implemented (loading/empty/populated/error/offline);
      offline shows cached data + banner, never a dead spinner.
- [ ] Works at 360×640 (small) and 412×915 without horizontal scroll.
- [ ] No new dependency added without checking bundle budget.
- [ ] Reads are bounded (`limit`/pagination); writes go through the outbox
      if they must survive offline.
- [ ] Interactive elements have visible pressed state and ≥ 44px target.
- [ ] Text is plain language (many users have basic English literacy);
      critical actions also use icons + color.
- [ ] Tested in Chrome DevTools "Moto G4 / Slow 3G" profile.
- [ ] `npm run build` passes and the screen lands in the intended chunk.

## Conversion order for existing web components

When converting current components, this is the mapping:

| Current | Becomes |
|---|---|
| `AuthScreen.tsx` (774 lines, 5 modes) | `screens/auth/{Login,Signup,ForgotPassword,VerifyOtp}.tsx` |
| `App.tsx` hero + `Dashboard.tsx` | `screens/citizen/Home.tsx` per design (greeting, emergency CTA, recent reports, safety tips) |
| `IncidentForm.tsx` | `screens/citizen/StartReport.tsx` (+ outbox + real media upload) |
| `Dashboard` "My Reports" section | `screens/citizen/MyReports.tsx` with All/Pending/Resolved tabs |
| `IncidentMap.tsx` (d3) | `screens/citizen/MapView.tsx` (Leaflet, lazy) |
| SOS modal in `App.tsx` | `screens/citizen/Emergency.tsx` (hotlines + SOS, `tel:` links) |
| `AdminDashboard*.tsx` | `screens/admin/*` (lazy admin chunk) |
| `SafetyChat.tsx` | floating sheet, calls `safetyChat` Cloud Function |
