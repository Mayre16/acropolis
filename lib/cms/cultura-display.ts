"use client";

import { useCulturaCmsEdit } from "@/components/cms/CulturaCmsEditContext";
import {
  CULTURA_EVENTOS_PREVIEW_DEFAULTS,
  CULTURA_EVENTOS_SECTION,
  CULTURA_TALLERES_DEFAULTS,
  CULTURA_TALLERES_SECTION,
  CULTURA_VIAJES_SECTION,
} from "@/lib/cultura-content";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";
import type {
  CmsCulturaCard,
  CmsCulturaPage,
} from "@/lib/cms/types";
import {
  viajeCategoriaHref,
  type ViajeCategoriaSlug,
} from "@/lib/viajes";
import { useViajeCategoriaDisplay } from "@/lib/cms/viajes-display";

export { useCirculoAmigosDisplay as useCulturaCirculoAmigosDisplay } from "@/lib/cms/circulo-amigos-display";

export function mergeCulturaCards(
  defaults: CmsCulturaCard[],
  overrides?: CmsCulturaCard[],
): CmsCulturaCard[] {
  if (!overrides?.length) return defaults;
  const byId = new Map(overrides.map((c) => [c.id, c]));
  return defaults.map((d) => {
    const o = byId.get(d.id);
    return o ? { ...d, ...o } : d;
  });
}

function resolveCardImage(card: CmsCulturaCard): CmsCulturaCard {
  return {
    ...card,
    src: resolveCmsMediaUrl(card.src) ?? card.src,
  };
}

function resolveCards(cards: CmsCulturaCard[]): CmsCulturaCard[] {
  return cards.map(resolveCardImage);
}

function pickPage(
  published?: CmsCulturaPage | null,
  draft?: CmsCulturaPage | null,
  editReady?: boolean,
): CmsCulturaPage | null {
  if (editReady && draft) return draft;
  if (isCmsEnabled() && published) return published;
  return null;
}

export function useCulturaTalleresDisplay() {
  const cms = useCmsDocument();
  const edit = useCulturaCmsEdit();
  const page = pickPage(
    cms?.sections.culturaPage,
    edit?.culturaPage,
    edit?.ready,
  );
  return {
    eyebrow: page?.talleresEyebrow ?? CULTURA_TALLERES_SECTION.eyebrow,
    title: page?.talleresTitle ?? CULTURA_TALLERES_SECTION.title,
    intro: page?.talleresIntro ?? CULTURA_TALLERES_SECTION.intro,
    cards: resolveCards(
      mergeCulturaCards(CULTURA_TALLERES_DEFAULTS, page?.talleres),
    ),
  };
}

const VIAJES_CATEGORIAS: ViajeCategoriaSlug[] = ["locales", "internacionales"];

export function useCulturaViajesDisplay() {
  const cms = useCmsDocument();
  const edit = useCulturaCmsEdit();
  const page = pickPage(
    cms?.sections.culturaPage,
    edit?.culturaPage,
    edit?.ready,
  );
  const locales = useViajeCategoriaDisplay("locales");
  const internacionales = useViajeCategoriaDisplay("internacionales");
  const cards = VIAJES_CATEGORIAS.map((categoria) => {
    const d = categoria === "locales" ? locales : internacionales;
    return {
      categoria,
      href: viajeCategoriaHref(categoria),
      src: d.heroImage.src,
      alt: d.heroImage.alt,
      title: d.title,
      text: d.cardText,
    };
  });
  return {
    eyebrow: page?.viajesEyebrow ?? CULTURA_VIAJES_SECTION.eyebrow,
    title: page?.viajesTitle ?? CULTURA_VIAJES_SECTION.title,
    intro: page?.viajesIntro ?? CULTURA_VIAJES_SECTION.intro,
    cards,
  };
}

export function useCulturaEventosPreviewDisplay() {
  const cms = useCmsDocument();
  const edit = useCulturaCmsEdit();
  const page = pickPage(
    cms?.sections.culturaPage,
    edit?.culturaPage,
    edit?.ready,
  );
  return {
    eyebrow: page?.eventosEyebrow ?? CULTURA_EVENTOS_SECTION.eyebrow,
    title: page?.eventosTitle ?? CULTURA_EVENTOS_SECTION.title,
    intro: page?.eventosIntro ?? CULTURA_EVENTOS_SECTION.intro,
    cards: resolveCards(
      mergeCulturaCards(CULTURA_EVENTOS_PREVIEW_DEFAULTS, page?.eventosPreview),
    ),
  };
}

export type CulturaCardKind = "taller" | "evento";

export function culturaCardSelectedId(kind: CulturaCardKind, id: string) {
  return `${kind}:${id}`;
}

export function parseCulturaCardSelectedId(
  selectedId: string | null,
): { kind: CulturaCardKind; id: string } | null {
  if (!selectedId) return null;
  const m = selectedId.match(/^(taller|evento):(.+)$/);
  if (!m) return null;
  return { kind: m[1] as CulturaCardKind, id: m[2] };
}
