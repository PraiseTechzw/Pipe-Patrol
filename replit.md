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
  ReportsProvider, GestureHandler, Keyboard) and root Stack with the
  `report/[id]` modal screen.
- `app/(tabs)/_layout.tsx` — 4-tab native/classic layout
  (Home · Report · Notices · Admin).
- `app/(tabs)/index.tsx` — Home: greeting, hero CTA, stats, nearby active
  incidents (haversine distance from current location), and the user's
  submitted tickets.
- `app/(tabs)/report.tsx` — New report form with GPS capture, manual
  address entry, photo attachment, severity selection, draft save/load,
  and a success state with the generated ticket id.
- `app/(tabs)/notices.tsx` — Filterable list of municipal notices
  (disruption / maintenance / restoration).
- `app/(tabs)/admin.tsx` — Municipal dashboard: KPI tiles, status filter,
  triaged ticket queue, sample-data reset.
- `app/report/[id].tsx` — Ticket detail with status timeline and
  controls for advancing repair status.
- `context/ReportsContext.tsx` — AsyncStorage-backed store for reports,
  drafts, notices, and reporter profile. Seeds sample incidents and
  notices on first launch.
- `components/` — `ReportCard`, `NoticeCard`, `StatusBadge`,
  `SeverityBadge`, `StatusTimeline`, `EmptyState`, `PrimaryButton`,
  `SectionHeader`.
- `lib/format.ts` — id/ticket generation, relative time, haversine
  distance, status/severity labels.
- `constants/colors.ts` — deep teal-blue municipal palette consumed via
  the `useColors()` hook.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

Use the `restart_workflow` tool to restart the mobile dev server — do not
shell out to `pnpm dev`.

See the `pnpm-workspace` skill for workspace structure, and the `expo`
skill for mobile-specific guidance.
