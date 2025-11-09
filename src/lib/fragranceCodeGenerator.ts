import { supabase } from "@/integrations/supabase/client";

/**
 * Generates a unique fragrance code for a user
 * Format: {USERNAME}-{NUMBER} (e.g., "VISHVAM-001")
 */
export async function generateFragranceCode(userId: string, userName: string): Promise<string> {
  // Clean and format the username for the code
  const cleanName = userName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '') // Remove special characters
    .substring(0, 10); // Max 10 characters

  // Get existing codes for this user to find the next number
  const { data: existingScents, error } = await supabase
    .from('saved_scents')
    .select('fragrance_code')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching existing codes:', error);
    // Fallback to 001 if there's an error
    return `${cleanName}-001`;
  }

  // Extract the highest number from existing codes
  let highestNumber = 0;
  if (existingScents && existingScents.length > 0) {
    existingScents.forEach(scent => {
      if (scent.fragrance_code) {
        const match = scent.fragrance_code.match(/-(\d+)$/);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > highestNumber) {
            highestNumber = num;
          }
        }
      }
    });
  }

  // Generate the next code
  const nextNumber = highestNumber + 1;
  const paddedNumber = nextNumber.toString().padStart(3, '0');
  
  return `${cleanName}-${paddedNumber}`;
}
