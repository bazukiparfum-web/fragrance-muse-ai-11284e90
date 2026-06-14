// Shared safety logic (client). Mirrored in supabase/functions/zuki-chat/safety.ts.
export type BlockReason = "offtopic" | "unsafe" | "injection" | "pii";

// Prompt-injection / jailbreak attempts
const INJECTION = [
  /ignore (all |the )?(previous|prior|above) (instructions|prompts|rules)/i,
  /disregard (your|the) (instructions|system prompt|rules)/i,
  /reveal (your |the )?system prompt/i,
  /what (are|is) your (system )?(prompt|instructions)/i,
  /you are now\b/i,
  /act as (?!.*(perfume|scent|fragrance|bazuki))/i,
  /pretend (to be|you are)/i,
  /\bDAN\b|jailbreak/i,
];

// Adult / hateful / violent / illegal
const UNSAFE = [
  /\b(nude|naked|porn|sex|nsfw|erotic|fuck|sexy time)\b/i,
  /\b(kill|murder|suicide|self[- ]harm|bomb|weapon|gun|terror)\b/i,
  /\b(nigger|faggot|retard|chink|spic|kike)\b/i,
  /\b(rape|molest)\b/i,
];

// PII / payment
const PII = [
  /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/, // card
  /\b\d{4}\s?\d{4}\s?\d{4}\b/, // aadhaar
  /\bcvv\b|\bcvc\b/i,
  /(my|share|give).{0,20}(password|otp|pin)/i,
];

// Competitor pricing comparisons
const COMPETITOR = [
  /\b(chanel|dior|gucci|tom ford|versace|calvin klein|ajmal|nykaa|engage|fogg|wild stone|park avenue|skinn)\b.{0,40}(cheaper|better|vs|compare|price)/i,
  /(cheaper|better|compare).{0,40}\b(chanel|dior|gucci|tom ford|versace|ajmal|nykaa)\b/i,
];

// Off-topic / out-of-scope
const OFFTOPIC = [
  /\b(write|generate|fix|debug).{0,30}(code|python|javascript|sql|essay|poem|homework|assignment)\b/i,
  /\b(who (should|do) i vote|election|prime minister|president|modi|trump|biden|politic)\b/i,
  /\b(medical|diagnose|prescription|disease|symptom|legal advice|lawyer)\b/i,
  /\b(stock tip|crypto|bitcoin price|investment advice)\b/i,
  /\bweather\b|\btime in\b/i,
];

export function classifyInput(text: string): { blocked: boolean; reason?: BlockReason } {
  if (!text || text.length > 2000) return { blocked: true, reason: "unsafe" };
  if (INJECTION.some((r) => r.test(text))) return { blocked: true, reason: "injection" };
  if (UNSAFE.some((r) => r.test(text))) return { blocked: true, reason: "unsafe" };
  if (PII.some((r) => r.test(text))) return { blocked: true, reason: "pii" };
  if (COMPETITOR.some((r) => r.test(text))) return { blocked: true, reason: "offtopic" };
  if (OFFTOPIC.some((r) => r.test(text))) return { blocked: true, reason: "offtopic" };
  return { blocked: false };
}

export function fallbackMessage(reason: BlockReason): string {
  switch (reason) {
    case "injection":
      return "Nice try 😅 I'm Zuki and I only talk perfume. What scent vibe are you after?";
    case "unsafe":
      return "That's outside what I can chat about ✨ — let's stick to fragrance! Want help finding your match?";
    case "pii":
      return "I can't handle personal or payment info here — for order stuff, our team on WhatsApp is way faster 💛";
    case "offtopic":
    default:
      return "I'm your scent sidekick 🌸 — I can only help with Bazuki fragrances, the quiz, gifting, and orders. Want me to recommend a scent?";
  }
}
