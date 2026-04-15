

## Plan: Update Consultation Form

### Changes to `src/components/BusinessAroma.tsx`

1. **Add mobile number field** — new `phone` state and input field placed below the Name/Email row
2. **Add `phone` column to `consultation_requests` table** — nullable text column via migration
3. **Update success message** — replace generic toast with: "Thank you for connecting with us. Our sales person will get back to you."
4. **Include phone in the insert call** to save it to the database

### Database migration
```sql
ALTER TABLE consultation_requests ADD COLUMN phone text;
```

No RLS changes needed — existing insert policy already allows all columns.

