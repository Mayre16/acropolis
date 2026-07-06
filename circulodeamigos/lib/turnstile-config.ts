const TEST_SITE_KEY = "1x00000000000000000000AA";

export function isTurnstileBypassContext(): boolean {
  if (typeof window === "undefined") return false;
  if (window.location.hostname.endsWith(".github.io")) return true;
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return true;
  }
  return false;
}

export function turnstileSiteKey(): string {
  if (isTurnstileBypassContext()) return "";
  const fromEnv = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") return TEST_SITE_KEY;
  return "";
}

export function turnstileEnabled(): boolean {
  return turnstileSiteKey() !== "";
}
