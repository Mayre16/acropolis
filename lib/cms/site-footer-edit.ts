import {
  BRAND_FOOTER_TAGLINE,
  CURSOS_WHATSAPP_NUMBER,
  DIPLOMADO_WHATSAPP_NUMBER,
  INSTAGRAM_HANDLE,
  LEGAL_DOMICILE,
  SOCIAL_LINKS,
} from "@/lib/site-config";
import type { CmsDocument, CmsSiteFooter } from "@/lib/cms/types";

export const SITE_FOOTER_PANEL_ID = "__site_footer__";

export const DEFAULT_SITE_FOOTER: CmsSiteFooter = {
  tagline: BRAND_FOOTER_TAGLINE,
  legalDomicile: LEGAL_DOMICILE,
  legalNote: "ONG sin fines de lucro",
  instagramUrl: SOCIAL_LINKS.instagram,
  instagramHandle: INSTAGRAM_HANDLE,
  youtubeUrl: SOCIAL_LINKS.youtube,
  facebookUrl: SOCIAL_LINKS.facebook,
  whatsappCursosNumber: CURSOS_WHATSAPP_NUMBER,
  whatsappDiplomadoNumber: DIPLOMADO_WHATSAPP_NUMBER,
};

export type MergedSiteFooter = {
  tagline: string;
  legalDomicile: string;
  legalNote: string;
  instagramUrl: string;
  instagramHandle: string;
  youtubeUrl: string;
  facebookUrl: string;
  socialLinks: {
    instagram: string;
    youtube: string;
    facebook: string;
  };
  whatsappCursosNumber: string;
  whatsappDiplomadoNumber: string;
  whatsappCursosUrl: string;
  whatsappDiplomadoUrl: string;
};

export function buildWhatsAppUrl(number: string): string {
  const digits = number.replace(/\D/g, "");
  if (!digits) return `https://wa.me/${CURSOS_WHATSAPP_NUMBER}`;
  return `https://wa.me/${digits}`;
}

/** Enlace wa.me con número y mensaje opcional; si no hay número, usa fallbackUrl (sin query). */
export function buildWhatsAppHref(
  number: string | undefined,
  message: string | undefined,
  fallbackUrl: string,
): string {
  const digits = (number ?? "").replace(/\D/g, "");
  const base = digits
    ? buildWhatsAppUrl(digits)
    : fallbackUrl.replace(/\?.*$/, "");
  const msg = message?.trim();
  if (msg) return `${base}?text=${encodeURIComponent(msg)}`;
  return base;
}

export function mergeSiteFooterFields(
  partial: CmsSiteFooter = {},
): MergedSiteFooter {
  const raw = { ...DEFAULT_SITE_FOOTER, ...partial };
  const whatsappCursosNumber =
    raw.whatsappCursosNumber ?? DEFAULT_SITE_FOOTER.whatsappCursosNumber!;
  const whatsappDiplomadoNumber =
    raw.whatsappDiplomadoNumber ?? DEFAULT_SITE_FOOTER.whatsappDiplomadoNumber!;

  return {
    tagline: raw.tagline ?? DEFAULT_SITE_FOOTER.tagline!,
    legalDomicile: raw.legalDomicile ?? DEFAULT_SITE_FOOTER.legalDomicile!,
    legalNote: raw.legalNote ?? DEFAULT_SITE_FOOTER.legalNote!,
    instagramUrl: raw.instagramUrl ?? DEFAULT_SITE_FOOTER.instagramUrl!,
    instagramHandle: raw.instagramHandle ?? DEFAULT_SITE_FOOTER.instagramHandle!,
    youtubeUrl: raw.youtubeUrl ?? DEFAULT_SITE_FOOTER.youtubeUrl!,
    facebookUrl: raw.facebookUrl ?? DEFAULT_SITE_FOOTER.facebookUrl!,
    socialLinks: {
      instagram: raw.instagramUrl ?? DEFAULT_SITE_FOOTER.instagramUrl!,
      youtube: raw.youtubeUrl ?? DEFAULT_SITE_FOOTER.youtubeUrl!,
      facebook: raw.facebookUrl ?? DEFAULT_SITE_FOOTER.facebookUrl!,
    },
    whatsappCursosNumber,
    whatsappDiplomadoNumber,
    whatsappCursosUrl: buildWhatsAppUrl(whatsappCursosNumber),
    whatsappDiplomadoUrl: buildWhatsAppUrl(whatsappDiplomadoNumber),
  };
}

export function mergeSiteFooter(cms?: CmsDocument | null): MergedSiteFooter {
  return mergeSiteFooterFields(cms?.sections.siteFooter);
}

export function buildDocWithSiteFooter(
  base: CmsDocument,
  siteFooter: CmsSiteFooter,
): CmsDocument {
  return {
    ...base,
    sections: {
      ...base.sections,
      siteFooter,
    },
  };
}
