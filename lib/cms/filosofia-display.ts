"use client";

import { useFilosofiaCmsEdit } from "@/components/filosofia/cms/FilosofiaCmsEditContext";
import {
  DEFAULT_FILOSOFIA_PAGE_BODY,
  FILOSOFIA_AVANZADOS_DEFAULTS,
  FILOSOFIA_CTA_DEFAULTS,
  FILOSOFIA_CURSO_DEFAULTS,
  FILOSOFIA_ES_PARA_TI_DEFAULTS,
  FILOSOFIA_MODULOS_DEFAULTS,
  FILOSOFIA_PROGRAMA_DEFAULTS,
  FILOSOFIA_TEMARIO_DEFAULTS,
  FILOSOFIA_TEMARIO_SECTION,
} from "@/lib/filosofia-content";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";
import type {
  CmsFilosofiaCard,
  CmsFilosofiaFaqItem,
  CmsFilosofiaLabeledValue,
  CmsFilosofiaPage,
} from "@/lib/cms/types";

export function mergeFilosofiaCards(
  defaults: CmsFilosofiaCard[],
  overrides?: CmsFilosofiaCard[],
): CmsFilosofiaCard[] {
  if (!overrides?.length) return defaults;
  const byId = new Map(overrides.map((c) => [c.id, c]));
  return defaults.map((d) => {
    const o = byId.get(d.id);
    return o ? { ...d, ...o } : d;
  });
}

export function mergeFilosofiaFaq(
  defaults: CmsFilosofiaFaqItem[],
  overrides?: CmsFilosofiaFaqItem[],
): CmsFilosofiaFaqItem[] {
  if (!overrides?.length) return defaults;
  const byId = new Map(overrides.map((c) => [c.id, c]));
  return defaults.map((d) => {
    const o = byId.get(d.id);
    return o ? { ...d, ...o } : d;
  });
}

function resolveCard(card: CmsFilosofiaCard): CmsFilosofiaCard {
  return {
    ...card,
    src: resolveCmsMediaUrl(card.src) ?? card.src,
  };
}

function resolveCards(cards: CmsFilosofiaCard[]): CmsFilosofiaCard[] {
  return cards.map(resolveCard);
}

function resolveImage(src?: string): string {
  return resolveCmsMediaUrl(src) ?? src ?? "";
}

function pickPage(
  published?: CmsFilosofiaPage | null,
  draft?: CmsFilosofiaPage | null,
  editReady?: boolean,
): CmsFilosofiaPage | null {
  if (editReady && draft) return draft;
  if (isCmsEnabled() && published) return published;
  return null;
}

function mergeLabeledValues(
  defaults: CmsFilosofiaLabeledValue[],
  overrides?: CmsFilosofiaLabeledValue[],
): CmsFilosofiaLabeledValue[] {
  if (!overrides?.length) return defaults;
  return defaults.map((d, i) => ({ ...d, ...(overrides[i] ?? {}) }));
}

function mergeStringList(defaults: string[], overrides?: string[]): string[] {
  if (!overrides?.length) return defaults;
  return overrides;
}

function useFilosofiaPageDraft(): CmsFilosofiaPage | null {
  const cms = useCmsDocument();
  const edit = useFilosofiaCmsEdit();
  return pickPage(cms?.sections.filosofiaPage, edit?.filosofiaPage, edit?.ready);
}

export function useFilosofiaProgramaDisplay() {
  const page = useFilosofiaPageDraft();
  return {
    eyebrow: page?.programaEyebrow ?? FILOSOFIA_PROGRAMA_DEFAULTS.eyebrow,
    title: page?.programaTitle ?? FILOSOFIA_PROGRAMA_DEFAULTS.title,
    paragraphs: mergeStringList(
      [...FILOSOFIA_PROGRAMA_DEFAULTS.paragraphs],
      page?.programaParagraphs,
    ),
    imageSrc: resolveImage(
      page?.programaImageSrc ?? FILOSOFIA_PROGRAMA_DEFAULTS.imageSrc,
    ),
    imageAlt: page?.programaImageAlt ?? FILOSOFIA_PROGRAMA_DEFAULTS.imageAlt,
  };
}

