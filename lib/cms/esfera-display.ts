"use client";

import { useEsferaCmsEdit } from "@/components/cms/EsferaCmsEditContext";
import { useHomeCmsEdit } from "@/components/cms/HomeCmsEditHooks";
import { mergeEsferaPage } from "@/lib/cms/esfera-page-edit";
import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";
import type { CmsEsferaPage } from "@/lib/cms/types";

export function useEsferaPageDisplay(): CmsEsferaPage {
  const esferaEdit = useEsferaCmsEdit();
  const homeEdit = useHomeCmsEdit();
  const cms = useCmsDocument();

  if (esferaEdit?.ready) return mergeEsferaPage(esferaEdit.page);

  if (homeEdit?.ready) {
    return mergeEsferaPage({
      ...mergeEsferaPage(cms?.sections.esferaPage),
      ...homeEdit.esferaHomePromo,
      ...homeEdit.esferaLogo,
    });
  }

  if (isCmsEnabled()) return mergeEsferaPage(cms?.sections.esferaPage);
  return mergeEsferaPage(null);
}

export function useEsferaBrandLogo() {
  const page = useEsferaPageDisplay();
  const whiteSrc =
    page.esferaLogoWhiteSrc ??
    page.esferaLogoSrc ??
    "/brand/logo-esfera-punto-focal-white.webp";
  return {
    color: page.esferaLogoSrc ?? "/brand/logo-esfera-punto-focal.webp",
    white: whiteSrc,
    alt: page.esferaLogoAlt ?? "Esfera Punto Focal",
    /** Logo blanco subido en el CMS — no aplicar filtro CSS de inversión. */
    whiteIsDedicated: Boolean(page.esferaLogoWhiteSrc),
  };
}
