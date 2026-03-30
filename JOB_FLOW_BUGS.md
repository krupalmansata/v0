# Job Creation & Assignment Flow — Bug Report

> Generated after full code analysis of the job lifecycle: booking → job creation → assignment → staff execution → completion → invoice.

---

## 1. Booking → Job Conversion Flow

- [x] **Booking conversion does not pre-fill the new job form.** The bookings page passes data via URL search params (`handleConvertToJob` builds a `URLSearchParams`), but the `/jobs/new` page **never reads `searchParams`** — it has no `useSearchParams()` call. The customer name, phone, address, and notes from the booking are silently lost, forcing the admin to re-type everything.

- [x] **No back-link from booking to the created job.** When a booking is converted, its status changes to `"converted"` but no `jobId` reference is stored on the booking record. There is no way to trace which job was created from which booking.

- [x] **Booking `serviceType` is not forwarded.** Even if search params were read, `serviceType` is not included in the `URLSearchParams` constructed in `handleConvertToJob`, so it would be lost on conversion.

- [x] **Booking `preferredDate` / `preferredTime` are not forwarded.** The booking has schedule preferences, but `handleConvertToJob` does not include them in the search params, so the admin must manually re-enter the schedule.

- [x] **No confirmation before converting a booking.** Clicking "Convert to Job" immediately marks the booking as `converted` and navigates away. If the admin accidentally clicks it or abandons the job form, the booking is stuck in `converted` with no job actually created. There is no undo.

---

## 2. Job Creation Flow

- [ ] **No form validation on required fields.** `handleSubmit` has zero validation — customer name, phone, address, service type, and date can all be blank. A completely empty job can be saved to the database.

- [ ] **`assignedStaffName` is never saved during job creation.** When creating a job with a staff member selected, only `assignedStaffId` is stored. The `assignedStaffName` field is never written. The jobs listing page displays `job.assignedStaffName || "Unassigned"`, which will always show "Unassigned" for newly created jobs even when staff is assigned.

- [ ] **`estimatedAmount` is saved as a string, not a number.** The form field uses `type="number"` but `handleChange` stores it as a string via `e.target.value`. The invoice generation later uses `job.estimatedAmount || 0` expecting a number. This can cause display issues (e.g., `$` prefix on a string, or `$0` if falsy comparison fails for the string `"0"`).

- [ ] **"draft" status is invisible in the jobs list.** The status filters on the jobs page are `["all", "new", "assigned", "in-progress", "completed"]` — there is no "draft" filter. Draft jobs exist in the database but cannot be filtered or found easily. The `StatusBadge` component also has no style mapping for `"draft"` as a job status (it only maps it under invoice statuses), so it would render incorrectly.

- [ ] **No way to edit or update a job after creation.** There is no edit functionality on the job detail page. If any information was entered incorrectly (wrong customer, wrong date, wrong amount), the only option is to create a new job and somehow delete the old one — but there is no delete button either.

---

## 3. Job Assignment & Reassignment Flow

- [ ] **"Mark as Assigned" button works without any staff being assigned.** On the job detail page, clicking "Mark as Assigned" when the job has no `assignedStaffId` changes the status to `"assigned"` but the job has no staff member. This creates an orphan job that appears assigned but has nobody to do it.

- [ ] **Admin can manually push status forward, bypassing logic.** The admin can click "Mark In Progress" or "Mark Completed" directly from the job detail page regardless of whether a staff member has actually started work or uploaded proof photos. There are no guards.

- [ ] **Reassignment does not close the dialog.** After `handleReassign` completes, there is no code to close the reassign `<Dialog>`. The dialog stays open and the user must manually dismiss it.

- [ ] **Reassignment dropdown includes the currently assigned staff.** The staff select in the reassign dialog shows all active staff, including the person already assigned. Reassigning to the same person is a pointless but allowed operation.

- [ ] **No reassignment history or audit log.** When a job is reassigned, the previous `assignedStaffId` and `assignedStaffName` are simply overwritten. There is no record of who was previously assigned, when, or why the reassignment happened.

