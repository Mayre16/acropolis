/** Texto y URL al compartir una frase del día (enlace con preview, no el archivo). */

export const FRASE_DEL_DIA_SHARE_TEXT =
  "Vi esta frase en Nueva Acrópolis RD y pensé en ti!";

export const FRASE_DEL_DIA_SHARE_TITLE =
  "Frase del día — Nueva Acrópolis RD";

export function fraseDelDiaSharePath(id: string): string {
  return `/frase/${encodeURIComponent(id)}/`;
}

export function fraseDelDiaShareUrl(id: string, origin?: string): string {
  const base =
    (origin?.replace(/\/$/, "") ||
      (typeof window !== "undefined" ? window.location.origin : "")) ||
    "https://acropolis.org.do";
  return `${base}${fraseDelDiaSharePath(id)}`;
}

export async function shareFraseDelDiaLink(id: string): Promise<void> {
  const url = fraseDelDiaShareUrl(id);
  const title = FRASE_DEL_DIA_SHARE_TITLE;
  const text = FRASE_DEL_DIA_SHARE_TEXT;

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text, url });
      return;
    } catch (e) {
      if ((e as Error)?.name === "AbortError") return;
    }
  }

  const clipboard = `${text}\n${url}`;
  try {
    await navigator.clipboard.writeText(clipboard);
    window.alert("Enlace copiado. Ya puedes pegarlo donde quieras.");
  } catch {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }
}
