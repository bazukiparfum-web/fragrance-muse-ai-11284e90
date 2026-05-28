import { supabase } from "@/integrations/supabase/client";

/**
 * Generates a stable, name-based fragrance code.
 * Format: {FRAGRANCE_NAME_SLUG}-{4CHAR_BASE36}
 * Example: "MIDNIGHT-VELVET-7K4Q"
 *
 * - Slug: uppercase A-Z 0-9 + dashes, max 24 chars.
 * - Suffix: 4 random base36 chars, collision-checked against saved_scents.fragrance_code.
 * - The 2nd argument is accepted for backwards compatibility and ignored.
 */
export async function generateFragranceCode(
  nameOrUserId: string,
  legacyName?: string,
): Promise<string> {
  // Backwards-compat: old signature was (userId, userName). New signature is (name).
  // If a 2nd arg is provided we treat it as the scent name (old call sites passed the
  // user name there — close enough for the slug while we migrate).
  const rawName = (legacyName ?? nameOrUserId ?? "Scent").toString();

  const slug = rawName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24) || "SCENT";

  for (let attempt = 0; attempt < 5; attempt++) {
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase().padEnd(4, "X");
    const code = `${slug}-${suffix}`;

    const { data, error } = await supabase
      .from("saved_scents")
      .select("id")
      .eq("fragrance_code", code)
      .maybeSingle();

    if (error || !data) return code;
  }

  // Fallback — extremely unlikely
  return `${slug}-${Date.now().toString(36).slice(-4).toUpperCase()}`;
}