export function useFilosofiaCursoDisplay() {
  const page = useFilosofiaPageDraft();
  return {
    eyebrow: page?.cursoEyebrow ?? FILOSOFIA_CURSO_DEFAULTS.eyebrow,
    subtitle: page?.cursoSubtitle ?? FILOSOFIA_CURSO_DEFAULTS.subtitle,
    title: page?.cursoTitle ?? FILOSOFIA_CURSO_DEFAULTS.title,
    lede: page?.cursoLede ?? FILOSOFIA_CURSO_DEFAULTS.lede,
    heroImageSrc: resolveImage(
      page?.cursoHeroImageSrc ?? FILOSOFIA_CURSO_DEFAULTS.heroImageSrc,
    ),
    heroImageAlt: page?.cursoHeroImageAlt ?? FILOSOFIA_CURSO_DEFAULTS.heroImageAlt,
    aprenderasTitle: page?.aprenderasTitle ?? FILOSOFIA_CURSO_DEFAULTS.aprenderasTitle,
    aprenderas: mergeStringList(
      [...FILOSOFIA_CURSO_DEFAULTS.aprenderas],
      page?.aprenderas,
    ),
    cursoInfoTitle: page?.cursoInfoTitle ?? FILOSOFIA_CURSO_DEFAULTS.cursoInfoTitle,
    cursoInfoLede: page?.cursoInfoLede ?? FILOSOFIA_CURSO_DEFAULTS.cursoInfoLede,
    cursoInfo: mergeLabeledValues(
      FILOSOFIA_CURSO_DEFAULTS.cursoInfo.map((x) => ({ ...x })),
      page?.cursoInfo,
    ),
    incluyeLabel: page?.incluyeLabel ?? FILOSOFIA_CURSO_DEFAULTS.incluyeLabel,
    incluye: mergeStringList([...FILOSOFIA_CURSO_DEFAULTS.incluye], page?.incluye),
    modulosTitle: page?.modulosTitle ?? FILOSOFIA_CURSO_DEFAULTS.modulosTitle,
    modulos: resolveCards(
      mergeFilosofiaCards(FILOSOFIA_MODULOS_DEFAULTS, page?.modulos),
    ),
  };
}

export function useFilosofiaTemarioDisplay() {
  const page = useFilosofiaPageDraft();
  return {
    eyebrow: page?.temarioEyebrow ?? FILOSOFIA_TEMARIO_SECTION.eyebrow,
    title: page?.temarioTitle ?? FILOSOFIA_TEMARIO_SECTION.title,
    intro: page?.temarioIntro ?? FILOSOFIA_TEMARIO_SECTION.intro,
    items: resolveCards(
      mergeFilosofiaCards(FILOSOFIA_TEMARIO_DEFAULTS, page?.temario),
    ),
  };
}

export function useFilosofiaAvanzadosDisplay() {
  const page = useFilosofiaPageDraft();
  return {
    eyebrow: page?.avanzadosEyebrow ?? FILOSOFIA_AVANZADOS_DEFAULTS.eyebrow,
    title: page?.avanzadosTitle ?? FILOSOFIA_AVANZADOS_DEFAULTS.title,
    paragraphs: mergeStringList(
      [...FILOSOFIA_AVANZADOS_DEFAULTS.paragraphs],
      page?.avanzadosParagraphs,
    ),
    materias: mergeStringList(
      [...FILOSOFIA_AVANZADOS_DEFAULTS.materias],
      page?.avanzadosMaterias,
    ),
    imageSrc: resolveImage(
      page?.avanzadosImageSrc ?? FILOSOFIA_AVANZADOS_DEFAULTS.imageSrc,
    ),
    imageAlt: page?.avanzadosImageAlt ?? FILOSOFIA_AVANZADOS_DEFAULTS.imageAlt,
    imageCaption:
      page?.avanzadosImageCaption ?? FILOSOFIA_AVANZADOS_DEFAULTS.imageCaption,
  };
}

export function useFilosofiaEsParaTiDisplay() {
  const page = useFilosofiaPageDraft();
  return {
    title: page?.esParaTiTitle ?? FILOSOFIA_ES_PARA_TI_DEFAULTS.title,
    items: mergeFilosofiaFaq(
      FILOSOFIA_ES_PARA_TI_DEFAULTS.items.map((x) => ({ ...x })),
      page?.esParaTi,
    ),
  };
}

export function useFilosofiaCtaDisplay() {
  const page = useFilosofiaPageDraft();
  return {
    title: page?.ctaTitle ?? FILOSOFIA_CTA_DEFAULTS.title,
    text: page?.ctaText ?? FILOSOFIA_CTA_DEFAULTS.text,
    whatsappNumber:
      page?.ctaWhatsappNumber?.trim() || FILOSOFIA_CTA_DEFAULTS.whatsappNumber,
    whatsappMessage:
      page?.ctaWhatsappMessage ?? FILOSOFIA_CTA_DEFAULTS.whatsappMessage,
    buttonLabel: page?.ctaButtonLabel ?? FILOSOFIA_CTA_DEFAULTS.buttonLabel,
    imageSrc: resolveImage(page?.ctaImageSrc ?? FILOSOFIA_CTA_DEFAULTS.imageSrc),
    imageAlt: page?.ctaImageAlt ?? FILOSOFIA_CTA_DEFAULTS.imageAlt,
  };
}

export { DEFAULT_FILOSOFIA_PAGE_BODY };

export function filosofiaCardSelectedId(kind: "modulo" | "temario", id: string) {
  return `${kind}:${id}`;
}

export function parseFilosofiaCardSelectedId(
  selectedId: string | null,
): { kind: "modulo" | "temario"; id: string } | null {
  if (!selectedId) return null;
  const m = selectedId.match(/^(modulo|temario):(.+)$/);
  if (!m) return null;
  return { kind: m[1] as "modulo" | "temario", id: m[2] };
}

export function filosofiaFaqSelectedId(id: string) {
  return `faq:${id}`;
}

export function parseFilosofiaFaqSelectedId(
  selectedId: string | null,
): string | null {
  if (!selectedId?.startsWith("faq:")) return null;
  return selectedId.slice(4);
}
