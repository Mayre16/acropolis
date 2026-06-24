"use client";

import { useVoluntariadoCmsEdit } from "@/components/cms/VoluntariadoCmsEditContext";
import {
  DEFAULT_VOLUNTARIADO_PAGE,
  VOLUNTARIADO_ESFERA_SECTION,
  VOLUNTARIADO_PARTICIPACION_SECTION,
  VOLUNTARIADO_QUE_HACEMOS_DEFAULTS,
  VOLUNTARIADO_QUE_HACEMOS_SECTION,
  VOLUNTARIADO_RECIENTES_DEFAULTS,
  VOLUNTARIADO_RECIENTES_SECTION,
  VOLUNTARIADO_SOSTENIBILIDAD_DEFAULTS,
  VOLUNTARIADO_SOSTENIBILIDAD_SECTION,
} from "@/lib/voluntariado-content";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";
import { getVoluntariadoRecientesFromEventos } from "@/lib/voluntariado-eventos-recientes";
import type {
  CmsVoluntariadoCard,
  CmsVoluntariadoInfoCard,
  CmsVoluntariadoPage,
  CmsVoluntariadoReciente,
} from "@/lib/cms/types";

export const VOLUNTARIADO_QUE_HACEMOS_SECTION_ID = "__vol-que-hacemos-section__";
export const VOLUNTARIADO_ESFERA_SECTION_ID = "__vol-esfera-section__";
export const VOLUNTARIADO_SOSTENIBILIDAD_SECTION_ID = "__vol-sostenibilidad-section__";
export const VOLUNTARIADO_PARTICIPACION_SECTION_ID = "__vol-participacion-section__";
export const VOLUNTARIADO_RECIENTES_SECTION_ID = "__vol-recientes-section__";
export const VOLUNTARIADO_PROXIMAS_SECTION_ID = "__section__";

export function voluntariadoQueHacemosCardId(id: string) {
  return `vol-que-hacemos:${id}`;
}

export function voluntariadoSostenibilidadCardId(id: string) {
  return `vol-sostenibilidad:${id}`;
}

export function voluntariadoRecienteId(id: string) {
  return `vol-reciente:${id}`;
}

export function parseVoluntariadoCardSelectedId(
  selectedId: string | null,
):
  | { kind: "que-hacemos"; id: string }
  | { kind: "sostenibilidad"; id: string }
  | { kind: "reciente"; id: string }
  | null {
  if (!selectedId) return null;
  const qh = selectedId.match(/^vol-que-hacemos:(.+)$/);
  if (qh) return { kind: "que-hacemos", id: qh[1] };
  const st = selectedId.match(/^vol-sostenibilidad:(.+)$/);
  if (st) return { kind: "sostenibilidad", id: st[1] };
  const rc = selectedId.match(/^vol-reciente:(.+)$/);
  if (rc) return { kind: "reciente", id: rc[1] };
  return null;
}

export function mergeVoluntariadoCards<T extends { id: string }>(
  defaults: T[],
  overrides?: T[],
): T[] {
  if (!overrides?.length) return defaults;
  const byId = new Map(overrides.map((c) => [c.id, c]));
  return defaults.map((d) => {
    const o = byId.get(d.id);
    return o ? { ...d, ...o } : d;
  });
}

export function mergeVoluntariadoPage(
  overrides?: CmsVoluntariadoPage | null,
): CmsVoluntariadoPage {
  return {
    ...DEFAULT_VOLUNTARIADO_PAGE,
    ...overrides,
    queHacemosCards: mergeVoluntariadoCards(
      VOLUNTARIADO_QUE_HACEMOS_DEFAULTS,
      overrides?.queHacemosCards,
    ),
    sostenibilidadCards: mergeVoluntariadoCards(
      VOLUNTARIADO_SOSTENIBILIDAD_DEFAULTS,
      overrides?.sostenibilidadCards,
    ),
    recientesItems: mergeVoluntariadoRecientes(
      VOLUNTARIADO_RECIENTES_DEFAULTS,
      overrides?.recientesItems,
    ),
  };
}

export function mergeVoluntariadoRecientes(
  defaults: CmsVoluntariadoReciente[],
  overrides?: CmsVoluntariadoReciente[],
): CmsVoluntariadoReciente[] {
  if (!overrides?.length) return defaults;
  const defaultById = new Map(defaults.map((d) => [d.id, d]));
  return overrides.map((o) => ({ ...defaultById.get(o.id), ...o }));
}

function pickPage(
  published?: CmsVoluntariadoPage | null,
  draft?: CmsVoluntariadoPage | null,
  editReady?: boolean,
): CmsVoluntariadoPage {
  if (editReady && draft) return mergeVoluntariadoPage(draft);
  if (isCmsEnabled() && published) return mergeVoluntariadoPage(published);
  return mergeVoluntariadoPage(null);
}

