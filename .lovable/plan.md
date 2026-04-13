
Diagnosis

- Yes, I know what the issue is.
- The error is happening before `admin-manage-questions` actually runs.
- Evidence:
  - `AdminQuestions.tsx` calls `supabase.functions.invoke('admin-manage-questions', ...)`.
  - The browser console shows `FunctionsFetchError: Failed to send a request to the Edge Function` with nested `TypeError: Failed to fetch`.
  - That message means the browser request itself failed, not that the function returned an application error.
  - The edge-function logs you provided for the admin functions only show `booted` / `Listening on http://localhost:9999/` and no request activity, which strongly suggests the request is being blocked before it reaches the function runtime.

Most likely root cause

- The admin edge functions use an incomplete CORS header allow-list:
  - `authorization, x-client-info, apikey, content-type`
- This project uses `@supabase/supabase-js@2.78.0`, and other working functions in this codebase already allow extra client headers such as:
  - `x-supabase-client-platform`
  - `x-supabase-client-platform-version`
  - `x-supabase-client-runtime`
  - `x-supabase-client-runtime-version`
- Because those headers are missing from `Access-Control-Allow-Headers`, the browser preflight can fail, which produces the exact “Failed to fetch / Failed to send a request to the Edge Function” error you’re seeing.

Why `/admin/questions` shows it clearly

- `/admin/questions` depends entirely on `admin-manage-questions` for loading.
- Unlike the quiz pages, it has no silent fallback dataset.
- So when the edge-function call is blocked, the page shows `Failed to load questions`.

Important nuance

- `get-quiz-questions` currently has the same older CORS header pattern, so it may also be vulnerable.
- It only appears healthier because the quiz UI falls back to hardcoded questions if loading fails.

Implementation plan

1. Update CORS headers in `supabase/functions/admin-manage-questions/index.ts`
   - Expand `Access-Control-Allow-Headers` to include the full Supabase client header set used by the browser app.
   - Keep the same headers on:
     - `OPTIONS` response
     - success responses
     - error responses

2. Apply the same CORS fix to the other admin functions using the same outdated header list
   - `supabase/functions/admin-manage-notes/index.ts`
   - `supabase/functions/admin-manage-rules/index.ts`
   - `supabase/functions/admin-manage-scents/index.ts`
   - `supabase/functions/admin-upload-notes/index.ts`

3. Also fix `supabase/functions/get-quiz-questions/index.ts`
   - Prevent hidden failures on the quiz pages later.

4. Re-test `/admin/questions`
   - Confirm the function is now reached
   - Confirm all 16 questions load
   - Confirm create/update/delete/reorder calls succeed

5. Optional hardening
   - Improve the admin error copy so request-level failures say something like:
     - “The browser could not reach the backend function”
     - instead of only a generic load failure

Technical detail

- This does not look like an RLS problem.
- It also does not look like a database/query problem.
- It is not caused by `verify_jwt` in `supabase/config.toml` since that is already set to `false` for `admin-manage-questions`.
- The strongest signal is: fetch fails in the browser, and the function logs show no incoming request.

Files to change

- `supabase/functions/admin-manage-questions/index.ts`
- `supabase/functions/admin-manage-notes/index.ts`
- `supabase/functions/admin-manage-rules/index.ts`
- `supabase/functions/admin-manage-scents/index.ts`
- `supabase/functions/admin-upload-notes/index.ts`
- `supabase/functions/get-quiz-questions/index.ts`

Expected outcome after fix

- `/admin/questions` should stop showing “Failed to load questions”
- the edge function should begin receiving requests
- all 16 questions should load
- CRUD should work through the same function path
