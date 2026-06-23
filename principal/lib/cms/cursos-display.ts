"use client";

import { useCursosCmsEdit } from "@/components/cms/CursosCmsEditContext";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import {
  CONFERENCIAS_DEFAULTS,
  CURSOS_TALLERES_DEFAULTS,
  mergeCursosCards,
} from "@/lib/cms/cursos-oferta-edit";
import { CURSOS_ACTIVOS_INTRO } from "@/lib/cursos-permanentes";
import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";
import type { CmsCursosCard, CmsCursosPage } from "@/lib/cms/types";

export const DEFAULT_OFERTA_COPY = {
  eyebrow: "Nuestra oferta",
  cursosIntro: CURSOS_ACTIVOS_INTRO,
  conferenciasIntro:
    "Charlas y conferencias abiertas al público sobre filosofía, cultura y valores. Muchas son gratuitas; consulta fechas y sedes por WhatsApp.",
};

function resolveCard(card: CmsCursosCard): CmsCursosCard {
  return {
    ...card,
    src: resolveCmsMediaUrl(card.src) ?? card.src,
  };
}

function pickPage(
  published?: CmsCursosPage | null,
  draft?: CmsCursosPage | null,
  editReady?: boolean,
): CmsCursosPage | null {
  if (editReady && draft) return draft;
  if (isCmsEnabled() && published) return published;
  return null;
}

export function useCursosOfertaDisplay() {
  const cms = useCmsDocument();
  const edit = useCursosCmsEdit();
  const page = pickPage(cms?.sections.cursosPage, edit?.page, edit?.ready);

  return {
    eyebrow: page?.ofertaEyebrow ?? DEFAULT_OFERTA_COPY.eyebrow,
    cursosIntro: page?.ofertaCursosIntro ?? DEFAULT_OFERTA_COPY.cursosIntro,
    conferenciasIntro:
      page?.ofertaConferenciasIntro ?? DEFAULT_OFERTA_COPY.conferenciasIntro,
    cursosTalleres: resolveCards(
      mergeCursosCards(CURSOS_TALLERES_DEFAULTS, page?.cursosTalleres),
    ),
    conferencias: resolveCards(
      mergeCursosCards(CONFERENCIAS_DEFAULTS, page?.conferencias),
    ),
  };
}

function resolveCards(cards: CmsCursosCard[]) {
  return cards.map(resolveCard);
}
