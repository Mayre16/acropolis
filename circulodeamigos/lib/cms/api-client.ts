const DEFAULT_CMS_API = "https://editor.acropolis.adesa.com.do/api";

export function cmsApiBase() {
  const fromEnv = process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:3401";
    }
  }
  return DEFAULT_CMS_API;
}
