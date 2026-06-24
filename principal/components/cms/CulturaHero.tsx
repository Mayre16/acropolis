"use client";

import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { useCulturaCmsEdit } from "@/components/cms/CulturaCmsEditContext";
import { resolvePageHero } from "@/lib/cms/page-hero";
import { useHeroCarouselImages } from "@/lib/cms/hero-carousel-hooks";
import { useCmsDocument } from "@/lib/cms/provider";
import { CULTURA_HERO_IMAGES } from "@/lib/hero-images";

const FALLBACK = {
  eyebrow: "Cultura",
  title: "Arte, encuentro y comunidad",
  lede: "Acercamos la filosofía a la vida a través del arte: talleres, eventos y celebraciones en nuestras sedes.",
};

export function CulturaHero() {
  const cms = useCmsDocument();
  const edit = useCulturaCmsEdit();
  const images = useHeroCarouselImages("cultura", CULTURA_HERO_IMAGES);
  const display = resolvePageHero(
    FALLBACK,
    cms?.sections.culturaPage,
    edit?.culturaPage,
    edit?.ready,
  );

  return (
    <CmsPageHero
      id="cultura-hero"
      eyebrow={display.eyebrow}
      brandLockup="trilogo"
      title={display.title}
      lede={display.lede}
      crumbs={[{ label: "Inicio", href: "/" }, { label: "Cultura" }]}
      images={images}
      editReady={edit?.ready}
      onEdit={() => edit?.setSelectedId("__hero__")}
    />
  );
}
