# Complete Testing Guide for Fragrance System

## Prerequisites
- Enable auto-confirm email in Supabase settings (Settings → Authentication)
- Clear browser cache and cookies before testing
- Use incognito/private mode for clean testing

---

## Test Scenario 1: Complete End-to-End Fragrance Creation & Sharing

### Part A: User A - Create & Share Fragrance

#### Step 1: Sign Up as User A
1. Go to `/auth`
2. Click "Sign Up" tab
3. Enter:
   - Email: `usera@test.com`
   - Password: `Test1234!`
   - Full Name: `User A`
4. Click "Sign Up"
5. **✓ Expected:** Should auto-login and redirect to home page

#### Step 2: Complete Quiz
1. Navigate to `/shop/quiz/landing`
2. Click "For Yourself"
3. Complete all 8 steps:
   - Age Range: Select any option
   - Personality: Select any option
   - Scent Family: Select any option
   - Intensity: Adjust slider
   - Longevity: Select any option
   - Occasion: Select any option
   - Climate: Select any option
   - Dream Word: Enter "Mystic"
4. Click "Get Recommendations"
5. **✓ Expected:** You should see 3 fragrance recommendations
6. **⚠️ Common Issue:** If redirected to login, your session expired. Re-login and start from step 2.

#### Step 3: Save Fragrance
1. On the Quiz Results page, find the first fragrance card
2. Click the "Save" button (with bookmark icon) at the bottom of the card
3. **✓ Expected:** A dialog should open titled "Save Your Fragrance"
4. Enter name: "Mystic Rose"
5. Click "Save Fragrance"
6. **✓ Expected:** 
   - Success toast: "Saved as [CODE]!" (e.g., "Saved as USERA-001!")
   - Automatically redirected to `/shop/account/scents/[id]` (detail page)
7. **⚠️ Common Issue:** If "Save" button doesn't work, check:
   - You are logged in (check if user icon shows in header)
   - Console for errors (F12 → Console)

#### Step 4: View in My Scents
1. Navigate to `/shop/account?tab=scents`
2. **✓ Expected:** Should see "Mystic Rose" card with:
   - Fragrance code (USERA-001)
   - Visual color circle
   - Match score, intensity, longevity
   - "Reorder" and "View Details" buttons

#### Step 5: Generate Share Link
1. Click on "Mystic Rose" card to open detail page
2. Click the "Share" button (top right actions)
3. **✓ Expected:** Share dialog opens
4. Click "Generate Share Link"
5. **✓ Expected:**
   - Shows "₹100 off for you & your friend!" banner
   - Share Link field populated with URL
   - Referral Code field shows code (e.g., "USERA-BZK7X")
   - WhatsApp and Facebook buttons visible
