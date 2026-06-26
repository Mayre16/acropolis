/** URLs de vista previa del sitio en iframe (GitHub Pages en producción, localhost en dev). */

const GH_USER = process.env.NEXT_PUBLIC_GITHUB_PAGES_USER?.trim() || "mayre16";
const GH_REPO = process.env.NEXT_PUBLIC_GITHUB_PAGES_REPO?.trim() || "acropolis";
const GH_BASE = `https://${GH_USER}.github.io/${GH_REPO}`;

function isLocalPreviewHost(): boolean {
  if (typeof window === "undefined") {
    return process.env.NODE_ENV === "development";
  }
  const h = window.location.hostname;
  return h === "localhost" || h === "127.0.0.1";
}

function resolveSiteUrl(
  envKey: string | undefined,
  localPort: number,
  ghSlug: string,
): string {
  const fromEnv = envKey?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (isLocalPreviewHost()) return `http://localhost:${localPort}`;
  return `${GH_BASE}/${ghSlug}`;
}

export function previewPrincipalUrl(): string {
  return resolveSiteUrl(
    process.env.NEXT_PUBLIC_PRINCIPAL_URL,
    3100,
    "principal",
  );
}

export function previewCivisUrl(): string {
  return resolveSiteUrl(process.env.NEXT_PUBLIC_CIVIS_URL, 3200, "civis");
}

export function previewTiendaUrl(): string {
  return resolveSiteUrl(process.env.NEXT_PUBLIC_TIENDA_URL, 3300, "tienda");
}
