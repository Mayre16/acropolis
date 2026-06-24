"use client";

import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { useVoluntariadoCmsEdit } from "@/components/cms/VoluntariadoCmsEditContext";
import { resolvePageHero } from "@/lib/cms/page-hero";
import { useHeroCarouselImages } from "@/lib/cms/hero-carousel-hooks";
import { useCmsDocument } from "@/lib/cms/provider";
import { VOLUNTARIADO_HERO_IMAGES } from "@/lib/hero-images";

const FALLBACK = {
  eyebrow: "Voluntariado",
  title: "El voluntariado como escuela de valores",
  lede: "Servir a los demás y a la naturaleza es parte esencial de la filosofía en acción. Súmate a nuestras actividades y vive el voluntariado activo.",
};

export function VoluntariadoHero() {
  const cms = useCmsDocument();
  const edit = useVoluntariadoCmsEdit();
  const images = useHeroCarouselImages("voluntariado", VOLUNTARIADO_HERO_IMAGES);
  const display = resolvePageHero(
    FALLBACK,
    cms?.sections.voluntariadoPage,
    edit?.page,
    edit?.ready,
  );

  return (
    <CmsPageHero
      id="voluntariado-hero"
      eyebrow={display.eyebrow}
      brandLockup="trilogo"
      title={display.title}
      lede={display.lede}
      crumbs={[{ label: "Inicio", href: "/" }, { label: "Voluntariado" }]}
      images={images}
      editReady={edit?.ready}
      onEdit={() => edit?.setSelectedId("__hero__")}
    />
  );
}