6. **Copy the referral code** (you'll need it for next test)
7. **Copy the share link** (you'll need it for next test)

#### Step 6: Verify in Referrals Tab
1. Navigate to `/shop/account?tab=referrals`
2. **✓ Expected:** Should see:
   - Stats showing 0 friends ordered, ₹0 available balance
   - Active referral link with code USERA-BZK7X
   - Can copy link via "Copy" button

---

### Part B: User B - Use Referral Link & Order

#### Step 1: Open Referral Link (New Incognito Window)
1. Open new incognito/private browser window
2. Paste the share link from User A (format: `https://[domain]/shared/fragrance/[token]?ref=[code]`)
3. **✓ Expected:**
   - See fragrance "Mystic Rose" details
   - See referral banner at top: "Get ₹100 off when you order!"
   - Referral code automatically captured in URL

#### Step 2: Sign Up as User B
1. Click "Order This Fragrance" button
2. **✓ Expected:** Redirected to `/auth` with referral code in URL
3. Click "Sign Up" tab
4. Enter:
   - Email: `userb@test.com`
   - Password: `Test1234!`
   - Full Name: `User B`
5. Click "Sign Up"
6. **✓ Expected:** 
   - Auto-login
   - Referral code stored in database
   - Redirected back to shared fragrance page

#### Step 3: Add to Cart & Checkout
1. On shared fragrance page, select size (e.g., 30ml)
2. Click "Add to Cart"
3. Go to cart (cart icon in header)
4. Click "Proceed to Checkout"
5. **✓ Expected:** On checkout page at `/shop/checkout`

#### Step 4: Apply Referral Discount
1. Look for "Referral Discount" section
2. **✓ Expected:** Should see:
   - Message: "You have a ₹100 referral discount available!"
   - Button: "Apply ₹100 Discount"
3. Click "Apply ₹100 Discount"
4. **✓ Expected:**
   - Success toast: "Discount applied!"
   - Order total reduced by ₹100
   - Button changes to "Discount Applied ✓"

#### Step 5: Complete Order
1. Fill in shipping details:
   - Name: User B
   - Address: 123 Test St
   - City: Mumbai
   - State: Maharashtra
   - PIN: 400001
   - Phone: 9876543210
2. Select delivery type: Standard or Express
3. Click "Place Order"
4. **✓ Expected:**
   - Success page with order number
   - Referral reward processed in background

#### Step 6: Verify Rewards
1. Go to `/shop/account?tab=referrals`
2. **✓ Expected:** In "Discount History":
   - One entry showing ₹100 referee discount (used)

---

### Part C: User A - Verify Referrer Reward

#### Step 1: Check Referral Stats
1. Login as User A (in original browser/tab)
2. Go to `/shop/account?tab=referrals`
3. **✓ Expected:** Stats should show:
   - Total Invited: 1
   - Friends Who Ordered: 1
   - Total Earned: ₹100
   - Available Balance: ₹100

#### Step 2: Check Discount History
1. Scroll to "Discount History" table
2. **✓ Expected:** Should see TWO entries:
   - Row 1: Referee discount (₹100) - Used by User B
   - Row 2: Referrer discount (₹100) - Available for User A

#### Step 3: Use Referrer Discount
1. Go to `/shop/quiz/landing` and create another fragrance
2. Add to cart and go to checkout
3. **✓ Expected:**
   - Should see "You have a ₹100 referral discount available!"
   - Can apply the ₹100 discount earned from User B's order

---

## Test Scenario 2: Tweak Feature

### Step 1: Navigate to Saved Scent
1. Login and go to `/shop/account?tab=scents`
2. Click on "Mystic Rose" to open detail page

### Step 2: Tweak Formula
1. Click "Tweak Formula" button
2. **✓ Expected:**
   - Redirected to quiz page
   - Alert banner shows: "You're tweaking: Mystic Rose"
   - All previous answers pre-filled
3. Modify any answer (e.g., change intensity slider)
4. Click "Get Recommendations"
5. **✓ Expected:** New recommendations based on modified answers

### Step 3: Save Tweaked Version
1. Click "Save" on one of the new recommendations
2. Enter name: "Mystic Rose v2"
3. **✓ Expected:**
   - Saved with new code (USERA-002)
   - Original "Mystic Rose" unchanged

---

## Troubleshooting Common Issues

### Issue: "Save" button doesn't work
**Causes:**
- Not logged in
- Full name not set in profile

**Fix:**
1. Check if logged in (user icon in header)
2. If logged in, ensure profile has full_name:
   ```sql
   -- Check in Supabase
   SELECT * FROM profiles WHERE id = 'user_id';
   ```
3. If null, the SaveScentDialog will prompt for name

### Issue: Can't see saved scents
**Causes:**
- RLS policy blocking access
- Wrong user_id in saved_scents

**Fix:**
1. Verify RLS policies are enabled
2. Check if saved_scents.user_id matches auth.users.id
3. Try logging out and back in

### Issue: Share button doesn't generate link
**Causes:**
- Profile missing full_name or email
- Referral code generation failed

**Fix:**
1. Check browser console for errors
2. Verify profiles table has data
3. Check referrals table for duplicate codes

### Issue: Referral discount not applying
**Causes:**
- Referral code expired
- Max uses reached
- User trying to use own code

**Fix:**
1. Check referrals table:
   - `expires_at` not in past
   - `uses_count` < `max_uses`
2. Verify referee is different from referrer

### Issue: Referrer reward not created
**Causes:**
- Edge function not called
- Edge function error

**Fix:**
1. Check edge function logs in Lovable Cloud → Functions
2. Verify `process-referral-reward` function deployed
3. Check if `referral_reward_id` was passed in order

---

## Database Verification Queries

### Check saved scents
```sql
SELECT id, name, fragrance_code, user_id, created_at 
FROM saved_scents 
ORDER BY created_at DESC;
```

### Check referrals
```sql
SELECT referral_code, uses_count, max_uses, expires_at, created_at
FROM referrals
ORDER BY created_at DESC;
```

### Check referral rewards
```sql
SELECT 
  rr.id,
  rr.status,
  rr.referrer_discount_used,
  rr.referee_discount_used,
  r.referral_code
FROM referral_rewards rr
JOIN referrals r ON r.id = rr.referral_id
ORDER BY rr.created_at DESC;
```

### Check orders with discounts
```sql
SELECT 
  order_number,
  discount_code,
  discount_applied,
  total,
  created_at
FROM orders
ORDER BY created_at DESC;
```

---

## Expected Database State After Complete Test

### After User A saves "Mystic Rose":
- **saved_scents**: 1 row (USERA-001)
- **referrals**: 0 rows

### After User A generates share link:
- **saved_scents**: 1 row (share_token set, is_public=true)
- **referrals**: 1 row (USERA-BZK7X, uses_count=0)

### After User B signs up via referral:
- **profiles**: User B profile created
- **referral_rewards**: 1 row (status='pending', referee_discount_used=false)

### After User B places order:
- **orders**: 1 row (discount_applied=100)
- **referral_rewards**: 2 rows
  - Row 1: Referee reward (status='completed', referee_discount_used=true)
  - Row 2: Referrer reward (status='completed', referrer_discount_used=false)
- **referrals**: uses_count=1

---

## Security Verification

### Test: User can't use own referral code
1. Login as User A
2. Copy referral code USERA-BZK7X
3. Try to apply in checkout
4. **✓ Expected:** Error: "You cannot use your own referral code"

### Test: Expired code doesn't work
1. Update referral in database:
   ```sql
   UPDATE referrals 
   SET expires_at = NOW() - INTERVAL '1 day'
   WHERE referral_code = 'USERA-BZK7X';
   ```
2. Try to apply code
3. **✓ Expected:** Error: "This referral code has expired"

### Test: Max uses enforced
1. Update referral:
   ```sql
   UPDATE referrals 
   SET uses_count = 10, max_uses = 10
   WHERE referral_code = 'USERA-BZK7X';
   ```
2. Try to apply code
3. **✓ Expected:** Error: "This referral code has reached maximum uses"

### Test: RLS prevents unauthorized access
1. Login as User B
2. Try to access User A's scent directly: `/shop/account/scents/[usera-scent-id]`
3. **✓ Expected:** Error or redirect to account page

---

## Known Limitations

1. **Share link requires public access**: Once shared, fragrance is public until manually made private
2. **Referral rewards are one-time**: Each referee gets one ₹100 discount, referrer gets one ₹100 per referee
3. **No automatic expiry of share links**: Share tokens don't expire (only referral codes expire)
4. **No rate limiting on API**: Can generate multiple share links rapidly
5. **Email notifications not implemented**: Users don't get notified when rewards are available
