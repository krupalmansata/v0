# English + Arabic I18N / RTL Rollout Plan

This file is the execution checklist for adding JSON-based English and Arabic support with RTL, while preserving the current GUI quality, spacing, and responsiveness.

## Rules For Implementation

- [ ] Keep the current layout quality on desktop, tablet, and mobile while introducing `dir="rtl"` behavior.
- [ ] Use JSON dictionaries only for translatable copy.
- [ ] Do not hardcode visible English strings after the rollout starts.
- [ ] Prefer logical alignment and spacing over one-off RTL hacks.
- [ ] Validate every phase in both English and Arabic before moving forward.
- [ ] Keep icon direction, table alignment, drawers, dialogs, and toast placement correct for both LTR and RTL.

## Phase 0 - Foundation And Dictionary Setup

- [x] Create `messages/en.json` with all initial English keys.
- [x] Create `messages/ar.json` with all initial Arabic keys.
- [x] Create locale helper layer such as `lib/i18n.ts` or `lib/locale.ts` for dictionary loading, locale typing, and `dir` resolution.
- [x] Create a locale provider such as `components/locale-provider.tsx` or equivalent to expose current language and direction to the app.
- [x] Update `components/providers.tsx` to mount the locale provider alongside existing providers.
- [x] Update `app/[locale]/layout.tsx` to control `html lang`, `dir`, metadata text, and Arabic-capable font handling.
- [x] Update `app/[locale]/page.tsx` so the root redirect can remain locale-aware if language preference is introduced.
- [x] Update `app/globals.css` with shared RTL rules, logical spacing helpers, and safe overrides for mirrored layouts.
- [x] Review `lib/auth-context.tsx` for default business/user locale storage and default seeded strings such as business name and invoice footer.

## Phase 1 - Shared Shell And Reusable UI

- [x] Update `components/app-sidebar.tsx` for localized nav labels, business fallbacks, preview CTA text, and RTL sidebar docking/border behavior.
- [x] Update `components/mobile-nav.tsx` for localized labels, sheet direction, footer CTA, and screen-reader copy.
- [x] Update `components/top-header.tsx` for localized menu labels, notification labels, dropdown alignment, and RTL-safe header actions.
- [x] Update `components/page-header.tsx` so page titles and action areas stay aligned correctly in LTR and RTL.
- [x] Update `components/status-badge.tsx` so all status labels come from dictionaries instead of hardcoded English.
- [x] Update `components/ui/dialog.tsx` for RTL-safe title alignment, close-button placement, and content direction.
- [x] Update `components/ui/sheet.tsx` for side switching, border placement, close-button placement, and open/close animation direction.
- [x] Update `components/ui/dropdown-menu.tsx` for icon padding, submenu chevrons, menu alignment, and RTL spacing.
- [x] Update `components/ui/select.tsx` for trigger alignment, chevron placement, option padding, and RTL dropdown behavior.
- [x] Update `components/ui/sonner.tsx` so the active direction and localized styling flow into toast rendering.
- [x] Update `components/ui/toast.tsx` for RTL viewport placement, swipe direction, and close-button alignment.
- [x] Update `components/ui/toaster.tsx` to ensure localized titles and descriptions render consistently.
- [x] Review `components/ui/use-toast.ts` and `hooks/use-toast.ts` together so the app does not keep duplicate toast behavior during localization work.

## Phase 2 - Auth And Entry Surface

- [x] Update `app/[locale]/login/page.tsx` for all sign-in copy, auth errors, marketing bullets, button text, loading text, and two-column RTL behavior.

## Phase 3 - Dashboard Shell And Core Admin Pages

- [x] Update `app/(dashboard)/layout.tsx` for RTL content offset, sidebar relationship, and toast position handling.
- [x] Update `app/(dashboard)/dashboard/page.tsx` for stat titles, section titles, descriptions, empty/loading states, CTA labels, fallback text, and mirrored directional icons.
- [x] Update `app/(dashboard)/bookings/page.tsx` for filter labels, dialog text, action labels, toast messages, request metadata, and RTL action stacking.
- [x] Update `app/(dashboard)/jobs/page.tsx` for search placeholder, filter labels, empty states, fallback values, search icon placement, and RTL list layout.
- [x] Update `app/(dashboard)/jobs/[id]/page.tsx` for status stepper labels, detail cards, dialog/select content, toast messages, schedule phrasing, fallback labels, and proof/notes sections.
- [x] Update `app/(dashboard)/jobs/new/page.tsx` for full form copy, service type labels, validation/toast text, preview card labels, and RTL form/preview layout.
- [x] Update `app/(dashboard)/staff/page.tsx` for form labels, dialog/select text, staff card labels, status copy, and toast messages.
- [x] Update `app/staff/jobs/page.tsx` for the staff mobile flow, action buttons, notes, empty/completed states, toast messages, and RTL mobile layout.

