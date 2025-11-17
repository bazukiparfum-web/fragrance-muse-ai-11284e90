# Shopify Integration Testing Guide - Phase 9

## Overview
This guide covers comprehensive testing for the Bazuki Shopify integration, including quiz-to-purchase flows, pre-made products, webhooks, and order synchronization.

---

## 🧪 Phase 9.1: Development Testing

### Test 1: Complete Quiz → Save → Order Flow

**Prerequisites:**
- User must be authenticated
- At least one fragrance note in database

**Steps:**
1. Navigate to `/quiz`
2. Complete the personality quiz (all questions)
3. View AI-generated recommendations
4. Select a recommended scent
5. Click "Save This Scent"
6. Choose a bottle size (10ml, 30ml, or 50ml)
7. Click "Add to Cart"
8. Open cart drawer (shopping cart icon in header)
9. Verify scent appears with correct details
10. Click "Checkout with Shopify"
11. Complete Shopify checkout in new tab

**Expected Results:**
- ✅ Scent saved to `saved_scents` table with `quiz_answers`
- ✅ Shopify product created with metafields (fragrance_code, formula_json, match_score)
- ✅ Product appears in cart with correct price and size
- ✅ Checkout URL opens in new tab with `channel=online_store` parameter
- ✅ After payment, webhook triggers order sync to local database

**Database Verification:**
```sql
-- Check saved scent
SELECT id, name, fragrance_code, shopify_product_id, shopify_variant_id 
FROM saved_scents 
WHERE user_id = '<your-user-id>' 
ORDER BY created_at DESC LIMIT 1;

-- Check Shopify product mapping
SELECT * FROM shopify_product_mappings 
WHERE saved_scent_id = '<scent-id>';

-- After checkout, check order sync
SELECT id, order_number, shopify_order_id, shopify_checkout_url, status 
FROM orders 
WHERE user_id = '<your-user-id>' 
ORDER BY created_at DESC LIMIT 1;
```

---

### Test 2: Pre-Made Product Purchase Flow

**Steps:**
1. Navigate to home page `/`
2. Scroll to "Product Showcase" section
3. Click on a pre-made product (e.g., "Midnight Oud")
4. Select variant (30ml, 50ml, or 100ml)
5. Click "Add to Cart"
6. Open cart drawer
7. Verify product appears
8. Click "Checkout with Shopify"
9. Complete checkout

**Expected Results:**
- ✅ Products load from Shopify Storefront API
- ✅ Variant selection works correctly
- ✅ Cart updates with selected variant
- ✅ Checkout redirects to Shopify
- ✅ Order webhook syncs to database

**Console Checks:**
- No errors in browser console
- Network tab shows successful GraphQL queries to Shopify

---

### Test 3: Re-Order Saved Scent Flow

**Prerequisites:**
- User has at least one saved scent

**Steps:**
1. Navigate to `/account`
2. Go to "My Scents" tab
3. Click on a saved scent
4. Click "Order This Scent"
5. Select size variant
6. Click "Add to Cart"
7. Proceed to checkout

**Expected Results:**
- ✅ Saved scent loads with all details
- ✅ If Shopify product doesn't exist, it's created
- ✅ If product exists, existing product is used
- ✅ Cart updates correctly
- ✅ Checkout completes successfully

---

### Test 4: Inventory Sync Testing

**Steps:**
1. In Shopify Admin, reduce a product's inventory to 0
2. Refresh your app's product showcase
3. Verify out-of-stock status displays
4. Try to add to cart (should show warning or disable button)

**Expected Results:**
- ✅ Inventory status syncs from Shopify
- ✅ Out-of-stock products clearly marked
- ✅ Cannot checkout unavailable items

---

### Test 5: Webhook Reception Testing

**Setup:**
1. Open browser console on `/account` page
2. Keep network tab open

**Steps:**
1. Create a test order in Shopify Admin manually
2. Mark order as paid in Shopify Admin
3. Check edge function logs

**Expected Results:**
- ✅ `shopify-webhook-handler` receives `orders/create` event
- ✅ Order syncs to local `orders` table
- ✅ User profile created if new email
- ✅ `orders/paid` webhook updates order status

**Check Logs:**
```typescript
// In Lovable Cloud → Edge Functions → shopify-webhook-handler
// Look for:
// - "Received webhook: orders/create"
// - "Order created successfully"
// - "Received webhook: orders/paid"
// - "Order status updated to paid"
```

---

## 🏪 Phase 9.2: Sandbox Testing

### Test 6: Shopify Test Order Flow

**Setup:**
1. Ensure Shopify store is in test mode
2. Use Shopify test credit card: `1` (Visa)
3. Use test expiry: Any future date
4. CVV: Any 3 digits

**Steps:**
1. Complete full purchase flow from your app
2. Use test payment details in Shopify checkout
3. Complete "payment"
4. Wait 5-10 seconds for webhook

**Expected Results:**
- ✅ Test order appears in Shopify Admin → Orders
- ✅ Order syncs to local database via webhook
- ✅ Order appears in user's account page
- ✅ Order items correctly populated

**Verification:**
```sql
-- Check order sync
SELECT 
  o.order_number,
  o.shopify_order_id,
  o.status,
  o.total,
  o.created_at,
  oi.product_name,
  oi.quantity,
  oi.price
FROM orders o
LEFT JOIN order_items oi ON oi.order_id = o.id
WHERE o.shopify_order_id IS NOT NULL
ORDER BY o.created_at DESC
LIMIT 5;
```

---

### Test 7: Order Status Sync

**Steps:**
1. Create test order
2. In Shopify Admin, update order status:
   - Mark as fulfilled
   - Add tracking number
   - Cancel order
