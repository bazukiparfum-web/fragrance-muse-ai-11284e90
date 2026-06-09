Remove the text-pill "Trusted by" strip at the bottom of `B2BPackages.tsx` (lines 168–182) along with the now-unused `brands` constant (lines 66–73). The new logo carousel below this section already covers the same purpose.

**File**: `src/components/business/B2BPackages.tsx` — delete the `brands` array and the bottom `<div className="mt-16 border-t...">` block. No other changes.
