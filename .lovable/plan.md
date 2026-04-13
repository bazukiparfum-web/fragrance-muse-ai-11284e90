

## Plan: Redeploy Admin Edge Functions

### Problem
The `admin-manage-questions` edge function works perfectly when tested server-side (list returns all 16 questions, create/delete both succeed with status 200), but the browser gets `FunctionsFetchError: Failed to send a request to the Edge Function` with `TypeError: Failed to fetch`.

This means the latest function code (with updated CORS headers) has not been fully deployed to the edge runtime that the browser hits. The `curl_edge_functions` tool may route differently than the browser's `supabase.functions.invoke()`.

### Solution
Redeploy all admin edge functions to ensure the latest code is live:

1. **Deploy `admin-manage-questions`**
2. **Deploy `admin-manage-notes`**
3. **Deploy `admin-manage-rules`**
4. **Deploy `admin-manage-scents`**
5. **Deploy `admin-upload-notes`**
6. **Deploy `get-quiz-questions`**

After deployment, verify from the browser that `/admin/questions` loads all 16 questions and that creating a question works.

### No code changes needed
The function code and CORS headers are already correct. This is purely a deployment sync issue.

