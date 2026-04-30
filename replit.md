# Workspace

## Overview

Harare Burst Pipe Reporter — a mobile (Expo) app that lets Harare residents
report burst pipes with GPS tagging, photo evidence, and offline drafts. The
app also exposes a municipal dashboard for triaging tickets and a feed of
area service notices. All persistence is on-device (AsyncStorage) — no
backend is required.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Mobile**: Expo (`artifacts/mobile`) — Expo Router file-based routing,
  `@react-native-async-storage/async-storage` for persistence,
  `expo-location` for GPS, `expo-image-picker` for photo capture,
  `react-native-keyboard-controller` for keyboard handling.
- **Shared code (unused for this app)**: API spec / DB libs ship with the
  workspace but are not currently wired in — the app is offline-first.

## Mobile app structure (`artifacts/mobile`)

- `app/_layout.tsx` — providers (SafeArea, ErrorBoundary, QueryClient,
  AuthProvider, ReportsProvider, GestureHandler, Keyboard) and root
  Stack with the `(auth)` group, `(tabs)` group, and `report/[id]`
  modal screen. `<AuthGate>` redirects unauthenticated users to
  `/(auth)/welcome` and authenticated users out of the auth group.
- `app/(auth)/_layout.tsx` — auth Stack (no header).
- `app/(auth)/welcome.tsx` — role picker (Resident vs Municipality)
  with gradient hero and demo-account hint card.
- `app/(auth)/sign-in.tsx` / `sign-up.tsx` — resident auth (email,
  password, optional phone + suburb).
- `app/(auth)/staff-sign-in.tsx` / `staff-sign-up.tsx` — municipality
  staff auth, sign-up gated by access code `HARARE-WATER-2026`.
- `app/(tabs)/_layout.tsx` — role-gated tabs. Residents see
  Home · Report · Notices · Account. Staff see Queue · Notices · Account.
  Hidden tabs use `href: null` (classic) and `hidden: true` (native).
- `app/(tabs)/index.tsx` — Home: greeting, hero CTA, stats, nearby
  active incidents (haversine), and the signed-in resident's tickets
  (matched on `user.name`). Includes anonymous-submission toggle.
- `app/(tabs)/report.tsx` — New report form. Uses the signed-in
  resident's name as reporter (or "Anonymous" via toggle). GPS
  capture, manual address, photo, severity, draft save/load.
- `app/(tabs)/notices.tsx` — Filterable list of municipal notices.
- `app/(tabs)/admin.tsx` — Municipal dashboard: greets staff by first
  name, KPI tiles, status filter, triaged ticket queue, sample-data
  reset.
- `app/(tabs)/account.tsx` — Profile hero (gradient + initials avatar
  + role pill), personal stats, editable profile (name, phone, suburb
  for residents; department for staff), reset sample data, sign-out.
- `app/report/[id].tsx` — Ticket detail with status timeline and
  controls for advancing repair status.
- `context/AuthContext.tsx` — AsyncStorage-backed user store with
  Resident + Staff roles, sign-in / sign-up / sign-out / updateProfile.
  Seeds two demo accounts: `tendai@example.com` (resident) and
  `chipo@harare.gov.zw` (staff). Password for both: `password`.
- `context/ReportsContext.tsx` — AsyncStorage-backed store for reports,
  drafts, notices. Seeds sample incidents and notices on first launch.
- `components/` — `ReportCard`, `NoticeCard`, `StatusBadge`,
  `SeverityBadge`, `StatusTimeline`, `MapPreviewCard`, `EmptyState`,
  `PrimaryButton`, `SectionHeader`, `AuthScaffold` (gradient hero +
  back button for auth screens), `AuthField` (focusable bordered
  input with optional eye toggle).
- `lib/format.ts` — id/ticket generation, relative time, haversine
  distance, status/severity labels.
- `constants/colors.ts` — water-inspired civic palette
  (primary `#0369a1`, deep `#075985`, accent aqua `#06b6d4`) plus
  `heroGradient` (typed as a 3-tuple for `expo-linear-gradient`),
  `softShadow()` helper for cross-platform soft shadows, and the
  `useColors()` hook consumes it.

## UI design notes

- Home, Admin, and Notices screens use `expo-linear-gradient` headers
  built from `colors.heroGradient` / `[primaryDeep, primary, accent]`.
  When inlining the array, cast it `as const` so TS picks the tuple
  overload required by `LinearGradient.colors`.
- Report detail and the new-report form embed the `MapPreviewCard`
  (gradient grid + pulsing center pin) for a map-style location preview
  without pulling in a real map SDK.
- Web top inset uses `Math.max(insets.top, 67)` to clear the Replit
  preview chrome; bottom tab area is ~84px on web.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

Use the `restart_workflow` tool to restart the mobile dev server — do not
shell out to `pnpm dev`.

See the `pnpm-workspace` skill for workspace structure, and the `expo`
skill for mobile-specific guidance.
