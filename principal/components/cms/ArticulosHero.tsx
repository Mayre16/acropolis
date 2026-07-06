"use client";

import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { useArticulosCmsEdit } from "@/components/cms/ArticulosCmsEditContext";
import { resolvePageHero } from "@/lib/cms/page-hero";
import { useHeroCarouselImages } from "@/lib/cms/hero-carousel-hooks";
import { useCmsDocument } from "@/lib/cms/provider";
import { ARTICULOS_HERO_IMAGES } from "@/lib/hero-images";

const FALLBACK = {
  eyebrow: "Blog",
  title: "Pensamientos filosóficos",
  lede: "Reflexiones de filosofía práctica en nuestro blog — ideas de Oriente y Occidente para pensar mejor y vivir con sentido.",
};

export function ArticulosHero() {
  const cms = useCmsDocument();
  const edit = useArticulosCmsEdit();
  const images = useHeroCarouselImages("articulos", ARTICULOS_HERO_IMAGES);
  const display = resolvePageHero(
    FALLBACK,
    cms?.sections.articulosPage,
    edit?.page,
    edit?.ready,
  );

  return (
    <CmsPageHero
      id="articulos-hero"
      eyebrow={display.eyebrow}
      brandLockup="trilogo"
      title={display.title}
      lede={display.lede}
      crumbs={[
        { label: "Contenido", href: "/contenido" },
        { label: "Blog" },
      ]}
      images={images}
      editReady={edit?.ready}
      onEdit={() => edit?.setSelectedSlug("__hero__")}
    />
  );
}
