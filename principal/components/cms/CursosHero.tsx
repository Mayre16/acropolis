"use client";

import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { useCursosCmsEdit } from "@/components/cms/CursosCmsEditContext";
import { resolvePageHero } from "@/lib/cms/page-hero";
import { useHeroCarouselImages } from "@/lib/cms/hero-carousel-hooks";
import { useCmsDocument } from "@/lib/cms/provider";
import { CURSOS_HERO_IMAGES } from "@/lib/hero-images";

const FALLBACK = {
  eyebrow: "Cursos y Talleres",
  title: "Aprender, crear y crecer",
  lede: "Talleres y cursos abiertos a la comunidad para cultivar el cuerpo, la mente y la creatividad. Cada temporada abrimos nuevas propuestas en nuestras sedes.",
};

export function CursosHero() {
  const cms = useCmsDocument();
  const edit = useCursosCmsEdit();
  const images = useHeroCarouselImages("cursos", CURSOS_HERO_IMAGES);
  const display = resolvePageHero(
    FALLBACK,
    cms?.sections.cursosPage,
    edit?.page,
    edit?.ready,
  );

  return (
    <CmsPageHero
      id="cursos-hero"
      eyebrow={display.eyebrow}
      brandLockup="trilogo"
      title={display.title}
      lede={display.lede}
      crumbs={[{ label: "Inicio", href: "/" }, { label: "Cursos" }]}
      images={images}
      editReady={edit?.ready}
      onEdit={() => edit?.setSelectedId("__hero__")}
    />
  );
}
