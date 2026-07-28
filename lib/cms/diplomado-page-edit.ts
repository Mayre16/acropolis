import {
  DIPLOMADO_IMPACT,
  DIPLOMADO_INSCRIBE_WHATSAPP,
  DIPLOMADO_INSCRIPTION,
  DIPLOMADO_TESTIMONIAL,
} from "@/lib/diplomado-content";
import type {
  CmsDiplomadoImpactStat,
  CmsDiplomadoInscription,
  CmsDiplomadoPage,
} from "@/lib/cms/types";

const DEFAULT_IMPACT_STATS: CmsDiplomadoImpactStat[] =
  DIPLOMADO_IMPACT.stats.map((s, i) => ({
    id: `d${i + 1}`,
    end: s.end,
    suffix: s.suffix,
    label: s.label,
  }));

export const DEFAULT_DIPLOMADO_PAGE: CmsDiplomadoPage = {
  heroLede:
    "Un viaje de 5 meses por las grandes tradiciones filosóficas del mundo para transformar tu manera de pensar, sentir y actuar.",
  otrasSesionesTitle: "Cupos disponibles",
  otrasSesionesIntro: "",
  testimonialEyebrow: DIPLOMADO_TESTIMONIAL.eyebrow,
  testimonialQuote: DIPLOMADO_TESTIMONIAL.quote,
  testimonialVideoUrl: DIPLOMADO_TESTIMONIAL.videoUrl,
  impactHeadlineEnd: DIPLOMADO_IMPACT.headline.end,
  impactHeadlineSuffix: DIPLOMADO_IMPACT.headline.suffix,
  impactTitle: DIPLOMADO_IMPACT.title,
  impactSubtitle: DIPLOMADO_IMPACT.subtitle,
  impactStats: DEFAULT_IMPACT_STATS,
};

function mergeImpactStats(
  overrides?: CmsDiplomadoImpactStat[],
): CmsDiplomadoImpactStat[] {
  if (!overrides?.length) return DEFAULT_IMPACT_STATS;
  const byId = new Map(overrides.map((s) => [s.id, s]));
  return DEFAULT_IMPACT_STATS.map((d) => ({ ...d, ...byId.get(d.id) }));
}

export function mergeDiplomadoPage(
  patch?: CmsDiplomadoPage | null,
): CmsDiplomadoPage {
  if (!patch) return { ...DEFAULT_DIPLOMADO_PAGE };
  return {
    ...DEFAULT_DIPLOMADO_PAGE,
    ...patch,
    impactStats: mergeImpactStats(patch.impactStats),
  };
}

export function mergeDiplomadoInscription(
  patch?: CmsDiplomadoInscription | null,
) {
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
    inscribeWhatsappNumber: patch?.inscribeWhatsappNumber ?? "",
    inscribeWhatsApp: patch?.inscribeWhatsApp ?? DIPLOMADO_INSCRIBE_WHATSAPP,
  };
}
