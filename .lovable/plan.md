# Machine dashboard: live OrderQueue messages with pump times

## What you will get
- A new admin page **Machine** (under Operations in the sidebar, at `/admin/machine`).
- A live feed of every message sent to the machine on `OrderQueue`. New ones appear right away without refreshing.
- Each message shows a card with:
  - Job, fragrance code, size, quantity, time sent, and whether it was sent or failed (with the error).
  - The **pump sequence** in order: step number, pump, note, ml, percentage, and **pump time in seconds** (ml divided by that pump's ml-per-second rate from the Pumps page).
  - The total run time for the job (sum of pump times), plus a simple bar timeline showing how long each pump runs.
- Filters: All / Sent / Failed, and a search box for job or fragrance code. Shows the newest 100 messages.
- The message also sent to the machine gets a `seconds` value on each pump line, so the machine and the dashboard match.

## How "live" works
The dashboard shows what the server publishes to the machine. It does not connect to HiveMQ from the browser, so your broker password is never exposed in the page. If you later want to see messages sent by other systems, that would need a separate listener.

## Technical details
- New table `machine_messages` (id, job_id, fragrance_code, topic, payload jsonb, ok, error, created_at). RLS on; admins can read via `has_role(auth.uid(),'admin')`. Inserts only by the backend function. Added to realtime.
- `admin-manage-production` `publishJobs`: add `seconds = ml / ml_per_second` (rounded to 1 decimal, null if rate missing) and `total_seconds` to the payload; insert one `machine_messages` row per attempt (success or failure), in addition to the existing `machine_notes` log.
- New page `src/pages/admin/AdminMachine.tsx`: loads the latest 100 rows, subscribes to realtime inserts, renders cards with the sequence table and timeline using existing design tokens. Lazy route in `App.tsx` behind the admin guard; sidebar entry with a `Cpu` icon.
- Add a small test that pump seconds = ml / ml_per_second for a sample pump.
