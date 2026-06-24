"use client";

import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { useEventosCmsEdit } from "@/components/cms/EventosCmsEditContext";
import { resolvePageHero } from "@/lib/cms/page-hero";
import { useHeroCarouselImages } from "@/lib/cms/hero-carousel-hooks";
import { useCmsDocument } from "@/lib/cms/provider";
import { EVENTOS_HERO_IMAGES } from "@/lib/hero-images";

const FALLBACK = {
  eyebrow: "Eventos y Noticias",
  title: "Lo que sucede en Nueva Acrópolis",
  lede: "Encuentros, celebraciones, viajes y proyectos de nuestra organización, aquí y en todo el mundo, más allá de nuestras clases y programas regulares.",
};

export function EventosHero() {
  const cms = useCmsDocument();
  const edit = useEventosCmsEdit();
  const images = useHeroCarouselImages("eventos", EVENTOS_HERO_IMAGES);
  const display = resolvePageHero(
    FALLBACK,
    cms?.sections.eventosPage,
    edit?.page,
    edit?.ready,
  );

  return (
    <CmsPageHero
      id="eventos-hero"
      eyebrow={display.eyebrow}
      brandLockup="trilogo"
      title={display.title}
      lede={display.lede}
      crumbs={[
        { label: "Contenido", href: "/contenido" },
        { label: "Eventos" },
      ]}
      images={images}
      editReady={edit?.ready}
      onEdit={() => edit?.setSelectedSlug("__hero__")}
    />
  );
}
