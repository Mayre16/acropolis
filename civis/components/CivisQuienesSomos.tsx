"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Award,
  Compass,
  ExternalLink,
  Link2,
  MessageSquare,
  Sparkles,
  UsersRound,
} from "lucide-react";
import {
  PRINCIPAL_SITE_URL,
} from "@/lib/site-config";
import {
  CIVIS_INTRO,
  CIVIS_OBJETIVOS,
  CIVIS_PROPOSITO,
  CIVIS_NUESTRO_EQUIPO_PATH,
  CIVIS_SCROLL_MT,
  quienesTabFromLocation,
  quienesTabRoute,
  type CivisQuienesTabId,
} from "@/lib/civis-content";
import { CivisFormCta } from "@/components/CivisFormCta";
import { CivisEntrenadoresList } from "@/components/CivisEntrenadoresList";
import { CivisClientesLogoGrid } from "@/components/CivisClientesLogoGrid";
import { CivisQuienesTabsBar } from "@/components/CivisQuienesTabsBar";
import { CivisMediaImage } from "@/components/cms/CivisMediaImage";
import { CivisEditPencil } from "@/components/cms/CmsEditFields";
import { useCivisCmsEdit } from "@/components/cms/CivisCmsEditContext";
import { useCivisHomePageCopy,
  useCivisQuienesCivisContent,
  useCivisQuienesNaContent,
  useCivisQuienesPageCopy,
  useMergedClientes,
  useMergedEntrenadores,
} from "@/lib/cms/hooks";
import { CivisNaSectionLogo } from "@/components/CivisNaSectionLogo";

const METODOLOGIA_ICONS = [
  Sparkles,
  MessageSquare,
  UsersRound,
  Compass,
  Award,
] as const;

/** Cadena metodológica — tonos secundarios de marca por paso. */
const METODOLOGIA_TONES = [
  {
    card: "border-na-kefer/30 bg-gradient-to-br from-na-kefer/[0.16] via-white to-na-kefer/[0.06]",
    badge: "bg-na-kefer text-white shadow-md shadow-na-kefer/25",
    number: "text-na-kefer",
    thread: "from-na-kefer to-na-civis",
    ring: "ring-na-kefer/20",
  },
  {
    card: "border-na-civis/35 bg-gradient-to-br from-na-civis/[0.18] via-white to-na-civis/[0.08]",
    badge: "bg-na-civisDark text-white shadow-md shadow-na-civis/25",
    number: "text-na-civisDark",
    thread: "from-na-civis to-na-amon",
    ring: "ring-na-civis/25",
  },
  {
    card: "border-na-amon/35 bg-gradient-to-br from-na-amon/[0.14] via-white to-na-helios/[0.12]",
    badge: "bg-na-amon text-white shadow-md shadow-na-amon/25",
    number: "text-na-amon",
    thread: "from-na-amon to-na-helios",
    ring: "ring-na-amon/20",
  },
  {
    card: "border-na-helios/40 bg-gradient-to-br from-na-helios/[0.22] via-white to-na-amon/[0.08]",
    badge: "bg-na-helios text-na-ink shadow-md shadow-na-helios/30",
    number: "text-na-amon",
    thread: "from-na-helios to-na-heket",
    ring: "ring-na-helios/30",
  },
  {
    card: "border-na-heket/30 bg-gradient-to-br from-na-heket/[0.12] via-white to-na-kefer/[0.08]",
    badge: "bg-na-heket text-white shadow-md shadow-na-heket/20",
    number: "text-na-heket",
    thread: "from-na-heket to-na-kefer",
    ring: "ring-na-heket/20",
  },
] as const;

/** Posición en la rejilla 3+2 del flujo metodológico (escritorio). */
const METODOLOGIA_PLACEMENT = [
  "lg:col-span-2 lg:row-start-1",
  "lg:col-span-2 lg:row-start-1",
  "lg:col-span-2 lg:row-start-1",
  "lg:col-span-2 lg:col-start-2 lg:row-start-2",
  "lg:col-span-2 lg:col-start-4 lg:row-start-2",
] as const;

