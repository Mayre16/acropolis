import type { Metadata } from "next";
import { Suspense } from "react";
import { FilosofiaProximasSesiones } from "@/components/filosofia/FilosofiaProximasSesiones";
import { FilosofiaPageShell } from "@/components/filosofia/FilosofiaPageShell";
import { FilosofiaHeroCms } from "@/components/filosofia/FilosofiaHeroCms";
import { FilosofiaPageBody } from "@/components/filosofia/FilosofiaPageBody";

export const metadata: Metadata = {
  title: "Escuela de Filosofía",
  description:
    "Escuela de Filosofía de Nueva Acrópolis a la manera clásica. Conoce el Diplomado de Filosofía para la Vida: ética, convivencia e historia, temario, modalidad e inscripción.",
  alternates: { canonical: "/filosofia" },
};

export default function FilosofiaPage() {
  return (
    <FilosofiaPageShell>
      <>
        <FilosofiaHeroCms
          eyebrow="Filosofía"
          brandLockup="escuela"
          title="Escuela de Filosofía a la manera clásica"
          lede="Un espacio para pensar, conocerse y vivir mejor. La filosofía no como teoría abstracta, sino como una forma práctica de afrontar la vida."
          imageObjectPosition="50% 22%"
        />

        <FilosofiaPageBody />

        <Suspense
          fallback={
            <div className="border-t border-na-heket/10 py-16 text-center text-na-muted">
              Cargando agenda…
            </div>
          }
        >
          <FilosofiaProximasSesiones />
        </Suspense>
      </>
    </FilosofiaPageShell>
  );
}
