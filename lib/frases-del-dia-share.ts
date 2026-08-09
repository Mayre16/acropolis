/** Texto y URL al compartir una frase del día (enlace con preview, no el archivo). */

export const DIAS_FRASE = [
  { slug: "Domingo", saludo: "¡Excelente Domingo!" },
  { slug: "Lunes", saludo: "¡Excelente Lunes!" },
  { slug: "Martes", saludo: "¡Excelente Martes!" },
  { slug: "Miercoles", saludo: "¡Excelente Miércoles!" },
  { slug: "Jueves", saludo: "¡Excelente Jueves!" },
  { slug: "Viernes", saludo: "¡Excelente Viernes!" },
  { slug: "Sabado", saludo: "¡Excelente Sábado!" },
] as const;

export type DiaFraseSlug = (typeof DIAS_FRASE)[number]["slug"];

export function getDiaFromIndex(index: number): (typeof DIAS_FRASE)[number] {
  return DIAS_FRASE[index % 7] ?? DIAS_FRASE[0];
}

export function getIndexFromSlug(slug: string): number {
  const idx = DIAS_FRASE.findIndex(
    (d) => d.slug.toLowerCase() === slug.toLowerCase()
  );
  return idx >= 0 ? idx : 0;
}

export const FRASE_DEL_DIA_SHARE_TITLE =
  "Frase del día — Nueva Acrópolis RD";

export function fraseDelDiaSharePath(dayIndexOrSlug: number | string): string {
  const slug =
    typeof dayIndexOrSlug === "number"
      ? getDiaFromIndex(dayIndexOrSlug).slug
      : dayIndexOrSlug;
  return `/frase/${encodeURIComponent(slug)}/`;
}

export function fraseDelDiaShareUrl(
  dayIndexOrSlug: number | string,
  origin?: string
): string {
  const base =
    (origin?.replace(/\/$/, "") ||
      (typeof window !== "undefined" ? window.location.origin : "")) ||
    "https://acropolis.org.do";
  return `${base}${fraseDelDiaSharePath(dayIndexOrSlug)}`;
}

export function fraseDelDiaShareText(dayIndex: number): string {
  const dia = getDiaFromIndex(dayIndex);
  return `${dia.saludo} Vi esta frase en Nueva Acrópolis RD y pensé en ti.`;
}

export async function shareFraseDelDiaLink(dayIndex: number): Promise<void> {
  const url = fraseDelDiaShareUrl(dayIndex);
  const title = FRASE_DEL_DIA_SHARE_TITLE;
  const text = fraseDelDiaShareText(dayIndex);

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

/** @deprecated Use shareFraseDelDiaLink(dayIndex) instead */
export async function shareFraseDelDiaLinkById(id: string): Promise<void> {
  const url = `https://acropolis.org.do/frase/${encodeURIComponent(id)}/`;
  const title = FRASE_DEL_DIA_SHARE_TITLE;
  const text = "Vi esta frase en Nueva Acrópolis RD y pensé en ti!";

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