3. Check if local database reflects changes

**Expected Results:**
- ✅ Status updates sync via webhooks
- ✅ `orders/updated` webhook triggers
- ✅ Order status changes in local database

---

### Test 8: Refund/Cancellation Flow

**Steps:**
1. Create a paid test order
2. In Shopify Admin, issue full refund
3. Check order status in app

**Expected Results:**
- ✅ Webhook receives refund event
- ✅ Order status updates to "refunded"
- ✅ User sees updated status in account

---

## 👤 Phase 9.3: User Acceptance Testing

### Test 9: Complete Customer Journey (Desktop)

**Scenario:** New user discovers product, takes quiz, purchases

**Steps:**
1. Clear browser cache and cookies
2. Visit home page as guest
3. Read hero section, scroll through features
4. Click "Take the Quiz"
5. Complete entire quiz flow
6. View recommendations
7. Save favorite scent
8. Sign up/login when prompted
9. Add scent to cart
10. Proceed to Shopify checkout
11. Complete purchase
12. Return to app
13. View order in account page

**Expected Results:**
- ✅ Smooth onboarding experience
- ✅ Quiz saves progress
- ✅ Authentication flow seamless
- ✅ Checkout experience professional
- ✅ Order confirmation received
- ✅ Order visible in account

---

### Test 10: Mobile Checkout Experience

**Devices to Test:**
- iPhone (Safari)
- Android (Chrome)
- Tablet (iPad)

**Steps:**
1. Repeat Test 9 on mobile device
2. Test responsive design
3. Test cart drawer on mobile
4. Complete mobile checkout

**Expected Results:**
- ✅ Mobile-responsive design works
- ✅ Cart drawer scrolls properly
- ✅ Shopify checkout mobile-optimized
- ✅ Payment methods work on mobile

---

### Test 11: Email Notifications Verification

**Setup:**
Use a real email address during testing

**Steps:**
1. Complete purchase
2. Check email inbox
3. Verify Shopify order confirmation received

**Expected Results:**
- ✅ Order confirmation email from Shopify
- ✅ Email contains order details
- ✅ Email links work correctly

---

### Test 12: Cart Migration for Existing Users

**Prerequisites:**
- User has old cart items in `cart_items` table

**Steps:**
1. Login as existing user
2. Navigate to `/account`
3. See cart migration banner
4. Click "Clear Old Cart"
5. Verify old items removed

**Expected Results:**
- ✅ Migration banner displays
- ✅ Old cart cleared successfully
- ✅ Toast confirms action
- ✅ User can use new Shopify cart

---

### Test 13: Referral System Integration

**Prerequisites:**
- User A has a saved scent

**Steps:**
1. User A: Navigate to saved scent
2. User A: Click "Share This Scent"
3. User A: Copy referral link
4. User B: Open referral link (new browser/incognito)
5. User B: Sign up and complete purchase
6. User A: Check for referral discount in account

**Expected Results:**
- ✅ Referral code generated
- ✅ Link includes referral code
- ✅ User B gets discount at checkout
- ✅ User A receives referral reward
- ✅ Shopify discount code auto-applied

**Database Verification:**
```sql
-- Check referral creation
SELECT * FROM referrals WHERE referrer_id = '<user-a-id>';

-- Check referral reward
SELECT * FROM referral_rewards WHERE referrer_id = '<user-a-id>';
```

---

## 🐛 Common Issues & Troubleshooting

### Issue: Checkout redirects to password-protected page
**Solution:** Ensure checkout URL includes `?channel=online_store` parameter

### Issue: Cart items not syncing
**Solution:** Check browser console for Zustand store errors

### Issue: Webhooks not triggering
**Solution:** 
- Verify webhook URL in Shopify Admin
- Check edge function logs for errors
- Ensure CORS headers correct

### Issue: Order not appearing in account
**Solution:**
- Check `orders` table for `shopify_order_id`
- Verify webhook received (check logs)
- Ensure user email matches

### Issue: Product images not loading
**Solution:**
- Check Shopify product has images
- Verify image URLs valid
- Check CORS policy

---

## ✅ Testing Checklist

### Development Testing
- [ ] Quiz to purchase flow works
- [ ] Pre-made products load and purchase correctly
- [ ] Saved scent re-ordering works
- [ ] Inventory syncs correctly
- [ ] Webhooks received and processed

### Sandbox Testing
- [ ] Test orders complete successfully
- [ ] Order status syncs correctly
- [ ] Refunds process properly
- [ ] Edge function logs show no errors

### User Acceptance Testing
- [ ] Complete customer journey smooth (desktop)
- [ ] Mobile experience works perfectly
- [ ] Email notifications received
- [ ] Cart migration works for existing users
- [ ] Referral system integrated with Shopify

### Security Testing
- [ ] Webhook signatures verified
- [ ] User data properly isolated (RLS)
- [ ] Payment data never stored locally
- [ ] HTTPS enforced on all endpoints

---

## 📊 Success Metrics

- ✅ 100% of test orders sync to database
- ✅ 0 webhook verification failures
- ✅ < 2 second cart update time
- ✅ < 3 second checkout redirect time
- ✅ 100% mobile checkout completion rate
- ✅ 0 critical console errors

---

## 🚀 Next Steps After Testing

1. **Monitor Production:** Set up error tracking and monitoring
2. **Optimize Performance:** Review slow queries and API calls
3. **Gather Feedback:** Collect user feedback on checkout experience
4. **Iterate:** Based on testing results, make improvements
5. **Scale:** Prepare for production traffic and load testing

---

**Testing Complete:** Once all tests pass, the Shopify integration is ready for production deployment! 🎉
