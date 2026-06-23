import type { Metadata } from "next";
import { VoluntariadoHero } from "@/components/cms/VoluntariadoHero";
import { EsferaCollaborate } from "@/components/EsferaCollaborate";
import { VoluntariadoPageShell } from "@/components/cms/VoluntariadoPageShell";
import { VoluntariadoProximasActividades } from "@/components/cms/VoluntariadoProximasActividades";
import { VoluntariadoActividadesRecientes } from "@/components/voluntariado/VoluntariadoActividadesRecientes";
import { VoluntariadoQueHacemosSection } from "@/components/voluntariado/VoluntariadoQueHacemosSection";
import { VoluntariadoEsferaSection } from "@/components/voluntariado/VoluntariadoEsferaSection";
import { VoluntariadoSostenibilidadSection } from "@/components/voluntariado/VoluntariadoSostenibilidadSection";

export const metadata: Metadata = {
  title: "Voluntariado",
  description:
    "Voluntariado de Nueva Acrópolis RD: reforestación y ecología, acompañamiento a personas mayores, actividades con niños y el Punto Focal Esfera para emergencias. Inscríbete.",
  alternates: { canonical: "/voluntariado" },
};

export default function VoluntariadoPage() {
  return (
    <VoluntariadoPageShell>
      <>
        <VoluntariadoHero />
        <VoluntariadoQueHacemosSection />
        <VoluntariadoEsferaSection />
        <VoluntariadoSostenibilidadSection />
        <VoluntariadoActividadesRecientes />
        <EsferaCollaborate />
        <VoluntariadoProximasActividades />
      </>
    </VoluntariadoPageShell>
  );
}
