// Referral code persistence: localStorage + 30-day cookie so the code
// survives navigation and re-visits and can be auto-applied at checkout.

const KEY = "bzk_ref";
const COOKIE_DAYS = 30;

export function readStoredRef(): string | null {
  try {
    const ls = typeof window !== "undefined" ? window.localStorage.getItem(KEY) : null;
    if (ls) return ls;
    if (typeof document === "undefined") return null;
    const match = document.cookie.match(/(?:^|;\s*)bzk_ref=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

export function persistRef(code: string) {
  const c = code.trim().toUpperCase();
  if (!c) return;
  try {
    window.localStorage.setItem(KEY, c);
  } catch {
    /* ignore */
  }
  try {
    const exp = new Date(Date.now() + COOKIE_DAYS * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `bzk_ref=${encodeURIComponent(c)}; expires=${exp}; path=/; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export function clearRef() {
  try { window.localStorage.removeItem(KEY); } catch { /* ignore */ }
  try {
    document.cookie = "bzk_ref=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax";
  } catch { /* ignore */ }
}

export function readRefFromUrl(): string | null {
  try {
    const url = new URL(window.location.href);
    const ref = url.searchParams.get("ref");
    if (!ref) return null;
    const c = ref.trim().toUpperCase();
    return /^BZK-[A-Z0-9]{4}$/.test(c) ? c : null;
  } catch {
    return null;
  }
}