function MetodologiaCadena() {
  const edit = useCivisCmsEdit();
  const content = useCivisQuienesCivisContent();
  const items = content.metodologia ?? [];

  return (
    <div className="relative mt-14 overflow-hidden rounded-[1.75rem] border border-na-civis/15 bg-gradient-to-br from-na-civis/[0.1] via-white to-na-kefer/[0.08] p-6 sm:p-8">
      {edit?.ready ? (
        <CivisEditPencil
          label="Editar metodología"
          onClick={() => edit.setSelectedId("__quienes-metodologia__")}
          className="right-2 top-2"
        />
      ) : null}
      <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-civisDark">
        {content.metodologiaEyebrow ?? "Metodología"}
      </p>
      <h3 className="mt-3 text-2xl font-black text-na-ink sm:text-3xl">
        {content.metodologiaTitle ?? "Cómo trabajamos en los talleres"}
      </h3>

      <div className="relative mt-10">
        {/* Hilo conector — cadena 01→02→03 ↓ 04→05 */}
        <svg
          className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
          viewBox="0 0 960 280"
          preserveAspectRatio="none"
          aria-hidden
        >
          <defs>
            <linearGradient id="metodo-thread" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#009485" />
              <stop offset="35%" stopColor="#5BA6DC" />
              <stop offset="65%" stopColor="#f39300" />
              <stop offset="100%" stopColor="#086357" />
            </linearGradient>
          </defs>
          <path
            d="M 80 52 H 400 H 720 H 880 V 168 H 320 H 560"
            fill="none"
            stroke="url(#metodo-thread)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="6 10"
            opacity="0.55"
          />
        </svg>

        <ol className="relative grid gap-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-6 lg:grid-rows-2 lg:gap-x-3 lg:gap-y-10">
          {items.map((item, index) => {
            const Icon = METODOLOGIA_ICONS[index] ?? Sparkles;
            const tone = METODOLOGIA_TONES[index] ?? METODOLOGIA_TONES[0];
            const placement = METODOLOGIA_PLACEMENT[index] ?? "";
            const isLast = index === items.length - 1;

            return (
              <li key={item.title} className={`relative ${placement}`}>
                {!isLast ? (
                  <span
                    className={`absolute -bottom-6 left-7 z-0 flex h-5 w-5 items-center justify-center rounded-full bg-white ring-2 max-sm:flex sm:hidden lg:hidden ${tone.ring}`}
                    aria-hidden
                  >
                    <Link2 className={`h-3 w-3 ${tone.number}`} />
                  </span>
                ) : null}
                {!isLast && index !== 2 ? (
                  <span
                    className="absolute -bottom-6 left-1/2 z-0 hidden h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-white ring-2 ring-na-civis/20 sm:flex lg:hidden"
                    aria-hidden
                  >
                    <Link2 className={`h-3 w-3 ${tone.number}`} />
                  </span>
                ) : null}
                {index === 2 ? (
                  <span
                    className="absolute -bottom-6 left-1/2 z-0 hidden h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-white ring-2 ring-na-amon/25 sm:flex lg:hidden"
                    aria-hidden
                  >
                    <Link2 className="h-3 w-3 rotate-90 text-na-amon" />
                  </span>
                ) : null}

                <article
                  className={`relative z-10 flex h-full flex-col rounded-2xl border p-5 shadow-na-soft transition hover:-translate-y-0.5 hover:shadow-na-card ${tone.card}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone.badge}`}
                    >
                      <Icon className="h-5 w-5" aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <span
                        className={`text-[0.65rem] font-black uppercase tracking-[0.28em] ${tone.number}`}
                      >
                        Paso {String(index + 1).padStart(2, "0")}
                      </span>
                      <p className="mt-1 font-bold leading-snug text-na-ink">
                        {item.title}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-na-muted">
                    {item.text}
                  </p>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

function CivisConsultingPanel({
  onShowNuevaAcropolis,
}: {
  onShowNuevaAcropolis: () => void;
}) {
  const edit = useCivisCmsEdit();
  const content = useCivisQuienesCivisContent();
  const intro = content.intro ?? CIVIS_INTRO;
  const introBefore = intro.split("Nueva Acrópolis")[0];
  const introAfter = intro.split("Nueva Acrópolis").slice(1).join("Nueva Acrópolis");
  const sideImage = content.sideImage;
  const objetivos = content.objetivos ?? CIVIS_OBJETIVOS;

  return (
    <>
      <div className="grid gap-10 lg:grid-cols-[1fr_min(42%,28rem)] lg:items-start lg:gap-12">
        <div className="relative">
          {edit?.ready ? (
            <CivisEditPencil
              label="Editar introducción"
              onClick={() => edit.setSelectedId("__quienes-civis-intro__")}
              className="right-0 top-0"
            />
          ) : null}
          <p className="max-w-2xl text-sm leading-relaxed text-na-muted sm:text-base">
            {introBefore}
            {intro.includes("Nueva Acrópolis") ? (
              <button
                type="button"
                onClick={onShowNuevaAcropolis}
                className="font-semibold text-na-civisDark underline-offset-2 hover:underline"
              >
                Nueva Acrópolis
              </button>
            ) : null}
            {introAfter}
          </p>

          <div className="relative mt-8 overflow-hidden rounded-[1.75rem] border border-na-civis/20 shadow-na-card">
            {edit?.ready ? (
              <CivisEditPencil
                label="Editar propósito y objetivos"
                onClick={() => edit.setSelectedId("__quienes-civis-proposito__")}
                className="right-3 top-3"
              />
            ) : null}
            <div className="bg-gradient-to-br from-na-civisDark via-na-civis to-na-civis/85 p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-white/75">
                {content.propositoEyebrow ?? "Nuestro propósito"}
              </p>
              <p className="mt-3 text-balance text-lg font-semibold leading-relaxed text-white sm:text-xl">
                {content.proposito ?? CIVIS_PROPOSITO}
              </p>
            </div>

            <div className="border-t border-na-civis/15 bg-na-civis/[0.06] px-6 py-4 sm:px-8">
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-na-civisDark">
                {content.objetivosIntro ?? "De este propósito surgen"}
              </p>
            </div>

            <ol className="relative border-t border-na-civis/10 bg-white px-6 py-5 sm:px-8 sm:py-6">
              <span
                className="pointer-events-none absolute bottom-8 left-[2.125rem] top-8 w-px bg-gradient-to-b from-na-civis/40 via-na-civis/25 to-transparent sm:left-[2.375rem]"
                aria-hidden
              />
              {objetivos.map((item, i) => (
                <li
                  key={`${item.title}-${i}`}
                  className={`relative flex gap-4 pl-0 ${i > 0 ? "mt-5" : ""}`}
                >
                  <span
                    className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-na-civis text-xs font-black text-white shadow-md shadow-na-civis/25 sm:h-9 sm:w-9"
                    aria-hidden
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1 rounded-2xl border border-na-civis/12 bg-na-civis/[0.04] p-4 sm:p-5">
                    <p className="font-bold text-na-ink">{item.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-na-muted">
                      {item.text}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <div className="relative mx-auto aspect-[4/3] w-full max-w-[15rem] overflow-hidden rounded-2xl shadow-na-soft sm:max-w-xs sm:aspect-[4/5] lg:sticky lg:top-28 lg:mx-0 lg:max-w-none lg:aspect-[3/4]">
          {edit?.ready ? (
            <CivisEditPencil
              label="Editar imagen lateral"
              onClick={() => edit.setSelectedId("__quienes-civis-imagen__")}
              className="right-2 top-2 z-10"
            />
          ) : null}
          {sideImage?.src ? (
            <CivisMediaImage
              src={sideImage.src}
              alt={sideImage.alt ?? ""}
              fill
              className="object-cover"
              style={{ objectPosition: sideImage.objectPosition ?? "50% 35%" }}
              sizes="(max-width: 640px) 15rem, (max-width: 1024px) 20rem, 28rem"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-na-civis/10 text-sm text-na-muted">
              Sin imagen
            </div>
          )}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-na-civisDark/55 via-transparent to-transparent"
            aria-hidden
          />
          {sideImage?.caption ? (
            <p className="absolute bottom-0 left-0 right-0 p-3 text-xs font-semibold leading-snug text-white sm:p-5 sm:text-sm">
              {sideImage.caption}
            </p>
          ) : null}
        </div>
      </div>

      <MetodologiaCadena />

      <div id="entrenadores" className="relative mt-16 scroll-mt-28 border-t border-na-civis/10 pt-14">
        <CivisTabEntrenadoresTeaser />
      </div>
    </>
  );
}

function ClientesPanel() {
  const edit = useCivisCmsEdit();
  const copy = useCivisQuienesPageCopy();
  const clientes = useMergedClientes();
  const section = copy.clientes ?? {};

  return (
    <div id="clientes" className={`relative ${CIVIS_SCROLL_MT} mt-16 border-t border-na-civis/10 pt-14`}>
      {edit?.ready ? (
        <CivisEditPencil
          label="Editar sección clientes"
          onClick={() => edit.setSelectedId("__quienes-clientes-section__")}
          className="right-0 top-0"
        />
      ) : null}
      <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-civisDark">
        {section.eyebrow ?? "Confianza"}
      </p>
      <h2 className="mt-3 text-2xl font-black text-na-ink sm:text-3xl">
        {section.title ?? "Quienes han confiado en nosotros"}
      </h2>
      <h3 className="mt-4 max-w-2xl text-sm font-normal leading-relaxed text-na-muted sm:text-base">
        {section.lede ??
          "Hemos acompañado a empresas, instituciones y organizaciones que buscan fortalecer a sus equipos con formación en convivencia, liderazgo y ética aplicada."}
      </h3>
      <CivisClientesLogoGrid
        clientes={clientes}
        onEditCliente={
          edit?.ready ? (id) => edit.setSelectedId(`cliente:${id}`) : undefined
        }
      />
    </div>
  );
}

function CivisTabEntrenadoresTeaser() {
  const edit = useCivisCmsEdit();
  const entrenadores = useMergedEntrenadores(true);
  const copy = useCivisHomePageCopy();
  const section = copy.entrenadores ?? {};

  return (
    <>
      {edit?.ready ? (
        <CivisEditPencil
          label="Editar sección entrenadores"
          onClick={() => edit.setSelectedId("__home-entrenadores-section__")}
          className="right-0 top-0"
        />
      ) : null}
      <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-civisDark">
        {section.eyebrow ?? "Equipo"}
      </p>
      <h2 className="mt-3 text-2xl font-black text-na-ink sm:text-3xl">
        {section.title ?? "Entrenadores"}
      </h2>
      <h3 className="mt-4 max-w-2xl text-sm font-normal leading-relaxed text-na-muted sm:text-base">
        {section.lede ??
          "Facilitadores con formación académica y experiencia en liderazgo, convivencia y talleres corporativos."}
      </h3>
      <CivisEntrenadoresList entrenadores={entrenadores} />
      <p className="mt-8 text-center">
        <Link
          href={CIVIS_NUESTRO_EQUIPO_PATH}
          className="inline-flex items-center justify-center rounded-full border border-na-civis/25 bg-white px-6 py-3 text-sm font-bold text-na-civisDark shadow-na-soft transition hover:border-na-civis/40 hover:bg-na-civis/[0.06]"
        >
          Ver todo el equipo
        </Link>
      </p>
    </>
  );
}

function EquipoPanel() {
  const edit = useCivisCmsEdit();
  const copy = useCivisQuienesPageCopy();
  const entrenadores = useMergedEntrenadores(false);
  const section = copy.equipo ?? {};

  return (
    <div id="equipo" className={`relative ${CIVIS_SCROLL_MT}`}>
      {edit?.ready ? (
        <CivisEditPencil
          label="Editar sección equipo"
          onClick={() => edit.setSelectedId("__quienes-equipo-section__")}
          className="right-0 top-0"
        />
      ) : null}
      <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-civisDark">
        {section.eyebrow ?? "Facilitadores"}
      </p>
      <h2 className="mt-3 text-balance text-3xl font-black text-na-ink sm:text-4xl">
        {section.title ?? "Nuestro equipo"}
      </h2>
      <h3 className="mt-4 max-w-2xl text-sm font-normal leading-relaxed text-na-muted sm:text-base">
        {section.lede ??
          "Personas de Nueva Acrópolis que facilitan talleres Civis en empresas e instituciones: liderazgo, convivencia, ética y comunicación aplicada al entorno organizacional."}
      </h3>
      <CivisEntrenadoresList entrenadores={entrenadores} />
    </div>
  );
}

function NuevaAcropolisPanel() {
  const edit = useCivisCmsEdit();
  const content = useCivisQuienesNaContent();
  const intro = content.intro ?? [];
  const principios = content.principios ?? [];
  const heroImage = content.heroImage;
  const ctaUrl = content.ctaUrl ?? PRINCIPAL_SITE_URL;

  return (
    <div className="rounded-[1.75rem] border border-na-civis/12 bg-white p-6 shadow-na-soft sm:p-8 lg:p-10">
      <div className="grid items-start gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.25rem] bg-na-civis/5 shadow-na-soft">
          {edit?.ready ? (
            <CivisEditPencil
              label="Editar imagen"
              onClick={() => edit.setSelectedId("__quienes-na-imagen__")}
              className="right-2 top-2 z-10"
            />
          ) : null}
          {heroImage?.src ? (
            <CivisMediaImage
              src={heroImage.src}
              alt={heroImage.alt ?? ""}
              fill
              className="object-cover"
              style={{ objectPosition: heroImage.objectPosition ?? "50% 50%" }}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-na-muted">
              Sin imagen
            </div>
          )}
        </div>

        <div className="relative min-w-0 overflow-visible px-1 sm:px-2">
          {edit?.ready ? (
            <CivisEditPencil
              label="Editar texto"
              onClick={() => edit.setSelectedId("__quienes-na-intro__")}
              className="right-0 top-0"
            />
          ) : null}
          <div className="w-fit max-w-full overflow-visible pt-1 sm:pt-1.5">
            <CivisNaSectionLogo context="quienesSomos" align="left" />
          </div>
          <h2 className="mt-4 text-balance text-3xl font-black text-na-ink sm:mt-5 sm:text-4xl">
            {content.title ?? "Qué es Nueva Acrópolis"}
          </h2>
          {intro.map((p) => (
            <p
              key={p.slice(0, 32)}
              className="mt-4 text-sm leading-relaxed text-na-muted sm:text-base"
            >
              {p.includes("Escuela de Filosofía") ? (
                <>
                  {p.split("Escuela de Filosofía")[0]}
                  <strong className="text-na-ink">Escuela de Filosofía</strong>
                  {p.split("Escuela de Filosofía")[1]}
                </>
              ) : (
                p
              )}
            </p>
          ))}
        </div>
      </div>

      <div className="relative mt-10 sm:mt-12">
        {edit?.ready ? (
          <CivisEditPencil
            label="Editar principios"
            onClick={() => edit.setSelectedId("__quienes-na-principios__")}
            className="right-0 top-0"
          />
        ) : null}
        <ul className="grid gap-4 sm:grid-cols-3">
          {principios.map((item) => (
            <li
              key={item.title}
              className="rounded-2xl border border-na-civis/12 bg-white p-4 shadow-na-soft"
            >
              <p className="font-bold text-na-civisDark">{item.title}</p>
              <p className="mt-2 text-sm leading-relaxed text-na-muted">
                {item.text}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-8 border-t border-na-civis/10 pt-8 sm:pt-10">
        {edit?.ready ? (
          <CivisEditPencil
            label="Editar enlace"
            onClick={() => edit.setSelectedId("__quienes-na-cta__")}
            className="right-0 top-0"
          />
        ) : null}
        <p className="text-sm font-semibold text-na-ink">
          {content.ctaIntro ??
            "Conoce nuestra historia, actividades y sedes en República Dominicana."}
        </p>
        <a
          href={ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-na-civis px-6 py-3 text-sm font-bold text-white shadow-md shadow-na-civis/25 transition hover:bg-na-civisDark"
        >
          {content.ctaLabel ?? "Visitar acropolis.org.do"}
          <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
      </div>
    </div>
  );
}

export function CivisClientesAliadosSection() {
  return (
    <section className="border-b border-na-civis/10 bg-na-surface py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <ClientesPanel />
        <p className="mt-14 border-t border-na-civis/10 pt-10 text-center">
          <CivisFormCta variant="contactar" />
        </p>
      </div>
    </section>
  );
}

export function CivisNuestroEquipoSection() {
  return (
    <section className="border-b border-na-civis/10 bg-na-surface py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <CivisQuienesTabsBar />
        <div className="mt-10" role="tabpanel" id="quienes-panel-equipo" aria-labelledby="quienes-tab-equipo">
          <EquipoPanel />
        </div>
        <p className="mt-14 border-t border-na-civis/10 pt-10 text-center">
          <CivisFormCta variant="contactar" />
        </p>
      </div>
    </section>
  );
}

export function CivisQuienesSomos() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = quienesTabFromLocation(pathname, searchParams);

  const selectTab = (id: CivisQuienesTabId) => {
    router.push(quienesTabRoute(id));
  };

  return (
    <section className="border-b border-na-civis/10 bg-na-surface py-14 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <CivisQuienesTabsBar />

        <div
          role="tabpanel"
          id={`quienes-panel-${tab}`}
          aria-labelledby={`quienes-tab-${tab}`}
          className="mt-10"
        >
          {tab === "civis" ? (
            <CivisConsultingPanel
              onShowNuevaAcropolis={() => selectTab("nueva-acropolis")}
            />
          ) : tab === "equipo" ? (
            <EquipoPanel />
          ) : (
            <NuevaAcropolisPanel />
          )}
        </div>

        <p className="mt-14 border-t border-na-civis/10 pt-10 text-center">
          <CivisFormCta variant="contactar" />
        </p>
      </div>
    </section>
  );
}
