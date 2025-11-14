-- Phase 3: Database Schema Updates for Shopify Integration
-- Link saved scents to Shopify products
ALTER TABLE saved_scents 
ADD COLUMN IF NOT EXISTS shopify_product_id TEXT,
ADD COLUMN IF NOT EXISTS shopify_variant_id TEXT;

-- Store Shopify order references
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS shopify_order_id TEXT,
ADD COLUMN IF NOT EXISTS shopify_order_number TEXT,
ADD COLUMN IF NOT EXISTS shopify_checkout_url TEXT;

-- Track product-scent mappings
CREATE TABLE IF NOT EXISTS shopify_product_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  saved_scent_id UUID REFERENCES saved_scents(id) ON DELETE CASCADE,
  shopify_product_id TEXT NOT NULL,
  shopify_variant_id TEXT NOT NULL,
  size TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE shopify_product_mappings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own mappings
CREATE POLICY "Users can view own product mappings" ON shopify_product_mappings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM saved_scents
    WHERE saved_scents.id = shopify_product_mappings.saved_scent_id
    AND saved_scents.user_id = auth.uid()
  )
);

-- RLS Policy: Users can create mappings for their own scents
CREATE POLICY "Users can create own product mappings" ON shopify_product_mappings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM saved_scents
    WHERE saved_scents.id = shopify_product_mappings.saved_scent_id
    AND saved_scents.user_id = auth.uid()
  )
);

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_shopify_mappings_scent ON shopify_product_mappings(saved_scent_id);
CREATE INDEX IF NOT EXISTS idx_saved_scents_shopify_product ON saved_scents(shopify_product_id);
CREATE INDEX IF NOT EXISTS idx_orders_shopify_order ON orders(shopify_order_id);