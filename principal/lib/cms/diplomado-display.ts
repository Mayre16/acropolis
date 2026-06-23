"use client";

import { useFilosofiaCmsEdit } from "@/components/filosofia/cms/FilosofiaCmsEditContext";
import {
  DIPLOMADO_HERO_BADGE,
  DIPLOMADO_INFO_BANNER,
  DIPLOMADO_INSCRIBE_WHATSAPP,
  DIPLOMADO_INSCRIPTION,
  DIPLOMADO_TESTIMONIAL,
} from "@/lib/diplomado-content";
import { useCmsDiplomadoBadge, useCmsDiplomadoInfo } from "@/lib/cms/hooks";
import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";
import type {
  CmsDiplomadoHero,
  CmsDiplomadoInscription,
  CmsDiplomadoPage,
} from "@/lib/cms/types";

const DEFAULT_DIPLOMADO_PAGE: CmsDiplomadoPage = {
  heroLede:
    "Un viaje de 5 meses por las grandes tradiciones filosóficas del mundo para transformar tu manera de pensar, sentir y actuar.",
  otrasSesionesTitle: "Cupos disponibles",
  otrasSesionesIntro: "",
  testimonialEyebrow: DIPLOMADO_TESTIMONIAL.eyebrow,
  testimonialQuote: DIPLOMADO_TESTIMONIAL.quote,
  testimonialVideoUrl: DIPLOMADO_TESTIMONIAL.videoUrl,
};

function mergeInscription(patch?: CmsDiplomadoInscription | null) {
  return {
    eyebrow: patch?.eyebrow ?? DIPLOMADO_INSCRIPTION.eyebrow,
    title: patch?.title ?? DIPLOMADO_INSCRIPTION.title,
    intro: patch?.intro ?? DIPLOMADO_INSCRIPTION.intro,
    capacityNote: patch?.capacityNote ?? DIPLOMADO_INSCRIPTION.capacityNote,
    feeMain: patch?.feeMain ?? DIPLOMADO_INSCRIPTION.feeMain,
    feeNote: patch?.feeNote ?? DIPLOMADO_INSCRIPTION.feeNote,
    paymentNote: patch?.paymentNote ?? DIPLOMADO_INSCRIPTION.paymentNote,
    accountLabel: patch?.accountLabel ?? DIPLOMADO_INSCRIPTION.accountLabel,
    account: patch?.account ?? DIPLOMADO_INSCRIPTION.account,
    rncLabel: patch?.rncLabel ?? DIPLOMADO_INSCRIPTION.rncLabel,
    rnc: patch?.rnc ?? DIPLOMADO_INSCRIPTION.rnc,
    email: patch?.email ?? DIPLOMADO_INSCRIPTION.email,
    footnote: patch?.footnote ?? DIPLOMADO_INSCRIPTION.footnote,
    inscribeWhatsApp: patch?.inscribeWhatsApp ?? DIPLOMADO_INSCRIBE_WHATSAPP,
  };
}

function mergeDiplomadoPage(patch?: CmsDiplomadoPage | null): CmsDiplomadoPage {
  return { ...DEFAULT_DIPLOMADO_PAGE, ...patch };
}

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

  if (edit?.ready) return mergeInscription(edit.diplomadoInscription);
  if (isCmsEnabled() && cms?.sections.diplomadoInscription) {
    return mergeInscription(cms.sections.diplomadoInscription);
  }
  return mergeInscription();
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
