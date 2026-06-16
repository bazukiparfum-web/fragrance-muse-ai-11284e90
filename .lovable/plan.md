### Goal
Update the Zuki chatbot system prompt to enforce strict answer length limits by replacing the `RESPONSE FORMAT` section.

### Scope
Single file edit in `supabase/functions/zuki-chat/index.ts`.

### Change Detail
Replace lines 106-111 (the existing `RESPONSE FORMAT:` block):
```
RESPONSE FORMAT:
- Keep responses under 80 words usually — short is better
- Use line breaks for readability
- Never write long paragraphs
- End with a question or next step to keep conversation going
- Never say "I'm an AI" or "As an AI" — you're Zuki!
```

With the new strict response format rules provided, which include:
- Maximum 65 words per bubble (split into 2 bubbles if needed with 400ms delay)
- Minimum 10 words per bubble
- Max 2-3 sentences per bubble, short sentences
- 1 emoji max, no bold markdown, no bullet points, no numbered lists
- Quiz navigation instruction ("Here's the link to get started!" only)
- Pattern avoidance rules
- Ideal response examples (good vs bad)

### What Will NOT Change
- Personality section
- ABOUT BAZUKI / PRODUCTS / SCENT KNOWLEDGE / SCENT FAMILIES
- WHAT YOU CAN HELP WITH / WHAT YOU CANNOT DO
- ESCALATION / CONTEXT AWARENESS / EMAIL CAPTURE
- SAFETY RULES
- Any edge function logic (rate limiting, CORS, streaming, safety gates)