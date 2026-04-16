

## Plan: Add Personalized Greeting to Account Dashboard

### Change

Update line 384 in `src/pages/Account.tsx` to display the user's name or email:

```
Welcome Back, {profile?.full_name || profile?.email || ''}!
```

This uses the `profile` state that's already fetched from the `profiles` table. It shows the full name if available, falls back to email, or shows nothing if profile hasn't loaded yet.

### Files Modified
- `src/pages/Account.tsx` — one line change on line 384

