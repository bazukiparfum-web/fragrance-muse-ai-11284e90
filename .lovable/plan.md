# Production queue: status follows machine send

## Goal
When a pending fragrance is sent to the machine, the status only changes to "In progress" if the machine send actually succeeds, and the page refreshes itself so the admin sees the new status immediately.

## Current behavior (confirmed)
- Clicking a pending job marks it "In progress" in the database first, then tries the machine send — so a failed send still leaves the job as "In progress".
- The page never reloads the list after the action, so the status change isn't visible until a manual refresh.

## Changes

### Server (`admin-manage-production` function)
- For the "start job" action: send to the machine first, and only set the job to "In progress" (with start time) when the send succeeds.
- If the send fails, the job stays "Pending" and the error is returned so the admin sees why.
- Bulk "start" works the same way per job: jobs that send successfully move to "In progress"; jobs that fail stay "Pending" with the error noted in their machine notes.

### Admin page (`/admin/production-queue`)
- After any start/resend action, automatically reload the queue list so statuses, counts, and tab badges update without a manual refresh.
- Toast messages stay: success shows "Sent to machine", failure shows the reason.

## Technical details
- `supabase/functions/admin-manage-production/index.ts`: reorder the `in_progress` path — `publishJobs` first, then `update` only for ids with `ok: true`; failed ids keep `pending` status and get the error appended to `machine_notes`. Response includes per-job results.
- `src/pages/admin/AdminProductionQueue.tsx`: call the existing data loader after `advance`, `resendMqtt`, and bulk update complete; adjust toasts to reflect partial success (e.g. "2 started, 1 failed").

## Verification
- Typecheck passes; function redeployed.
- User retests with **Resend to machine** / starting a pending job once HiveMQ credentials are confirmed working.
