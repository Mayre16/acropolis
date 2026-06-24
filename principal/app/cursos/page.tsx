import type { Metadata } from "next";

import { Clock, User, CheckCircle2 } from "lucide-react";

import { CursosHero } from "@/components/cms/CursosHero";
import { CursosPageShell } from "@/components/cms/CursosPageShell";
import { CursosProximasActividades } from "@/components/cms/CursosProximasActividades";

import { CursosOfertaTabs } from "@/components/CursosOfertaTabs";

import { CursosEventosRecientes } from "@/components/cursos/CursosEventosRecientes";

import { SalonesAlquiler } from "@/components/SalonesAlquiler";

import { CursosInscribeCta } from "@/components/cursos/CursosInscribeCta";

import {
  accentCardClass,
  accentEyebrowClass,
  accentInfoCardClass,
  accentTokens,
} from "@/lib/brand-accents";

export const metadata: Metadata = {
  title: "Cursos y Talleres",
  description:
    "Cursos, talleres y programas de bienestar de Nueva Acrópolis RD: el arte de respirar, pintura, círculo de lectura, Tai Chi y Chi Kung, astrología filosófica, oratoria y más.",
  alternates: { canonical: "/cursos" },
};

const DATOS = [
  {
    icon: Clock,
    label: "Modalidad",
    value: "Talleres presenciales, por temporadas",
  },
  {
    icon: User,
    label: "Dirigido a",
    value: "Abierto al público; sin requisitos previos",
  },
];

export default function CursosPage() {
  return (
    <CursosPageShell>
      <>
        <CursosHero />

        <CursosOfertaTabs />

        <SalonesAlquiler />

        <CursosEventosRecientes />

        <section className="border-t border-na-heket/10 bg-gradient-to-b from-na-heket/[0.05] via-na-surface to-na-amon/[0.04] py-14 sm:py-16">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <p className={accentEyebrowClass(1)}>Información práctica</p>
            <h2 className="mt-2 text-2xl font-black text-na-heketDark sm:text-3xl">
              Antes de inscribirte
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {DATOS.map(({ icon: Icon, label, value }, i) => {
                const a = accentTokens(i);
                return (
                  <div key={label} className={accentInfoCardClass(i)}>
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${a.iconBox}`}
                    >
                      <Icon className="h-6 w-6" strokeWidth={2} />
                    </div>
                    <p
                      className={`mt-4 text-xs font-black uppercase tracking-[0.18em] ${a.eyebrow}`}
                    >
                      {label}
                    </p>
                    <p className="mt-2 whitespace-pre-line text-base font-bold leading-snug text-na-heketDark">
                      {value}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-na-heketDark via-na-heket to-na-kefer p-8 text-center shadow-na-card sm:p-12">
              <h2 className="text-balance text-2xl font-black text-white sm:text-3xl">
                Inscríbete en un curso
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-white/85">
                Escríbenos para conocer las próximas convocatorias, horarios e
                inscripción de nuestros cursos y talleres.
              </p>
              <CursosInscribeCta />
            </div>
          </div>
        </section>

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
