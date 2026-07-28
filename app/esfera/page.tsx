import type { Metadata } from "next";
import { EsferaInquiryButton } from "@/components/EsferaInquiryButton";
import { EsferaEstandaresSection } from "@/components/cms/EsferaEstandaresSection";
import { EsferaModalidadesSection } from "@/components/cms/EsferaModalidadesSection";
import { EsferaHero } from "@/components/cms/EsferaHero";
import { EsferaAudienciaSection } from "@/components/cms/EsferaAudienciaSection";
import { EsferaBeneficiosSection } from "@/components/cms/EsferaBeneficiosSection";
import { EsferaImpactoSection } from "@/components/cms/EsferaImpactoSection";
import { EsferaQuienesSomosSection } from "@/components/EsferaQuienesSomosSection";
import { EsferaContactInfo } from "@/components/cms/EsferaContactInfo";
import { EsferaPageShell } from "@/components/cms/EsferaPageShell";
import { EsferaProximosEntrenamientos } from "@/components/cms/EsferaProximosEntrenamientos";
import { EsferaWorkshopLinesSection } from "@/components/cms/EsferaWorkshopLinesSection";
import { EsferaAlianzasSection } from "@/components/cms/EsferaAlianzasSection";
import { EsferaSolicitudAutoOpen } from "@/components/EsferaSolicitudAutoOpen";
import { VenuesPageShell } from "@/components/cms/VenuesPageShell";

export const metadata: Metadata = {
  title: "Punto Focal Esfera",
  description:
    "Nueva Acrópolis RD es punto focal de Esfera (Estándares Humanitarios): talleres y charlas sobre el Manual Esfera para instituciones públicas, privadas y de la sociedad civil.",
  alternates: { canonical: "/esfera" },
};

export default function EsferaPage() {
  return (
    <EsferaPageShell>
    <VenuesPageShell>
    <>
      <EsferaHero />

      <EsferaQuienesSomosSection />

      <EsferaWorkshopLinesSection />

      <EsferaProximosEntrenamientos />

      <EsferaEstandaresSection />

      <EsferaModalidadesSection />

      <EsferaAudienciaSection />

      <EsferaBeneficiosSection />

      <EsferaImpactoSection />

      <EsferaAlianzasSection />

      <section className="border-t border-na-heket/10 bg-na-heket/[0.06] py-14 sm:py-16">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
            Contacto
          </p>
          <h2 className="mt-2 text-2xl font-black text-na-heketDark sm:text-3xl">
            Contáctenos para más información
          </h2>
          <EsferaContactInfo />
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <EsferaInquiryButton triggerLabel="Solicitar información" />
          </div>
        </div>
      </section>

      <EsferaSolicitudAutoOpen />
    </>
    </VenuesPageShell>
    </EsferaPageShell>
  );
}
