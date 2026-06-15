## Security scan results (re-run 2026-06-15)

**Connector scan (Wiz):** 0 findings — clean.

**Supabase scans:** 9 findings (1 error, 8 warn). Plan below addresses every actionable item; intentional/by-design items get marked-as-ignored with rationale.

---

## Fixes (single migration)

### 1. `quiz_result_shares` — public SELECT exposes user_id + formula (ERROR)
Drop `Anyone can view quiz shares` (`USING true`). All consumers (`share-quiz-result`, `quiz-share-meta`, `generate-quiz-og-image`) are edge functions using the service role, so they bypass RLS. Keep author-only SELECT for the owner (`auth.uid() = user_id`).

### 2. `pumps` — internal hardware data world-readable
Drop `Anyone can view pumps` (`USING true`). Replace with admin-only SELECT (`has_role(auth.uid(),'admin')`). Only `AdminPumps.tsx` reads this table.

### 3. `ingredient_mappings` — manufacturing data exposed to every signed-in user
Replace the `is_active = true` SELECT policy with admin-only (`has_role(auth.uid(),'admin')`). All readers are admin pages / admin edge functions.

### 4. `has_role` SECURITY DEFINER callable by `anon`
`REVOKE EXECUTE ... FROM anon`. Keep `authenticated` (RLS policy expressions need it at query time).

---

## Findings marked as ignored (with rationale)

- **`consultation_requests` INSERT `WITH CHECK (true)`** — public B2B lead form must accept anonymous submissions.
- **`whatsapp_optins` INSERT `WITH CHECK (true)`** — public opt-in form.
- **`quiz_sessions` INSERT `WITH CHECK (true)` + missing client SELECT/UPDATE** — intentional. Reads/updates go through `quiz-session-api` edge function using `session_id` as a bearer token (already implemented).
- **`has_role` callable by `authenticated`** — required: RLS policies invoke it at query time as the caller.
- **`redeem_referral_reward` callable by `authenticated`** — intentional public API; function internally validates `auth.uid()` ownership and only flips `*_discount_used` from false→true.

---

## Verification

- `supabase--linter` after migration to confirm no new warnings.
- `security--run_security_scan` to confirm only the intentional/ignored items remain.
- Spot-check: admin pages still load pumps/ingredients; share pages still render via edge functions.

No client code changes required (all affected reads already go through edge functions or admin pages whose users have the admin role).