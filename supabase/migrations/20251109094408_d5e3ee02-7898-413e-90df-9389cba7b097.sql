-- Phase 1: Add sharing capabilities to saved_scents table
ALTER TABLE saved_scents ADD COLUMN share_token TEXT UNIQUE;
ALTER TABLE saved_scents ADD COLUMN is_public BOOLEAN DEFAULT false;
ALTER TABLE saved_scents ADD COLUMN share_count INTEGER DEFAULT 0;
ALTER TABLE saved_scents ADD COLUMN last_shared_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_saved_scents_share_token ON saved_scents(share_token) WHERE share_token IS NOT NULL;

-- Phase 2: Create referrals table to track referral relationships
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT UNIQUE NOT NULL,
  fragrance_id UUID REFERENCES saved_scents(id) ON DELETE SET NULL,
  uses_count INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days')
);

CREATE INDEX idx_referrals_code ON referrals(referral_code);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_id);

-- Enable RLS on referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals
CREATE POLICY "Users can view own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create own referrals"
  ON referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update own referrals"
  ON referrals FOR UPDATE
  USING (auth.uid() = referrer_id);

-- Phase 3: Create referral_rewards table to track discount eligibility
CREATE TABLE referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referral_id UUID NOT NULL REFERENCES referrals(id) ON DELETE CASCADE,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referee_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referee_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired', 'used')),
  referrer_discount_amount INTEGER DEFAULT 100,
  referee_discount_amount INTEGER DEFAULT 100,
  referrer_discount_used BOOLEAN DEFAULT false,
  referee_discount_used BOOLEAN DEFAULT false,
  referee_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_referral_rewards_referrer ON referral_rewards(referrer_id);
CREATE INDEX idx_referral_rewards_referee ON referral_rewards(referee_id);
CREATE INDEX idx_referral_rewards_status ON referral_rewards(status);

-- Enable RLS on referral_rewards
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referral_rewards
CREATE POLICY "Users can view own rewards"
  ON referral_rewards FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referee_id);

CREATE POLICY "System can create rewards"
  ON referral_rewards FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update rewards"
  ON referral_rewards FOR UPDATE
  USING (true);

-- Phase 4: Add referral tracking to orders table
ALTER TABLE orders ADD COLUMN referral_reward_id UUID REFERENCES referral_rewards(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN discount_applied INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN discount_code TEXT;

-- Phase 5: Update saved_scents RLS to allow public read for shared fragrances
CREATE POLICY "Anyone can view public shared scents"
  ON saved_scents FOR SELECT
  USING (is_public = true AND share_token IS NOT NULL);