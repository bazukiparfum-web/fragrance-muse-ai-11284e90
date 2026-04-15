

## Plan: Fix Consultation Form Submission Blocked by Stale Auth Session

### Problem
The form code and database are both correct. The Supabase client has a stale/invalid auth session stored in localStorage. Before executing the `insert` call, the client tries to refresh this expired token, which fails with "Failed to fetch" — blocking the actual database request.

### Fix
In `src/components/BusinessAroma.tsx`, sign out any stale session before performing the anonymous insert. This clears the broken token so the insert can proceed with the anon key.

### Changes

**`src/components/BusinessAroma.tsx`** — Update `handleSubmit`:
- Before the insert call, add `await supabase.auth.signOut()` wrapped in a try-catch to clear any lingering broken session
- Alternatively (cleaner approach): create a separate unauthenticated Supabase client instance just for this public form submission, bypassing the session-aware global client entirely

The cleaner approach:
- Import `createClient` from `@supabase/supabase-js`
- Create a one-off client with `persistSession: false` and `autoRefreshToken: false`
- Use that client for the consultation insert only

This ensures the public consultation form always works regardless of whether a user has a broken auth session.

### No database changes needed
Table, columns, types, and RLS policies are all correct and working.

