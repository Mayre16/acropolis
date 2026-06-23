import { bibliotecaLibreriaUrl, SITE_URL } from "@/lib/site-config";

function isSameSite(href: string): boolean {
  try {
    const target = new URL(href);
    const site = new URL(SITE_URL);
    return target.hostname === site.hostname;
  } catch {
    return false;
  }
}

/** Enlaces que muestran aviso antes de salir del sitio principal. */
export function urlNeedsLeavePrompt(href: string): boolean {
  if (!href) return false;
  if (/instagram\.com/i.test(href)) return false;
  if (href === bibliotecaLibreriaUrl() || /tienda\.acropolis\.adesa\.com\.do/i.test(href))
    return true;
  if (/^https?:\/\//i.test(href) && !isSameSite(href)) return true;
  return false;
}

export function getLeaveSiteDestinationLabel(href: string): string {
  if (/instagram\.com/i.test(href)) return "Instagram";
  if (/tienda\.acropolis\.adesa\.com\.do/i.test(href) || href === bibliotecaLibreriaUrl())
    return "la Librería";
  if (/acropolis\.org/i.test(href)) return "Nueva Acrópolis Internacional";
  if (/youtube\.com|youtu\.be/i.test(href)) return "YouTube";
  try {
    return new URL(href).hostname.replace(/^www\./, "");
  } catch {
    return "un sitio externo";
  }
}
