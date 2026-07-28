import type { Metadata } from "next";
import { CulturaHero } from "@/components/cms/CulturaHero";
import { CulturaEventosPreview } from "@/components/cms/CulturaEventosPreview";
import { CulturaProximasActividades } from "@/components/cms/CulturaProximasActividades";
import { CulturaTalleresSection } from "@/components/cms/CulturaTalleresSection";
import { CulturaViajesSection } from "@/components/cms/CulturaViajesSection";
import { CulturaPageShell } from "@/components/cms/CulturaPageShell";

export const metadata: Metadata = {
  title: "Cultura",
  description:
    "Actividades culturales de Nueva Acrópolis RD: talleres de danza, coro y teatro, propuestas para jóvenes, eventos y celebraciones en nuestras sedes.",
  alternates: { canonical: "/cultura" },
};

export default function CulturaPage() {
  return (
    <CulturaPageShell>
      <>
        <CulturaHero />

        <CulturaTalleresSection />

        <CulturaViajesSection />

        <CulturaEventosPreview />

        <CulturaProximasActividades />
      </>
    </CulturaPageShell>
  );
}
