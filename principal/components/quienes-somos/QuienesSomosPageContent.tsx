import type { Metadata } from "next";
import Image from "next/image";
import { ExternalLink, FileDown } from "lucide-react";
import {
  QuienesSomosHero,
  QuienesSomosIntroSection,
  QuienesSomosPresidenciaSection,
  QuienesSomosDireccionSection,
} from "@/components/cms/QuienesSomosHero";
import { QuienesSomosPageShell } from "@/components/cms/QuienesSomosPageShell";
import { QuienesSomosPageNav } from "@/components/QuienesSomosPageNav";
import { Values } from "@/components/home/Values";
import { FundacionOrganizacionSection } from "@/components/quienes-somos/FundacionOrganizacionSection";
import { SimbolismoSection } from "@/components/quienes-somos/SimbolismoSection";
import { AreasActuacionInstitucionalSection } from "@/components/quienes-somos/AreasActuacionInstitucionalSection";
import { bibliotecaLibreriaUrl } from "@/lib/site-config";
import { LeaveSiteLink } from "@/components/LeaveSiteLink";
import {
  ANUARIO_INTERNACIONAL_URL,
  ANUARIO_PORTADA,
  PERFIL_INSTITUCIONAL_OINADOM,
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
      <section
        id="perfil-institucional"
        className="scroll-mt-36 border-t border-na-heket/10 bg-na-heket/[0.04] py-14 sm:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
            Institucional
          </p>
          <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
            {PERFIL_INSTITUCIONAL_OINADOM.title}
          </h2>
          <p className="mt-5 max-w-3xl leading-relaxed text-na-muted">
            {PERFIL_INSTITUCIONAL_OINADOM.lede}
          </p>
          <p className="mt-3 text-sm text-na-muted">
            {PERFIL_INSTITUCIONAL_OINADOM.note}
          </p>
          <div className="mt-6">
            <a
              href={PERFIL_INSTITUCIONAL_OINADOM.href}
              download
              className="inline-flex items-center gap-2 rounded-full bg-na-heket px-5 py-2.5 text-sm font-bold text-white transition hover:bg-na-kefer"
            >
              <FileDown className="h-4 w-4" aria-hidden />
              Descargar perfil institucional (PDF)
            </a>
          </div>
        </div>
      </section>
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
              Anuarios internacionales
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-na-muted">
              Consulta y descarga las ediciones recientes en el portal oficial de
              Nueva Acrópolis Internacional. Para información local sobre
              disponibilidad impresa, acércate a nuestras sedes o escríbenos.
              También puedes encontrar publicaciones relacionadas en nuestra{" "}
              <LeaveSiteLink
                href={bibliotecaLibreriaUrl()}
                className="font-semibold text-na-heket underline-offset-2 hover:underline"
              >
                Librería
              </LeaveSiteLink>
              .
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <LeaveSiteLink
                href={ANUARIO_INTERNACIONAL_URL}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-na-heket px-5 py-2.5 text-sm font-bold text-white transition hover:bg-na-kefer"
              >
                Ver anuarios en acropolis.org
                <ExternalLink className="h-4 w-4" aria-hidden />
              </LeaveSiteLink>
            </div>
          </div>
        </div>
      </section>
    </QuienesSomosPageShell>
  );
}
