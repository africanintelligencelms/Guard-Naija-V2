---
name: guardng-design-system
description: GuardNG mobile design system — colors, typography, spacing, components, and screen patterns extracted from the Figma UI designs. Use whenever building or restyling any screen or component so the app matches the high-fidelity mobile designs.
---

# GuardNG Design System

The target product is a mobile-first Android app (GuardNG) themed on Nigeria's
national green. Every screen must look like a native mobile app, not a
responsive website: single-column layouts, bottom tab navigation, full-width
rounded CTAs, card-based content.

## Design tokens

Define these in `tailwind.config` (build-time Tailwind, NOT the CDN script —
see `performance-low-end` skill):

```js
colors: {
  primary: {
    DEFAULT: '#008751',   // Nigeria green — buttons, active nav, links
    dark:    '#006B40',   // pressed states, headers on dark screens
    light:   '#E6F4EE',   // tinted card backgrounds, chips, success surfaces
  },
  surface:   '#FFFFFF',
  background:'#F7F8FA',   // app background behind cards
  ink: {
    DEFAULT: '#111827',   // headings
    secondary: '#6B7280', // body/secondary text
    faint: '#9CA3AF',     // placeholders, timestamps
  },
  danger:  '#DC2626',     // SOS, critical badges, emergency CTA
  warning: '#F59E0B',     // pending status, medium severity
  info:    '#2563EB',     // verified / in-progress
}
```

- **Radius**: cards `rounded-2xl` (16px), buttons `rounded-xl` (12px), chips
  `rounded-full`, inputs `rounded-xl`.
- **Spacing**: screen padding `px-4` (16px); vertical rhythm `space-y-4`;
  cards `p-4`.
- **Typography**: system font stack (no webfont downloads — low-end devices).
  Screen title `text-xl font-bold`, section header `text-base font-semibold`,
  body `text-sm`, captions/timestamps `text-xs text-ink-faint`.
- **Elevation**: prefer borders (`border border-gray-100`) + `shadow-sm`.
  Never heavy shadows or backdrop-blur (expensive on low-end GPUs).
- **Touch targets**: minimum 44×44px. Bottom nav icons 24px with labels.

## Core components (build once in `components/ui/`)

1. **PrimaryButton** — full-width, `bg-primary text-white rounded-xl h-12
   font-semibold`, pressed state `bg-primary-dark`, loading spinner inline.
   Danger variant (`bg-danger`) for SOS/emergency actions.
2. **BottomNav** — fixed bottom bar, 4–5 tabs per the designs:
   Home, Reports, **Report (center FAB, green circle, elevated)**, Map/Alerts,
   Profile. Active tab = green icon + label; inactive = gray.
3. **AppHeader** — screen title centered or left, back chevron left, optional
   action icon right (notification bell with dot badge).
4. **StatusBadge** — pill chips: Pending (amber tint), Verified (blue tint),
   In Progress (blue), Resolved (green tint), Critical (red tint).
5. **IncidentCard** — left icon/thumbnail, title, 1-line description,
   location row (pin icon + area name), timestamp, StatusBadge top-right.
6. **StatCard** — big number + label + small trend icon (admin dashboard
   grid of 2×2 per designs).
7. **EmptyState** — illustration-light (icon in a tinted circle), heading,
   one line of copy, optional CTA ("No active incidents", "No reports yet").
8. **TextField** — label above, `h-12 rounded-xl border` input, inline error
   text in red below; phone fields prefixed `+234`.
9. **SegmentedTabs** — All / Pending / Resolved filter row (My Reports screen).
10. **ListTile** — settings/profile rows: leading icon in tinted square,
    title, chevron right.

## Screen inventory (from the Figma board)

**Auth & onboarding**
- Splash (green shield logo on white), 3 onboarding slides
  ("Stay Safe. Report Instantly." / "Report Crimes Instantly" /
  "Get Safety Alerts Near You" / "Stay Informed and Protected") with dots +
  green CTA.
- Create Account, Welcome Back (login), Forgot Password, Verify Your Account
  (OTP — 4 to 6 digit boxes).

**Citizen app**
- Home: greeting header ("Welcome back, {name}"), prominent red
  **Report Emergency** banner/button, Recent Reports list, National
  broadcast/news card, Safety Tips carousel cards.
- Start Report: category selector (chips/dropdown), description textarea,
  photo/audio attach buttons, location auto-detected with map preview,
  anonymous toggle, green Submit.
- My Reports: segmented tabs (All/Pending/Resolved), IncidentCard list,
  per-report detail with status timeline.
- Map: full-screen map with incident pins, recenter control, legend.
- Emergency / "How can we help?": hotline tiles (Police 112, etc.) that
  `tel:` dial directly, large SOS button.
- Alerts/Notifications feed; Safety Tips detail; Profile (avatar, edit
  profile, emergency contacts, settings list, logout in red).

**Admin/agency app (same codebase, role-gated)**
- Dashboard: 2×2 StatCards (total reports, resolved, users, response rate),
  line/area trend chart, recent reports list.
- Manage Reports: searchable list, View Report detail (reporter info, media,
  map snippet, status update dropdown, action buttons).
- User Management: user list with avatars, role chips, activate/deactivate.
- Insights: charts (keep lightweight — see performance skill).

## Rules

- Mobile viewport is the only target: max content width `max-w-md mx-auto`,
  design at 360×800. No desktop tables — use card lists everywhere
  (replace the current `AgencyDashboard` desktop table).
- Every async action shows skeleton or spinner; every list has an EmptyState.
- All destructive actions confirm via bottom sheet, not browser `confirm()`.
- Icons: `lucide-react` only, imported individually (tree-shaken).
- Dark-on-light only (no dark mode in v1) — matches designs.
