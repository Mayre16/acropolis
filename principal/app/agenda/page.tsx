import type { Metadata } from "next";
import { AgendaFullListing } from "@/components/contenido/AgendaFullListing";
import { PageHero } from "@/components/PageHero";
import { AGENDA_HERO_IMAGES } from "@/lib/hero-images";

export const metadata: Metadata = {
  title: "Agenda de actividades",
  description:
    "Agenda de Nueva Acrópolis RD: filosofía, cultura, cursos, conferencias, voluntariado y Esfera — fechas, sedes e inscripciones.",
  alternates: { canonical: "/agenda" },
};

export default function AgendaPage() {
  return (
    <>
      <PageHero
        eyebrow="Contenido"
        title="Agenda de actividades"
        lede="Consulta fechas, sedes e inscripciones de todo lo programado en Nueva Acrópolis República Dominicana."
        crumbs={[
          { label: "Inicio", href: "/" },
          { label: "Contenido", href: "/contenido" },
          { label: "Agenda" },
        ]}
        images={AGENDA_HERO_IMAGES}
      />
      <AgendaFullListing />
    </>
  );
}
