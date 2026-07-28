"use client";

import { useFilosofiaCmsEdit } from "@/components/filosofia/cms/FilosofiaCmsEditContext";
import { DIPLOMADO_HERO_BADGE, DIPLOMADO_INFO_BANNER } from "@/lib/diplomado-content";
import {
  mergeDiplomadoInscription,
  mergeDiplomadoPage,
} from "@/lib/cms/diplomado-page-edit";
import { useCmsDiplomadoBadge, useCmsDiplomadoInfo } from "@/lib/cms/hooks";
import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";
import type { CmsDiplomadoHero } from "@/lib/cms/types";

function badgeFromHero(h: CmsDiplomadoHero) {
  return {
    weekday: h.badgeWeekday ?? DIPLOMADO_HERO_BADGE.weekday,
    date: h.badgeDate ?? DIPLOMADO_HERO_BADGE.date,
  };
}

function infoFromHero(h: CmsDiplomadoHero) {
  const bannerFallback = DIPLOMADO_INFO_BANNER;

  return {
    banner: [
      {
        value: h.badgeDate ?? bannerFallback[0].value,
        label: bannerFallback[0].label,
      },
      {
        value: h.bannerDuration ?? bannerFallback[1].value,
        label: bannerFallback[1].label,
      },
      {
        value: h.activeModality ?? bannerFallback[2].value,
        label: bannerFallback[2].label,
      },
    ],
    schedule: [],
  };
}

/** En el editor visual usa el borrador en vivo; en el sitio público usa lo publicado. */
export function useDiplomadoBadgeDisplay() {
  const edit = useFilosofiaCmsEdit();
  const cmsBadge = useCmsDiplomadoBadge(DIPLOMADO_HERO_BADGE);

  if (edit?.ready) return badgeFromHero(edit.diplomadoHero);
  return isCmsEnabled() ? cmsBadge : DIPLOMADO_HERO_BADGE;
}

export function useDiplomadoInfoDisplay() {
  const edit = useFilosofiaCmsEdit();
  const cmsInfo = useCmsDiplomadoInfo();

  if (edit?.ready) return infoFromHero(edit.diplomadoHero);
  return cmsInfo;
}

export function useDiplomadoInscriptionDisplay() {
  const edit = useFilosofiaCmsEdit();
  const cms = useCmsDocument();

  if (edit?.ready) return mergeDiplomadoInscription(edit.diplomadoInscription);
  if (isCmsEnabled() && cms?.sections.diplomadoInscription) {
    return mergeDiplomadoInscription(cms.sections.diplomadoInscription);
  }
  return mergeDiplomadoInscription();
}

export function useDiplomadoPageDisplay() {
  const edit = useFilosofiaCmsEdit();
  const cms = useCmsDocument();

  if (edit?.ready) return mergeDiplomadoPage(edit.diplomadoPage);
  if (isCmsEnabled() && cms?.sections.diplomadoPage) {
    return mergeDiplomadoPage(cms.sections.diplomadoPage);
  }
  return mergeDiplomadoPage();
}

export { mergeDiplomadoPage, DEFAULT_DIPLOMADO_PAGE } from "@/lib/cms/diplomado-page-edit";
