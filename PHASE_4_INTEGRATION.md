# Phase 4: Integration Flow Architecture - Implementation Guide

## Overview
This document describes the completed integration flows between the quiz system, custom scent creation, and Shopify checkout.

## Flow 1: Quiz → Custom Scent → Shopify Product ✅

### User Journey
1. **User completes quiz** (`/quiz/for-yourself` or `/quiz/for-someone-else`)
2. **AI generates 3 custom recommendations** (via `quiz-recommendations` edge function)
3. **User selects & saves a scent** → Stored in `saved_scents` table
4. **User views scent details** (`/scent-detail/:id`)
5. **User clicks "Order This Scent"**
6. **Backend creates Shopify product** (via `create-shopify-product-from-scent` edge function):
   - Creates product with user's fragrance name + code
   - Adds metafields: `formula`, `match_score`, `fragrance_code`
   - Creates 3 variants: 10ml (₹999), 30ml (₹2999), 50ml (₹4999)
   - Stores product mapping in `shopify_product_mappings` table
7. **Product added to Shopify cart** (Zustand cart store)
8. **User proceeds to Shopify checkout**
9. **Webhook receives order** (via `shopify-webhook-handler` edge function)
10. **Order saved to local database** (`orders` and `order_items` tables)

### Implementation Details

#### Edge Function: `create-shopify-product-from-scent`
```typescript
// Endpoint: /functions/v1/create-shopify-product-from-scent
// Auth: Required (JWT)
// Input: { scentId: string }
// Output: { productId: string, variantIds: Array<{id, size, price}> }
```

**Features:**
- Checks if product already exists (idempotent)
- Creates Shopify product with custom metafields
- Updates `saved_scents` with Shopify IDs
- Creates mappings in `shopify_product_mappings`

#### Edge Function: `shopify-webhook-handler`
```typescript
// Endpoint: /functions/v1/shopify-webhook-handler
// Auth: None (verified via HMAC)
// Webhook Topics: orders/create, orders/updated, orders/paid
```

**Features:**
- Verifies webhook signature (HMAC)
- Maps Shopify order to user via email
- Creates order record with Shopify reference
- Creates order items for each line item
- Updates order status on payment

## Flow 2: Pre-Made Products → Direct Shopify ✅

### User Journey
1. **User browses ProductShowcase** (Home page or dedicated shop page)
2. **Products fetched from Shopify** (via Storefront API)
3. **Click "Add to Cart"** → Added to Zustand cart store
4. **Checkout via Shopify** (Cart drawer → Shopify checkout)
5. **Webhook confirms order** → Local analytics updated

### Implementation Details

#### Component: `ProductShowcase`
- Fetches products via Storefront API
- Displays product cards with images, titles, prices
- Variant selection dialog
- Direct add to cart with Shopify variant IDs

## Flow 3: Saved Scent Details → Purchase ✅

### User Journey
1. **User views saved scent** (`/scent-detail/:id`)
2. **Selects size** (10ml, 30ml, or 50ml)
3. **Clicks "Order This Scent"**
4. **System creates/fetches Shopify product** (if not already created)
5. **Product added to Shopify cart** (with selected variant)
6. **Proceeds to Shopify checkout**

### Implementation Details

#### Updated Component: `ScentDetail`
```typescript
const handleAddToCart = async () => {
  // 1. Create Shopify product if needed
  const { data } = await supabase.functions.invoke(
    'create-shopify-product-from-scent',
    { body: { scentId: scent.id } }
  );
  
  // 2. Find variant for selected size
  const variant = data.variantIds.find(v => v.size === selectedSize);
  
  // 3. Add to Zustand cart store
  addItem({
    product: { /* Shopify product data */ },
    variantId: variant.id,
    variantTitle: selectedSize,
    price: { amount: variant.price, currencyCode: 'INR' },
    quantity: 1,
    selectedOptions: [{ name: 'Size', value: selectedSize }]
  });
};
```

## Database Schema

### Tables Used

#### `saved_scents`
- `shopify_product_id` - Shopify product ID (Admin API format)
- `shopify_variant_id` - Primary variant ID
- Linked to user via `user_id`

#### `shopify_product_mappings`
- `saved_scent_id` - Reference to saved scent
- `shopify_product_id` - Shopify product ID
- `shopify_variant_id` - Variant ID
- `size` - Size of variant (10ml, 30ml, 50ml)

#### `orders`
- `shopify_order_id` - Shopify order ID
- `shopify_order_number` - Human-readable order number
- `shopify_checkout_url` - Order status URL
- Synced from webhooks

## Configuration Required

### Shopify Webhooks Setup

1. Go to Shopify Admin → Settings → Notifications → Webhooks
2. Add webhook subscriptions:

**Order creation webhook:**
```
Topic: orders/create
URL: https://pcwfrmgcycbddqhkqgfx.supabase.co/functions/v1/shopify-webhook-handler
Format: JSON
```

**Order updated webhook:**
```
Topic: orders/updated
URL: https://pcwfrmgcycbddqhkqgfx.supabase.co/functions/v1/shopify-webhook-handler
Format: JSON
```

**Order paid webhook:**
```
Topic: orders/paid
URL: https://pcwfrmgcycbddqhkqgfx.supabase.co/functions/v1/shopify-webhook-handler
Format: JSON
```

### Environment Variables (Already Configured)
- `SHOPIFY_ACCESS_TOKEN` - Admin API token
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN` - Storefront API token
- `SHOPIFY_WEBHOOK_SECRET` - (Optional) Webhook signing secret

## Testing Checklist

- [ ] Complete quiz and save scent
- [ ] View scent detail page
- [ ] Click "Order This Scent"
- [ ] Verify Shopify product created
- [ ] Check product has correct metafields
- [ ] Add to cart successfully
- [ ] Proceed to Shopify checkout
- [ ] Complete test order
- [ ] Verify webhook received
- [ ] Check order in database
- [ ] Test with pre-made products
- [ ] Test cart quantity updates
- [ ] Test cart item removal

## Next Steps

### Recommended Enhancements
1. **Product Images**: Upload fragrance bottle images to Shopify
2. **Email Notifications**: Send order confirmations via Supabase
3. **Order Tracking**: Display order status from Shopify
4. **Inventory Management**: Sync stock levels (if applicable)
5. **Discount Codes**: Integrate referral codes with Shopify discounts
6. **Custom Checkout Fields**: Add gift messages, delivery notes
7. **Analytics**: Track conversion from quiz to purchase

### Performance Optimizations
1. Cache Shopify products locally
2. Batch product creation for multiple scents
3. Optimize variant selection UX
4. Add loading skeletons

## Troubleshooting

### Product Creation Fails
- Check SHOPIFY_ACCESS_TOKEN is valid
- Verify API version (2025-07) is correct
- Check Shopify API rate limits
- Review edge function logs

### Webhook Not Received
- Verify webhook URL is accessible
- Check Shopify webhook delivery attempts
- Review HMAC signature validation
- Check edge function logs

### Order Not Syncing
- Verify user email matches Shopify customer email
- Check profiles table for user
- Review webhook payload structure
- Check database RLS policies

## API Reference

### Storefront API
- Version: 2025-07
- Used for: Product fetching, cart creation, checkout

### Admin API
- Version: 2025-07
- Used for: Product creation, order webhooks, metafields

### Edge Functions
- `create-shopify-product-from-scent` - Creates custom products
- `shopify-webhook-handler` - Processes order webhooks
