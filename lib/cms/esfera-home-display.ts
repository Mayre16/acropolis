"use client";

import { useEsferaCmsEdit } from "@/components/cms/EsferaCmsEditContext";
import { useHomeCmsEdit } from "@/components/cms/HomeCmsEditContext";
import {
  DEFAULT_ESFERA_HOME_PROMO,
  ESFERA_HOME_PROMO_SECTION_ID,
  mergeEsferaHomePromo,
  mergeEsferaPage,
  pickEsferaHomePromo,
} from "@/lib/cms/esfera-page-edit";
import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";

export const ESFERA_HOME_PROMO_SELECTED_ID = ESFERA_HOME_PROMO_SECTION_ID;

export function useEsferaHomeDisplay() {
  const cms = useCmsDocument();
  const esferaEdit = useEsferaCmsEdit();
  const homeEdit = useHomeCmsEdit();

  const overrides = esferaEdit?.ready
    ? pickEsferaHomePromo(mergeEsferaPage(esferaEdit.page))
    : homeEdit?.ready
      ? homeEdit.esferaHomePromo
      : isCmsEnabled()
        ? pickEsferaHomePromo(mergeEsferaPage(cms?.sections.esferaPage))
        : undefined;

  const promo = mergeEsferaHomePromo(overrides);

  return {
    eyebrow: promo.homeEyebrow ?? DEFAULT_ESFERA_HOME_PROMO.homeEyebrow!,
    title: promo.homeTitle ?? DEFAULT_ESFERA_HOME_PROMO.homeTitle!,
    intro: promo.homeIntro ?? DEFAULT_ESFERA_HOME_PROMO.homeIntro!,
    detail: promo.homeDetail ?? DEFAULT_ESFERA_HOME_PROMO.homeDetail!,
    ctaLabel: promo.homeCtaLabel ?? DEFAULT_ESFERA_HOME_PROMO.homeCtaLabel!,
  };
}

export function useEsferaHomeCmsEdit() {
  const esfera = useEsferaCmsEdit();
  if (esfera?.ready) {
    return {
      ready: true as const,
      setSelectedId: esfera.setSelectedId,
    };
  }
  const home = useHomeCmsEdit();
  if (home?.ready) {
    return {
      ready: true as const,
      setSelectedId: (id: string | null) =>
        home.setSelected("esferaHome", id),
    };
  }
  return null;
}
