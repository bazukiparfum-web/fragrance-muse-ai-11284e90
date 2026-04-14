

## Plan: Add Consultation Request Form Dialog

### What
When the user clicks "Request Consultation" in the BusinessAroma section, a dialog opens with a contact form matching the reference design — dark background, Name + Email side by side, Comment textarea, and a Submit button. Submissions are saved to a new `consultation_requests` database table.

### Changes

**1. Create database table `consultation_requests`**
- Columns: `id` (uuid), `name` (text), `email` (text), `comment` (text), `created_at` (timestamptz)
- RLS: Allow anonymous inserts (public-facing form), no select/update/delete for anon

**2. Update `src/components/BusinessAroma.tsx`**
- Add state to control dialog open/close
- On "Request Consultation" click, open a Dialog
- Dialog content: dark-themed form with:
  - Heading: "How can we help you?"
  - Subtext about submitting queries
  - Name and Email inputs side by side
  - Comment textarea below
  - Submit button
- On submit: validate inputs, insert into `consultation_requests` via Supabase client, show success toast, close dialog

### Technical details
- Uses existing `Dialog` component from `src/components/ui/dialog.tsx`
- Uses `supabase.from('consultation_requests').insert(...)` for saving
- Client-side validation with basic checks (non-empty name/email, valid email format)
- Dark styling to match the reference screenshot's aesthetic

