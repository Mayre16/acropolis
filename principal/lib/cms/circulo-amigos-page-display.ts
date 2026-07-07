"use client";

import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { useCirculoAmigosCmsEdit } from "@/components/cms/CirculoAmigosCmsEditContext";
import { mergeCirculoAmigosPage } from "@/lib/cms/circulo-amigos-page-edit";
import { isCmsEnabled, useCmsDocument } from "@/lib/cms/provider";
import type { CmsCirculoAmigosPage } from "@/lib/cms/types";

function resolvePage(page: CmsCirculoAmigosPage): CmsCirculoAmigosPage {
  const resolve = (src?: string) => resolveCmsMediaUrl(src) ?? src ?? "";
  return {
    ...page,
    heroImageSrc: resolve(page.heroImageSrc),
    introBannerSrc: resolve(page.introBannerSrc),
    introGrupoSrc: resolve(page.introGrupoSrc),
    pilares: page.pilares?.map((item) => ({
      ...item,
      imageSrc: resolve(item.imageSrc),
    })),
    beneficios: page.beneficios?.map((item) => ({
      ...item,
      imageSrc: resolve(item.imageSrc),
    })),
    pasos: page.pasos?.map((item) => ({
      ...item,
      imageSrc: resolve(item.imageSrc),
    })),
  };
}

export function useCirculoAmigosPageDisplay(): CmsCirculoAmigosPage {
  const cms = useCmsDocument();
  const edit = useCirculoAmigosCmsEdit();
  const overrides = edit?.ready
    ? edit.page
    : isCmsEnabled()
      ? cms?.sections.circuloAmigosPage
      : undefined;
  return resolvePage(mergeCirculoAmigosPage(overrides ?? null));
}
