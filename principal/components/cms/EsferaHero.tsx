"use client";

import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { useEsferaCmsEdit } from "@/components/cms/EsferaCmsEditContext";
import { resolvePageHero } from "@/lib/cms/page-hero";
import { useHeroCarouselImages } from "@/lib/cms/hero-carousel-hooks";
import { useCmsDocument } from "@/lib/cms/provider";
import { ESFERA_HERO_IMAGES } from "@/lib/hero-images";

const FALLBACK = {
  eyebrow: "Punto Focal · Crisis y emergencias",
  title: "Formación que transforma la respuesta humanitaria",
  lede: "Talleres y charlas para líderes institucionales sobre los Estándares Humanitarios Esfera, contextualizados a la realidad dominicana.",
};

export function EsferaHero() {
  const cms = useCmsDocument();
  const edit = useEsferaCmsEdit();
  const images = useHeroCarouselImages("esfera", ESFERA_HERO_IMAGES);
  const display = resolvePageHero(
    FALLBACK,
    cms?.sections.esferaPage,
    edit?.page,
    edit?.ready,
  );

  return (
    <CmsPageHero
      id="esfera-hero"
      eyebrow={display.eyebrow}
      brandMark="esfera"
      layout="split"
      title={display.title}
      lede={display.lede}
      crumbs={[
        { label: "Inicio", href: "/" },
        { label: "Punto Focal Esfera" },
      ]}
      images={images}
      imageObjectPosition="50% 25%"
      editReady={edit?.ready}
      onEdit={() => edit?.setSelectedId("__hero__")}
    />
  );
}