- [ ] **Status regression is possible.** Nothing prevents the status from going backwards (e.g., from `"completed"` back to `"assigned"` via reassignment). The reassignment handler sets `status: job.status === "new" ? "assigned" : job.status`, but if a completed job is reassigned, it stays `"completed"` — which is logically wrong for a reassignment.

---

## 4. Staff Jobs Page (Execution Flow)

- [ ] **Staff sees ALL business jobs, not just their own.** The staff jobs page fetches `jobs/${userData.businessId}` and filters by `j.assignedStaffId && ["assigned", "in-progress"].includes(j.status)` — it does not filter by the logged-in staff member's ID. Any staff member sees every assigned/in-progress job for the entire business, not just their own.

- [ ] **No staff identity mapping.** `userData` from auth context contains `user.uid` (Firebase Auth UID), but `assignedStaffId` on jobs is the Firebase Realtime DB push key from the `staff/` node. There is no mapping between a Firebase Auth user and their staff record. Staff members cannot be linked to their user accounts, making per-staff filtering impossible with the current data model.

- [ ] **Completion notes textarea is not connected to anything.** The "Completion Notes" `<Textarea>` in the staff job detail view has no `value` binding, no `onChange` handler, and the value is never saved to the database when the job is marked complete. It's a purely visual element that discards all input.

- [ ] **Photo upload allows uploads on completed jobs.** The upload photo button is always visible regardless of job status. Staff can keep uploading photos to already-completed jobs.

- [ ] **No required proof photo before marking complete.** A staff member can mark a job as "completed" without uploading any proof photos. There is no validation that at least one photo exists.

- [ ] **After completing a job, it disappears from the staff list.** The staff jobs page only shows `["assigned", "in-progress"]` jobs. Once a job is marked completed, it vanishes from the staff's view with no way to see their completed work history.

---

## 5. Invoice Generation Flow

- [ ] **Duplicate invoices can be generated.** The "Generate Invoice" button on the job detail page creates a new invoice every time it's clicked. There is no check for whether an invoice already exists for that job. Clicking it 5 times creates 5 separate invoices.

- [ ] **Invoice `totalAmount` can be `""` (empty string) or `"0"`.** Since `estimatedAmount` is stored as a string, `job.estimatedAmount || 0` can produce unexpected results. An empty string is falsy so it falls back to `0`, but the string `"50"` would be stored as-is, leading to `$50` displaying correctly but math operations failing.

- [ ] **No link back from invoice to job detail.** The invoice stores `jobId` but the invoice preview page never renders a clickable link to navigate back to the source job.

- [ ] **Invoice status is always "draft" and cannot be changed.** Invoices are created with `status: "draft"` and there is no UI to mark an invoice as `"sent"` or `"paid"`. The status badges for `sent`/`paid` exist in the `StatusBadge` component but are unreachable.

- [ ] **After generating an invoice, the user is sent to `/invoice-preview` with no context.** `router.push("/invoice-preview")` navigates to the invoice list page but doesn't select or highlight the newly created invoice. If there are many invoices, the user has to find the new one manually.

---

## 6. Data Display Correctness

- [ ] **Job ID displayed is the Firebase push key (e.g., `-OBcX3y...`), not a human-readable ID.** The jobs list and detail pages show `job.id` directly, which is a long Firebase-generated string. There is no formatted job number (like `JOB-001`).

- [ ] **Estimated amount shows `$undefined` when not provided.** The job detail sidebar displays `${job.estimatedAmount}` with no fallback. If `estimatedAmount` is undefined or empty, it renders as `$undefined` or `$`.

- [ ] **Scheduled date/time display is raw and unformatted.** Dates display as `2026-03-30` (raw ISO date input value) and times as `14:00` (24-hour). There is no locale-aware formatting.

- [ ] **Dashboard "Invoices This Week" counts ALL invoices, not just this week's.** The stat card uses `invoices.length` — it does not filter by date range. The label is misleading.

