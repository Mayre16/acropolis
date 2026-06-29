import type { Metadata } from "next";
import { AgendaFullListing } from "@/components/contenido/AgendaFullListing";
import { AgendaHero } from "@/components/cms/AgendaHero";
import { AgendaPageShell } from "@/components/cms/AgendaPageShell";

export const metadata: Metadata = {
  title: "Agenda de actividades",
  description:
    "Agenda de Nueva Acrópolis RD: filosofía, cultura, cursos, conferencias, voluntariado y Esfera — fechas, sedes e inscripciones.",
  alternates: { canonical: "/agenda" },
};

export default function AgendaPage() {
  return (
    <AgendaPageShell>
      <AgendaHero />
      <AgendaFullListing />
    </AgendaPageShell>
  );
}
