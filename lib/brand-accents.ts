/**
 * Acentos de marca cíclicos (Heket · Kefer · Amón · Helios), como en Biblioteca.
 */
export const BRAND_ACCENT_KEYS = ["heket", "kefer", "amon", "helios"] as const;
export type BrandAccentKey = (typeof BRAND_ACCENT_KEYS)[number];

export type AccentTokens = {
  card: string;
  borderTop: string;
  iconWrap: string;
  iconBox: string;
  icon: string;
  link: string;
  check: string;
  eyebrow: string;
  badge: string;
};

export const ACCENT: Record<BrandAccentKey, AccentTokens> = {
  heket: {
    card: "border-na-heket/12 bg-gradient-to-br from-na-surface via-na-surface to-na-heket/[0.12]",
    borderTop: "border-t-4 border-t-na-heket",
    iconWrap: "bg-na-heket/10",
    iconBox: "bg-na-heket text-white shadow-md shadow-na-heket/30",
    icon: "text-na-heket",
    link: "text-na-heket",
    check: "text-na-heket",
    eyebrow: "text-na-heket",
    badge: "bg-na-heket text-white",
  },
  kefer: {
    card: "border-na-kefer/15 bg-gradient-to-br from-na-surface via-na-surface to-na-kefer/[0.14]",
    borderTop: "border-t-4 border-t-na-kefer",
    iconWrap: "bg-na-kefer/10",
    iconBox: "bg-na-kefer text-white shadow-md shadow-na-kefer/30",
    icon: "text-na-kefer",
    link: "text-na-kefer",
    check: "text-na-kefer",
    eyebrow: "text-na-kefer",
    badge: "bg-na-kefer text-white",
  },
  amon: {
    card: "border-na-amon/22 bg-gradient-to-br from-na-surface via-na-surface to-na-amon/[0.16]",
    borderTop: "border-t-4 border-t-na-amon",
    iconWrap: "bg-na-amon/10",
    iconBox: "bg-na-amon text-white shadow-md shadow-na-amon/35",
    icon: "text-na-amon",
    link: "text-na-amon",
    check: "text-na-amon",
    eyebrow: "text-na-amon",
    badge: "bg-na-amon text-white",
  },
  helios: {
    card: "border-na-helios/35 bg-gradient-to-br from-na-surface via-na-surface to-na-helios/[0.22]",
    borderTop: "border-t-4 border-t-na-helios",
    iconWrap: "bg-na-helios/15",
    iconBox: "bg-na-helios text-na-ink shadow-md shadow-na-helios/40",
    icon: "text-na-ink",
    link: "text-na-amon",
    check: "text-na-amon",
    eyebrow: "text-na-amon",
    badge: "bg-na-helios text-na-ink",
  },
};

export function accentAt(index: number): BrandAccentKey {
  return BRAND_ACCENT_KEYS[index % BRAND_ACCENT_KEYS.length];
}

export function accentTokens(index: number): AccentTokens {
  return ACCENT[accentAt(index)];
}

/** Tarjeta con borde superior de acento y fondo en degradado suave. */
export function accentCardShell(index: number, extra = ""): string {
  const a = accentTokens(index);
  return [
    "rounded-2xl border shadow-na-soft transition hover:-translate-y-0.5 hover:shadow-na-card",
    a.borderTop,
    a.card,
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Tarjeta compacta con padding interior. */
export function accentCardClass(index: number, extra = ""): string {
  return accentCardShell(index, `p-5 ${extra}`.trim());
}

/** Eyebrow de sección alternando acentos. */
export function accentEyebrowClass(index: number): string {
  return `text-xs font-bold uppercase tracking-[0.32em] ${accentTokens(index).eyebrow}`;
}

/** Tarjeta de dato destacado (icono sólido + etiqueta de color). */
export function accentInfoCardClass(index: number): string {
  return accentCardShell(index, "p-6");
}
