

## Plan: Add Zod Validation and Required Fields to Consultation Form

Matching the Contact Keeper Pro project's form functionality: Zod schema validation, per-field inline error messages, and all fields required (including mobile number and comment).

### Changes

**`src/components/BusinessAroma.tsx`**

1. **Add Zod validation schema** with required fields:
   - `name` — required, max 100 chars
   - `email` — required, valid email, max 255 chars
   - `phone` — required, max 20 chars (renamed label to "Contact Number" to match reference)
   - `comment` — required, max 2000 chars

2. **Replace individual state variables** with a single `form` object state and an `errors` record state for per-field error display

3. **Update `handleSubmit`**:
   - Clear errors on each submit
   - Run `schema.safeParse(form)` — if invalid, map errors to field names and display inline
   - If valid, proceed with the existing `publicClient.insert()` logic

4. **Add inline error messages** — red text below each field showing validation errors (e.g., `{errors.name && <p className="text-sm text-destructive">{errors.name}</p>}`)

5. **Make all fields required** in the UI (remove optional `|| null` fallbacks)

### No database changes needed
The `consultation_requests` table already has nullable `phone` and `comment` columns, which will now always receive values since both are required by the form.