- [ ] **Dashboard "Recent Bookings" list is not sorted.** `bookingRequests.slice(0, 4)` takes the first 4 items from the Firebase snapshot object. Firebase objects have no guaranteed order (they're sorted by key by default, not by date), so "recent" may not actually be recent.

- [ ] **Jobs list is not sorted.** Jobs appear in Firebase key order, not by creation date, scheduled date, or any meaningful order.

- [ ] **Bookings list is not sorted.** Same issue — no sorting applied, relies on Firebase key order.

- [ ] **Invoice list is not sorted.** Invoices appear in Firebase key order instead of by issue date or creation date.

- [ ] **`proofPhotos` is expected as an array but Firebase may convert it to an object.** Firebase Realtime Database converts arrays to objects when indices are non-sequential (e.g., if a photo is deleted). The code uses `job.proofPhotos.map(...)` and `job.proofPhotos.length` which would crash if Firebase returns an object instead of an array.

---

## 7. Navigation & Routing Bugs

- [ ] **Mixed usage of `Link` imports.** Some pages import `Link` from `@/src/i18n/routing` (locale-aware) while others import from `next/link` (non-locale-aware). For example, the job detail page uses `import Link from "next/link"` — navigating to `/jobs` from there may skip the locale prefix, causing 404s or locale resets.

- [ ] **`router.push("/jobs")` does not include locale prefix.** After job creation, `router.push("/jobs")` navigates without the `[locale]` segment. In a locale-prefixed routing setup, this may navigate to the wrong path.

- [ ] **Staff "Admin View" link points to `/dashboard` without locale.** The staff jobs page header has `<Link href="/dashboard">` using `next/link`, which may not include the locale prefix.

---

## 8. Security & Data Integrity

- [ ] **Public booking page fetches ALL businesses to resolve a slug.** The public page iterates over every business in the database to find a matching slug. This is an O(n) scan and exposes the entire `businesses` node to the client (the rule is `.read: true`). For multi-tenant systems this leaks all business data.

- [ ] **No server-side validation for job data.** Firebase rules for `jobs/$businessId` allow any authenticated user with matching `businessId` to write anything. There are no `.validate` rules for required fields, data types, or status values.

- [ ] **No server-side validation for invoice data.** Same as above — no `.validate` rules exist for the `invoices` node.

- [ ] **Staff node has no validation rules.** Any data structure can be written to `staff/$businessId`.

- [ ] **Job photo bucket name is `invoice-images` but stores job photos.** The Supabase storage bucket `invoice-images` is used for both invoice snapshot images and job proof photos. This is confusing naming and could lead to accidental overwrites or permission issues.

---

## 9. State Management & UX Issues

- [ ] **No loading/disabled state on booking "Convert to Job" button.** The async operation runs without disabling the button, allowing double-clicks.

- [ ] **No loading state for booking status changes.** `handleStatusChange` in the bookings page is async but has no loading indicator. Multiple rapid clicks can fire multiple updates.

- [ ] **Reassign dialog `reassignId` state is never reset.** After reassigning, the previously selected staff member remains pre-selected in the dropdown if the dialog is opened again.

- [ ] **Staff job detail view's "completed" state shows a green banner but the job has already been removed from the list.** The filter removes completed jobs, so the completed state view is unreachable — the staff would never see the "Job Completed" success banner.

- [ ] **No delete job functionality.** There is no way to delete a job through the UI — not even drafts or incorrectly created jobs.

- [ ] **No cancel/reject job functionality.** A job can only move forward through statuses. There is no way to cancel a job.

- [ ] **No way to edit staff members.** The staff page has an "Edit" button but it has no `onClick` handler — it does nothing.

---

## Summary

| Category | Bug Count |
|---|---|
| Booking → Job Conversion | 5 |
| Job Creation | 5 |
| Assignment & Reassignment | 6 |
| Staff Execution | 6 |
| Invoice Generation | 5 |
| Data Display | 9 |
| Navigation & Routing | 3 |
| Security & Data Integrity | 5 |
| State Management & UX | 7 |
| **Total** | **51** |
