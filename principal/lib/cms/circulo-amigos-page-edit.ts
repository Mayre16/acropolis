import {
  CIRCULO_AMIGOS_BENEFICIOS,
  CIRCULO_AMIGOS_EMAIL,
  CIRCULO_AMIGOS_ESPERAMOS,
  CIRCULO_AMIGOS_HERO,
  CIRCULO_AMIGOS_IMAGE,
  CIRCULO_AMIGOS_INTRO,
  CIRCULO_AMIGOS_INTRO_IMAGES,
  CIRCULO_AMIGOS_NOTA_LEGAL,
  CIRCULO_AMIGOS_PASOS,
  CIRCULO_AMIGOS_PILARES,
  CIRCULO_AMIGOS_RECIBES,
} from "@/lib/circulo-amigos-content";
import type {
  CmsCirculoAmigosCard,
  CmsCirculoAmigosPage,
  CmsCirculoAmigosPaso,
} from "@/lib/cms/types";

export const CIRCULO_INTRO_SECTION_ID = "__circulo-intro__";
export const CIRCULO_PILARES_SECTION_ID = "__circulo-pilares__";
export const CIRCULO_BENEFICIOS_SECTION_ID = "__circulo-beneficios__";
export const CIRCULO_PASOS_SECTION_ID = "__circulo-pasos__";
export const CIRCULO_RECIBES_SECTION_ID = "__circulo-recibes__";
export const CIRCULO_ESPERAMOS_SECTION_ID = "__circulo-esperamos__";
export const CIRCULO_CTA_SECTION_ID = "__circulo-cta__";

const PILAR_IDS = ["fraternidad", "conocimiento", "desarrollo"] as const;
const BENEFICIO_IDS = ["actividades", "mundo", "informado", "ideas"] as const;
const PASO_IDS = ["inscribe", "conecta", "participa"] as const;

export const DEFAULT_CIRCULO_AMIGOS_PAGE: CmsCirculoAmigosPage = {
  heroEyebrow: CIRCULO_AMIGOS_HERO.eyebrow,
  heroTitle: CIRCULO_AMIGOS_HERO.title,
  heroSubtitle: CIRCULO_AMIGOS_HERO.subtitle,
  heroLede: CIRCULO_AMIGOS_HERO.lede,
  heroImageSrc: CIRCULO_AMIGOS_IMAGE.src,
  heroImageAlt: CIRCULO_AMIGOS_IMAGE.alt,
  introEyebrow: "¿Qué es el Círculo de Amigos?",
  introParagraphs: [...CIRCULO_AMIGOS_INTRO],
  introBannerSrc: CIRCULO_AMIGOS_INTRO_IMAGES.foto.src,
  introBannerAlt: CIRCULO_AMIGOS_INTRO_IMAGES.foto.alt,
  introGrupoSrc: "",
  introGrupoAlt: "",
  pilaresTitle: "Nuestros tres pilares",
  pilares: CIRCULO_AMIGOS_PILARES.map((item, i) => ({
    id: PILAR_IDS[i],
    title: item.title,
    text: item.text,
    imageSrc: item.image,
    imageAlt: item.title,
  })),
  beneficiosTitle: "Beneficios exclusivos para ti",
  beneficios: CIRCULO_AMIGOS_BENEFICIOS.map((item, i) => ({
    id: BENEFICIO_IDS[i],
    title: item.title,
    text: item.text,
    imageSrc: item.image,
    imageAlt: item.title,
  })),
  pasosTitle: "Cómo unirte en tres pasos sencillos",
  pasos: CIRCULO_AMIGOS_PASOS.map((step, i) => ({
    id: PASO_IDS[i],
    n: step.n,
    title: step.title,
    text: step.text,
    imageSrc: step.image,
    imageAlt: step.title,
  })),
  recibesTitle: "Lo que recibirás al unirte",
  recibesItems: [...CIRCULO_AMIGOS_RECIBES],
  esperamosTitle: "Lo que esperamos de ti",
  esperamosItems: [...CIRCULO_AMIGOS_ESPERAMOS],
  ctaTitle: "¿Listo para dar el paso?",
  ctaText:
    "Únete a nosotros y forma parte de un movimiento que busca un mundo mejor.",
  ctaEmail: CIRCULO_AMIGOS_EMAIL,
  notaLegal: CIRCULO_AMIGOS_NOTA_LEGAL,
};

function mergeCards(
  defaults: CmsCirculoAmigosCard[],
  overrides?: CmsCirculoAmigosCard[] | null,
): CmsCirculoAmigosCard[] {
  if (!overrides?.length) return defaults;
  const defaultIds = new Set(defaults.map((d) => d.id));
  const byId = new Map(overrides.map((c) => [c.id, c]));
  const merged = defaults.map((d) => ({ ...d, ...byId.get(d.id) }));
  for (const item of overrides) {
    if (!defaultIds.has(item.id)) merged.push(item);
  }
  return merged;
}

function mergePasos(
  defaults: CmsCirculoAmigosPaso[],
  overrides?: CmsCirculoAmigosPaso[] | null,
): CmsCirculoAmigosPaso[] {
  if (!overrides?.length) return defaults;
  const defaultIds = new Set(defaults.map((d) => d.id));
  const byId = new Map(overrides.map((c) => [c.id, c]));
  const merged = defaults.map((d) => ({ ...d, ...byId.get(d.id) }));
  for (const item of overrides) {
    if (!defaultIds.has(item.id)) merged.push(item);
  }
  return merged.map((p, i) => ({ ...p, n: p.n || i + 1 }));
}

function mergeLines(defaults: string[], overrides?: string[] | null): string[] {
  if (!overrides?.length) return defaults;
  if (overrides.length >= defaults.length) return overrides.filter(Boolean);
  return overrides
    .map((line, i) => line.trim() || defaults[i] || line)
    .filter(Boolean);
}

export function newCirculoCardId(kind: "pilar" | "beneficio" | "paso") {
  return `${kind}-${Date.now().toString(36)}`;
}

export const CIRCULO_CARD_PLACEHOLDER_IMAGE =
  "/img/circulo-amigos/banner-quienes.webp";

export function mergeCirculoAmigosPage(
  overrides?: CmsCirculoAmigosPage | null,
): CmsCirculoAmigosPage {
  const base = DEFAULT_CIRCULO_AMIGOS_PAGE;
  if (!overrides) return base;
  return {
    ...base,
    ...overrides,
    introParagraphs: overrides.introParagraphs?.length
      ? overrides.introParagraphs
      : base.introParagraphs,
    pilares: mergeCards(base.pilares!, overrides.pilares),
    beneficios: mergeCards(base.beneficios!, overrides.beneficios),
    pasos: mergePasos(base.pasos!, overrides.pasos),
    recibesItems: mergeLines(base.recibesItems!, overrides.recibesItems),
    esperamosItems: mergeLines(base.esperamosItems!, overrides.esperamosItems),
  };
}

export function parseCirculoCardSelectedId(selectedId: string | null):
  | { kind: "pilar" | "beneficio" | "paso"; id: string }
  | null {
  if (!selectedId) return null;
  const m = selectedId.match(/^circulo-(pilar|beneficio|paso)-(.+)$/);
  if (!m) return null;
  return { kind: m[1] as "pilar" | "beneficio" | "paso", id: m[2] };
}

export function circuloCardSelectedId(
  kind: "pilar" | "beneficio" | "paso",
  id: string,
) {
  return `circulo-${kind}-${id}`;
}
