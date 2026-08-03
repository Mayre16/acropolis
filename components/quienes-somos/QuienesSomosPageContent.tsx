import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink, Handshake } from "lucide-react";
import {
  QuienesSomosHero,
  QuienesSomosIntroSection,
  QuienesSomosPresidenciaSection,
  QuienesSomosDireccionSection,
} from "@/components/cms/QuienesSomosHero";
import { PerfilInstitucionalSection } from "@/components/cms/PerfilInstitucionalSection";
import { QuienesSomosPageShell } from "@/components/cms/QuienesSomosPageShell";
import { QuienesSomosPageNav } from "@/components/QuienesSomosPageNav";
import { Values } from "@/components/home/Values";
import { FundacionOrganizacionSection } from "@/components/quienes-somos/FundacionOrganizacionSection";
import { SimbolismoSection } from "@/components/quienes-somos/SimbolismoSection";
import { AreasActuacionInstitucionalSection } from "@/components/quienes-somos/AreasActuacionInstitucionalSection";
import { LeaveSiteLink } from "@/components/LeaveSiteLink";
import {
  ANUARIO_INTERNACIONAL_URL,
  ANUARIO_PORTADA,
  type QuienesSomosSectionId,
} from "@/lib/institucional-content";
import {
  institutionalSectionPath,
  QUIENES_SOMOS_OVERVIEW_PATH,
} from "@/lib/institucional-paths";

type Props = {
  initialSection?: QuienesSomosSectionId;
};

export function quienesSomosMetadata(section?: QuienesSomosSectionId): Metadata {
  const sectionLabels: Partial<Record<QuienesSomosSectionId, string>> = {
    "que-es": "Qué es Nueva Acrópolis",
    "fundacion-organizacion": "Organización",
    principios: "Carta Fundacional",
    simbolismo: "Simbolismo del nombre",
    presidencia: "Fundador y presidencia",
    "areas-actuacion": "Áreas de actuación",
    "direccion-nacional": "Dirección Nacional",
    "perfil-institucional": "Perfil institucional",
    anuario: "Anuario",
  };

  const title = section
    ? (sectionLabels[section] ?? "Quiénes somos")
    : "Quiénes somos";

  const canonical = section
    ? institutionalSectionPath(section)
    : QUIENES_SOMOS_OVERVIEW_PATH;

  return {
    title,
    description:
      "Quiénes somos: Nueva Acrópolis es una escuela de filosofía a la manera clásica que promueve la cultura y practica el voluntariado.",
    alternates: { canonical },
  };
}

export function QuienesSomosPageContent({ initialSection }: Props) {
  return (
    <QuienesSomosPageShell>
      <QuienesSomosHero />
      <QuienesSomosPageNav initialSection={initialSection} />
      <QuienesSomosIntroSection />
      <FundacionOrganizacionSection />
      <Values showFundacionalLink={false} />
      <SimbolismoSection />
      <QuienesSomosPresidenciaSection />
      <AreasActuacionInstitucionalSection />
      <QuienesSomosDireccionSection />
      <PerfilInstitucionalSection />
      <section
        id="anuario"
        className="scroll-mt-36 border-t border-na-heket/10 bg-na-surface py-14 sm:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
            Publicaciones
          </p>
          <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
            Anuario — Memoria de Actividades
          </h2>
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
            <div className="grid gap-6 text-na-muted">
              <p className="leading-relaxed">
                Desde 1995, Nueva Acrópolis publica el{" "}
                <strong className="font-semibold text-na-ink">
                  Anuario de la Memoria de Actividades
                </strong>
                : un registro anual de la acción de la organización en cultura,
                ecología, voluntariado, formación filosófica y vida asociativa en
                los países donde tiene presencia.
              </p>
              <p className="leading-relaxed">
                Refleja el espíritu de unidad y diversidad de la OINA: talleres,
                conferencias, campañas solidarias, actividades artísticas y el
                trabajo cotidiano de voluntarios en todo el mundo. Se edita en
                español e inglés y se distribuye a nivel internacional.
              </p>
            </div>
            <div className="overflow-hidden rounded-2xl border border-na-heket/10 bg-na-heket/[0.04] shadow-na-soft">
              <div className="relative aspect-[3/2] w-full bg-black/5">
                <Image
                  src={ANUARIO_PORTADA.src}
                  alt={ANUARIO_PORTADA.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>
            </div>
          </div>
          <div className="mt-8 rounded-2xl border border-na-heket/10 bg-na-heket/[0.04] p-6 sm:p-8">
            <h3 className="text-lg font-bold text-na-heketDark">
              Ediciones del anuario
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-na-muted">
              El anuario internacional de Nueva Acrópolis recoge la memoria de
              actividades en todos los países. Consulta y descarga las ediciones
              recientes en el portal oficial; para disponibilidad impresa en RD,
              acércate a nuestras sedes o escríbenos.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <LeaveSiteLink
                href={ANUARIO_INTERNACIONAL_URL}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-na-heket px-5 py-2.5 text-sm font-bold text-white transition hover:bg-na-kefer"
              >
                Ver ediciones en acropolis.org
                <ExternalLink className="h-4 w-4" aria-hidden />
              </LeaveSiteLink>
            </div>
          </div>

          <Link
            href="/relaciones-institucionales/"
            className="mt-10 flex flex-col gap-4 rounded-2xl border border-na-heket/10 bg-gradient-to-br from-na-sand/80 via-na-surface to-na-kefer/[0.08] p-6 shadow-na-soft transition hover:border-na-heket/25 hover:shadow-na-card sm:flex-row sm:items-center sm:justify-between sm:p-8"
          >
            <div className="flex gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-na-heket/10 text-na-heket">
                <Handshake className="h-6 w-6" strokeWidth={1.8} aria-hidden />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.28em] text-na-kefer">
                  Internacional
                </p>
                <h3 className="mt-1 text-xl font-black text-na-heketDark">
                  Relaciones institucionales
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-na-muted">
                  Convenios, alianzas y presencia de Nueva Acrópolis ante
                  organismos e instituciones en República Dominicana y el mundo.
                </p>
              </div>
            </div>
            <span className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-na-heket">
              Ver relaciones
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </Link>
        </div>
      </section>
    </QuienesSomosPageShell>
  );
}
