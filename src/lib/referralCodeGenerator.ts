import { supabase } from '@/integrations/supabase/client';

/**
 * Generates a unique referral code in the format: USERNAME-XXXXX
 * Example: VISHVAM-BZK7X
 */
export async function generateReferralCode(userName: string): Promise<string> {
  const sanitizedName = userName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 10);
  
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded ambiguous chars
  let code: string;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Generate random suffix
    let suffix = '';
    for (let i = 0; i < 5; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    code = `${sanitizedName}-${suffix}`;
    
    // Check if code already exists
    const { data, error } = await supabase
      .from('referrals')
      .select('id')
      .eq('referral_code', code)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking referral code uniqueness:', error);
      attempts++;
      continue;
    }
    
    if (!data) {
      isUnique = true;
      return code;
    }
    
    attempts++;
  }
  
  // Fallback: add timestamp if all attempts failed
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `${sanitizedName}-${timestamp}`;
}

/**
 * Validates a referral code format
 */
export function isValidReferralCodeFormat(code: string): boolean {
  return /^[A-Z0-9]+-[A-Z0-9]{4,5}$/.test(code);
}