function resolveQueHacemosCard(card: CmsVoluntariadoCard): CmsVoluntariadoCard {
  return {
    ...card,
    src: resolveCmsMediaUrl(card.src) ?? card.src,
  };
}

function resolveManualSrc(src: string): string {
  return resolveCmsMediaUrl(src) ?? src;
}

export function useVoluntariadoPageDisplay() {
  const cms = useCmsDocument();
  const edit = useVoluntariadoCmsEdit();
  return pickPage(cms?.sections.voluntariadoPage, edit?.page, edit?.ready);
}

export function useVoluntariadoQueHacemosDisplay() {
  const page = useVoluntariadoPageDisplay();
  return {
    eyebrow: page.queHacemosEyebrow ?? VOLUNTARIADO_QUE_HACEMOS_SECTION.eyebrow,
    title: page.queHacemosTitle ?? VOLUNTARIADO_QUE_HACEMOS_SECTION.title,
    intro: page.queHacemosIntro ?? VOLUNTARIADO_QUE_HACEMOS_SECTION.intro,
    cards: page.queHacemosCards.map(resolveQueHacemosCard),
  };
}

export function useVoluntariadoEsferaDisplay() {
  const page = useVoluntariadoPageDisplay();
  return {
    eyebrow: page.esferaEyebrow ?? VOLUNTARIADO_ESFERA_SECTION.eyebrow,
    title: page.esferaTitle ?? VOLUNTARIADO_ESFERA_SECTION.title,
    intro: page.esferaIntro ?? VOLUNTARIADO_ESFERA_SECTION.intro,
    intro2: page.esferaIntro2 ?? VOLUNTARIADO_ESFERA_SECTION.intro2,
    ctaPrimary: page.esferaCtaPrimary ?? VOLUNTARIADO_ESFERA_SECTION.ctaPrimary,
    ctaSecondary:
      page.esferaCtaSecondary ?? VOLUNTARIADO_ESFERA_SECTION.ctaSecondary,
    manualCaption:
      page.esferaManualCaption ?? VOLUNTARIADO_ESFERA_SECTION.manualCaption,
    manualImageSrc: resolveManualSrc(
      page.esferaManualImageSrc ?? VOLUNTARIADO_ESFERA_SECTION.manualImageSrc,
    ),
    manualImageAlt:
      page.esferaManualImageAlt ?? VOLUNTARIADO_ESFERA_SECTION.manualImageAlt,
  };
}

export function useVoluntariadoSostenibilidadDisplay() {
  const page = useVoluntariadoPageDisplay();
  return {
    eyebrow:
      page.sostenibilidadEyebrow ?? VOLUNTARIADO_SOSTENIBILIDAD_SECTION.eyebrow,
    title: page.sostenibilidadTitle ?? VOLUNTARIADO_SOSTENIBILIDAD_SECTION.title,
    intro: page.sostenibilidadIntro ?? VOLUNTARIADO_SOSTENIBILIDAD_SECTION.intro,
    cards: page.sostenibilidadCards ?? VOLUNTARIADO_SOSTENIBILIDAD_DEFAULTS,
  };
}

export function useVoluntariadoParticipacionDisplay() {
  const page = useVoluntariadoPageDisplay();
  return {
    eyebrow:
      page.participacionEyebrow ?? VOLUNTARIADO_PARTICIPACION_SECTION.eyebrow,
    title: page.participacionTitle ?? VOLUNTARIADO_PARTICIPACION_SECTION.title,
    intro: page.participacionIntro ?? VOLUNTARIADO_PARTICIPACION_SECTION.intro,
  };
}

function resolveRecienteItem(
  item: CmsVoluntariadoReciente,
): CmsVoluntariadoReciente {
  return {
    ...item,
    src: resolveCmsMediaUrl(item.src) ?? item.src,
  };
}

export function useVoluntariadoRecientesDisplay() {
  const cms = useCmsDocument();
  const edit = useVoluntariadoCmsEdit();
  const page = useVoluntariadoPageDisplay();
  const fromEventos = getVoluntariadoRecientesFromEventos(cms);
  const items =
    edit?.ready && edit.page.recientesItems?.length
      ? edit.page.recientesItems.map(resolveRecienteItem)
      : fromEventos.map(resolveRecienteItem);

  return {
    eyebrow: page.recientesEyebrow ?? VOLUNTARIADO_RECIENTES_SECTION.eyebrow,
    title: page.recientesTitle ?? VOLUNTARIADO_RECIENTES_SECTION.title,
    intro: page.recientesIntro ?? VOLUNTARIADO_RECIENTES_SECTION.intro,
    items,
  };
}
