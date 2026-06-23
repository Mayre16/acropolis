"use client";

import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { HeroCarouselEditButton } from "@/components/cms/HeroCarouselCmsEditContext";
import { useArticulosCmsEdit } from "@/components/cms/ArticulosCmsEditContext";
import { resolvePageHero } from "@/lib/cms/page-hero";
import { useHeroCarouselImages } from "@/lib/cms/hero-carousel-hooks";
import { useCmsDocument } from "@/lib/cms/provider";
import { ARTICULOS_HERO_IMAGES } from "@/lib/hero-images";

const FALLBACK = {
  eyebrow: "Artículos",
  title: "Pensamientos filosóficos",
  lede: "Artículos y reflexiones de filosofía práctica para pensar mejor y vivir con sentido. Ideas de Oriente y Occidente al alcance de todos.",
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
        { label: "Artículos" },
      ]}
      images={images}
      editReady={edit?.ready}
      onEdit={() => edit?.setSelectedSlug("__hero__")}
    >
      <HeroCarouselEditButton carouselKey="articulos" />
    </CmsPageHero>
  );
}
