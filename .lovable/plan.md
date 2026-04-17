

## Issue: Quiz radio options appear blank

### Root Cause
`src/components/ui/label.tsx` line 7 has `text-primary-foreground` hardcoded into the base `labelVariants`:

```ts
const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-primary-foreground");
```

In light mode, `--primary-foreground` is white (`0 0% 100%`). The quiz cards have a white background → **white text on white = invisible**.

This is a global regression affecting **every `<Label>` in the app** (forms, dialogs, auth page, admin pages, etc.) on any light surface.

### Fix
Restore the original shadcn Label variant by removing the `text-primary-foreground` color from the base classes. Labels should inherit text color from their parent, letting individual usages override when needed (e.g. the dialog memory rule that adds `text-primary-foreground` explicitly on dark dialogs).

**File:** `src/components/ui/label.tsx`
```ts
const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
```

That single change restores readable labels everywhere while preserving any explicit `text-primary-foreground` overrides used elsewhere.

