## Plan: Make All 16 Questions Visible in /admin/questions

### Problem

The admin questions page uses the `admin-manage-questions` edge function to list questions, which requires:

1. An active auth session
2. The user to have an admin role in `user_roles`

If either check fails, the page silently shows "No questions yet" with no error feedback.

### Solution

Change the `loadQuestions` function in `AdminQuestions.tsx` to query the `quiz_questions` table directly using the Supabase client instead of going through the edge function. There is already an RLS policy ("Anyone can view active questions") that allows public SELECT on active questions. For the admin page, we should also show inactive questions, so we will query all questions using the authenticated client (which has the "Only admins can manage questions" ALL policy).

As a fallback for non-admin or unauthenticated users, we will also try fetching just active questions.

&nbsp;

### Changes

**File: `src/pages/admin/AdminQuestions.tsx**`

- Replace the `loadQuestions` function to query `quiz_questions` directly:
  ```typescript
  const { data, error } = await supabase
    .from('quiz_questions')
    .select('*')
    .order('order_index');
  ```
- Add error handling that shows a toast if the query fails
- Remove the session check that causes silent early return for listing (keep it for create/update/delete operations)

### Technical details

- The direct query approach uses RLS policies already in place
- For authenticated admins: the ALL policy grants full access
- For unauthenticated users: the SELECT policy shows active questions only
- Create/update/delete operations continue to use the edge function (admin-only)
- No database changes needed