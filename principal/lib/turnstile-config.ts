const TEST_SITE_KEY = "1x00000000000000000000AA";

export function turnstileSiteKey(): string {
  const fromEnv = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  if (fromEnv) return fromEnv;
  if (process.env.NODE_ENV !== "production") return TEST_SITE_KEY;
  return "";
}

export function turnstileEnabled(): boolean {
  return turnstileSiteKey() !== "";
}
