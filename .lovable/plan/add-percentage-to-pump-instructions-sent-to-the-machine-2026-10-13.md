# Add Percentage to pump instructions sent to the machine

## Goal
Each pump line in the MQTT message sent to the machine includes a `percentage` field alongside `pump`, `note`, and `ml`.

## Current behavior (confirmed)
- `admin-manage-production` publishes to topic `OrderQueue` with payload:
  ```text
  { job_id, fragrance_code, size, quantity, total_ml,
    pumps: [ { pump, note, ml } ], sent_at }
  ```
- No percentage is included.

## Change

### Server (`admin-manage-production` function)
- In `publishJobs`, add `percentage` to each pump entry:
  - `percentage` = that pump's ml as a share of the total bottle volume (`total_ml`), rounded to 2 decimals.
  - Example for a 30ml bottle: a pump dispensing 4.5ml gets `percentage: 15`.
- The solvent pump gets a percentage too (its share of total volume).
- Resulting message:
  ```text
  {
    "job_id": "...",
    "fragrance_code": "...",
    "size": "30ml",
    "quantity": 1,
    "total_ml": 30,
    "pumps": [ { "pump": "PUMP-01", "note": "Bergamot", "ml": 4.5, "percentage": 15 }, ... ],
    "sent_at": "ISO time"
  }
  ```
- Redeploy the function.

## Technical details
- File: `supabase/functions/admin-manage-production/index.ts`, inside the `payload.pumps` mapping in `publishJobs`.
- Formula: `+((p.ml / plan.totalVolumeMl) * 100).toFixed(2)`.
- No database or page changes needed; existing jobs resend with the new format via "Resend to machine".

## Verification
- Typecheck passes; function redeployed.
- User retests with **Resend to machine** and confirms the machine receives the percentage field.
