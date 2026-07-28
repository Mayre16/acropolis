import type { Metadata } from "next";

import { CheckCircle2 } from "lucide-react";

import { CursosHero } from "@/components/cms/CursosHero";
import { CursosPageShell } from "@/components/cms/CursosPageShell";
import { CursosProximasActividades } from "@/components/cms/CursosProximasActividades";
import { CursosOfertaTabs } from "@/components/CursosOfertaTabs";
import { CursosEventosRecientes } from "@/components/cursos/CursosEventosRecientes";
import { SalonesAlquiler } from "@/components/SalonesAlquiler";
import { CursosInscribeSection } from "@/components/cursos/CursosInscribeSection";
import {
  accentCardClass,
  accentEyebrowClass,
  accentTokens,
} from "@/lib/brand-accents";

export const metadata: Metadata = {
  title: "Cursos y Talleres",
  description:
    "Cursos, talleres y programas de bienestar de Nueva Acrópolis RD: el arte de respirar, pintura, círculo de lectura, Tai Chi y Chi Kung, astrología filosófica, oratoria y más.",
  alternates: { canonical: "/cursos" },
};

export default function CursosPage() {
  return (
    <CursosPageShell>
      <>
        <CursosHero />

        <CursosOfertaTabs />

        <SalonesAlquiler />

        <CursosEventosRecientes />

        <CursosInscribeSection />

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <p className={accentEyebrowClass(2)}>Por qué aquí</p>
          <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
            Más que aprender una técnica
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              "Cada curso integra una mirada filosófica: el desarrollo de la técnica acompaña al crecimiento personal.",
              "Un ambiente humano y de respeto, en el que aprender se convierte en un encuentro con los demás.",
              "Facilitadores voluntarios con experiencia, que comparten su saber con vocación de servicio.",
            ].map((t, i) => (
              <li key={t} className={`flex gap-3 ${accentCardClass(i)}`}>
                <CheckCircle2
                  className={`mt-0.5 h-5 w-5 shrink-0 ${accentTokens(i).check}`}
                />
                <p className="text-sm leading-relaxed text-na-heketDark">{t}</p>
              </li>
            ))}
          </ul>
        </section>

        <CursosProximasActividades />
      </>
    </CursosPageShell>
  );
}
