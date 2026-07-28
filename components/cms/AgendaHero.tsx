"use client";

import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { useAgendaCmsEdit } from "@/components/cms/AgendaCmsEditContext";
import { resolvePageHero } from "@/lib/cms/page-hero";
import { useHeroCarouselImages } from "@/lib/cms/hero-carousel-hooks";
import { useCmsDocument } from "@/lib/cms/provider";
import { AGENDA_HERO_IMAGES } from "@/lib/hero-images";

const FALLBACK = {
  eyebrow: "Contenido",
  title: "Agenda de actividades",
  lede: "Consulta fechas, sedes e inscripciones de todo lo programado en Nueva Acrópolis República Dominicana.",
};

export function AgendaHero() {
  const cms = useCmsDocument();
  const edit = useAgendaCmsEdit();
  const images = useHeroCarouselImages("agenda", AGENDA_HERO_IMAGES);
  const display = resolvePageHero(
    FALLBACK,
    cms?.sections.agendaPage,
    edit?.page,
    edit?.ready,
  );

  return (
    <CmsPageHero
      id="agenda-hero"
      eyebrow={display.eyebrow}
      title={display.title}
      lede={display.lede}
      crumbs={[
        { label: "Inicio", href: "/" },
        { label: "Contenido", href: "/contenido" },
        { label: "Agenda" },
      ]}
      images={images}
      editReady={edit?.ready}
      onEdit={() => edit?.setSelectedSlug("__hero__")}
    />
  );
}