## Phase 4 - Public And Customer-Facing Surface

- [x] Update `app/public/[businessSlug]/page.tsx` for all public booking copy, service type labels, form placeholders, success states, business-not-found states, and full RTL public layout behavior.

## Phase 5 - Documents And Business Settings

- [ ] Update `app/(dashboard)/invoice-preview/page.tsx` for invoice labels, amount/date formatting labels, table alignment, totals alignment, action buttons, and RTL invoice presentation.
- [ ] Update `app/(dashboard)/settings/branding/page.tsx` for branding copy, business form labels, preview copy, toast messages, and the language selector/default locale control.

## Phase 6 - Notifications And Background Messaging

- [x] Update `hooks/use-fcm.ts` for localized fallback notification title/body handling and locale-aware foreground toasts.
- [x] Update `public/firebase-messaging-sw.js` for localized fallback background notification text and locale-aware deep-link defaults if needed.

## Phase 7 - Persistence, QA, And Rollout Safety

- [ ] Decide where language preference lives: user profile, business settings, browser storage, or a combination.
- [ ] Verify every page in English and Arabic on mobile, tablet, and desktop.
- [ ] Verify drawers, dropdowns, dialogs, selects, toasts, tables, and step indicators in RTL.
- [ ] Verify currency, dates, phone numbers, and mixed Arabic/Latin content do not break layout.
- [ ] Verify no hardcoded English remains in visible UI, empty states, fallbacks, toast messages, or metadata.
- [ ] Verify icon directions and inline spacing (`mr`, `ml`, `pl`, `pr`, left/right positioning) are replaced or safely handled for RTL.

## File Inventory By Area

### Core Infrastructure

- [ ] `app/layout.tsx`
- [ ] `app/page.tsx`
- [ ] `app/globals.css`
- [ ] `components/providers.tsx`
- [ ] `lib/auth-context.tsx`
- [ ] `messages/en.json` (new)
- [ ] `messages/ar.json` (new)
- [ ] `lib/i18n.ts` or `lib/locale.ts` (new)
- [ ] `components/locale-provider.tsx` or equivalent (new)

### Shared Navigation And Shared UI

- [ ] `components/app-sidebar.tsx`
- [ ] `components/mobile-nav.tsx`
- [ ] `components/top-header.tsx`
- [ ] `components/page-header.tsx`
- [ ] `components/status-badge.tsx`
- [ ] `components/ui/dialog.tsx`
- [ ] `components/ui/sheet.tsx`
- [ ] `components/ui/dropdown-menu.tsx`
- [ ] `components/ui/select.tsx`
- [ ] `components/ui/sonner.tsx`
- [ ] `components/ui/toast.tsx`
- [ ] `components/ui/toaster.tsx`
- [ ] `components/ui/use-toast.ts`
- [ ] `hooks/use-toast.ts`

### App Pages

- [ ] `app/login/page.tsx`
- [ ] `app/(dashboard)/layout.tsx`
- [ ] `app/(dashboard)/dashboard/page.tsx`
- [ ] `app/(dashboard)/bookings/page.tsx`
- [ ] `app/(dashboard)/jobs/page.tsx`
- [ ] `app/(dashboard)/jobs/[id]/page.tsx`
- [ ] `app/(dashboard)/jobs/new/page.tsx`
- [ ] `app/(dashboard)/staff/page.tsx`
- [ ] `app/(dashboard)/invoice-preview/page.tsx`
- [ ] `app/(dashboard)/settings/branding/page.tsx`
- [ ] `app/public/[businessSlug]/page.tsx`
- [ ] `app/staff/jobs/page.tsx`

### Notifications

- [ ] `hooks/use-fcm.ts`
- [ ] `public/firebase-messaging-sw.js`

## Notes

- [ ] `styles/globals.css` exists in the repo, but it does not appear to be part of the active app shell right now. Keep it out of the first implementation pass unless it becomes wired into the build.
- [ ] `components/ui/sidebar.tsx` contains many RTL-sensitive left/right classes, but it does not appear to be part of the current app shell. Audit it only if that generic sidebar is introduced later.
- [ ] The current app has many hardcoded `left`, `right`, `ml`, `mr`, `pl`, `pr`, `text-left`, and `text-right` usages. Replace or abstract these carefully so responsiveness does not regress.