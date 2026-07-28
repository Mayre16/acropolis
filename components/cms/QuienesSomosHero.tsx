"use client";

import { CmsPageHero } from "@/components/cms/CmsPageHero";
import { useQuienesSomosCmsEdit } from "@/components/cms/InstitutionalPageCmsEditContext";
import { mergeQuienesSomosPage } from "@/lib/cms/institutional-page-edit";
import { useCmsDocument, isCmsEnabled } from "@/lib/cms/provider";
import { resolvePageHero } from "@/lib/cms/page-hero";
import { useHeroCarouselImages } from "@/lib/cms/hero-carousel-hooks";
import { QUIENES_SOMOS_HERO_IMAGES } from "@/lib/hero-images";
import { NA_INTRO_PARAGRAPHS } from "@/lib/institucional-content";
import { INTRO_VIDEO_ID, INTRO_VIDEO_START } from "@/lib/site-config";
import Image from "next/image";
import { CmsEditPencil, CmsSectionEditBar } from "@/components/cms/CmsEditPencil";
import type { CmsPersonaBlock } from "@/lib/cms/types";

const FALLBACK = {
  eyebrow: "Quiénes somos",
  title: "Qué es Nueva Acrópolis",
  lede: NA_INTRO_PARAGRAPHS[0],
};

export function QuienesSomosHero() {
  const cms = useCmsDocument();
  const edit = useQuienesSomosCmsEdit();
  const images = useHeroCarouselImages("quienesSomos", QUIENES_SOMOS_HERO_IMAGES);
  const published = mergeQuienesSomosPage(
    isCmsEnabled() ? cms?.sections.quienesSomosPage : undefined,
  );
  const draft = edit?.ready
    ? mergeQuienesSomosPage(edit.page)
    : published;
  const display = resolvePageHero(FALLBACK, published, draft, edit?.ready);

  return (
    <CmsPageHero
      id="quienes-somos-hero"
      eyebrow={display.eyebrow}
      brandLockup="oina"
      title={display.title}
      lede={display.lede}
      crumbs={[{ label: "Inicio", href: "/" }, { label: "Quiénes somos" }]}
      images={images}
      editReady={edit?.ready}
      onEdit={() => edit?.setSelectedId("__hero__")}
    />
  );
}

export function QuienesSomosIntroSection() {
  const cms = useCmsDocument();
  const edit = useQuienesSomosCmsEdit();
  const page = edit?.ready
    ? mergeQuienesSomosPage(edit.page)
    : mergeQuienesSomosPage(
        isCmsEnabled() ? cms?.sections.quienesSomosPage : undefined,
      );
  const paragraphs = page.introParagraphs ?? [...NA_INTRO_PARAGRAPHS];

  return (
    <section
      id="que-es"
      className="scroll-mt-36 mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16"
    >
      <div className="relative grid items-center gap-10 lg:grid-cols-2">
        {edit?.ready ? (
          <div className="absolute right-0 top-0 z-10">
            <CmsSectionEditBar
              label="Editar textos"
              onClick={() => edit.setSelectedId("__intro__")}
            />
          </div>
        ) : null}
        <div className="overflow-hidden rounded-[1.5rem] border border-na-heket/10 bg-na-ink shadow-na-card">
          <div className="relative aspect-video w-full">
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${INTRO_VIDEO_ID}?start=${INTRO_VIDEO_START}`}
              title="Qué es Nueva Acrópolis"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          {paragraphs.map((p) => (
            <p
              key={p.slice(0, 24)}
              className="mt-5 max-w-prose text-base font-semibold leading-relaxed text-na-ink first:mt-0 sm:text-lg"
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function DirectorBar({
  p,
  badge,
  badgeClassName,
  flip = false,
  photoSize = "default",
  onEdit,
}: {
  p: CmsPersonaBlock;
  badge: string;
  badgeClassName: string;
  flip?: boolean;
  photoSize?: "default" | "large";
  onEdit?: () => void;
}) {
  const photoClass =
    photoSize === "large"
      ? "h-36 w-36 sm:h-44 sm:w-44"
      : "h-28 w-28 sm:h-32 sm:w-32";

  return (
    <div
      className={`relative flex flex-col items-center gap-6 rounded-[1.75rem] border border-na-heket/10 bg-na-surface p-6 text-center shadow-na-soft sm:p-7 sm:text-left ${
        flip ? "sm:flex-row-reverse" : "sm:flex-row"
      }`}
    >
      {onEdit ? (
        <CmsEditPencil label={`Editar ${p.name}`} onClick={onEdit} />
      ) : null}
      <div
        className={`relative shrink-0 overflow-hidden rounded-full ring-4 ring-na-heket/10 ${photoClass}`}
      >
        {p.photo ? (
          <Image
            src={p.photo}
            alt={p.name}
            fill
            unoptimized
            sizes={photoSize === "large" ? "176px" : "128px"}
            className="object-cover object-[center_22%]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-na-heketDark via-na-heket to-na-kefer text-2xl font-black text-white/90">
            {p.initials}
          </div>
        )}
      </div>
      <div className={`min-w-0 ${flip ? "sm:text-right" : ""}`}>
        <span
          className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${badgeClassName}`}
        >
          {badge}
        </span>
        <h3 className="mt-3 text-xl font-black text-na-heketDark">{p.name}</h3>
        {p.period ? (
          <p className="mt-0.5 text-xs font-semibold text-na-muted/80">
            {p.period}
          </p>
        ) : null}
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-na-muted">
          {p.bio}
        </p>
      </div>
    </div>
  );
}

export function QuienesSomosPresidenciaSection() {
  const cms = useCmsDocument();
  const edit = useQuienesSomosCmsEdit();
  const page = edit?.ready
    ? mergeQuienesSomosPage(edit.page)
    : mergeQuienesSomosPage(
        isCmsEnabled() ? cms?.sections.quienesSomosPage : undefined,
      );

  return (
    <section
      id="presidencia"
      className="scroll-mt-36 mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12"
    >
      <div className="relative">
        {edit?.ready ? (
          <div className="absolute right-0 top-0">
            <CmsSectionEditBar
              label="Editar sección"
              onClick={() => edit.setSelectedId("__presidencia__")}
            />
          </div>
        ) : null}
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
          {page.presidenciaEyebrow}
        </p>
        <h2 className="mt-2 text-balance text-2xl font-black text-na-heketDark sm:text-3xl">
          {page.presidenciaTitle}
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-na-muted">
          {page.presidenciaIntro}
        </p>
      </div>
      <ul className="mx-auto mt-10 grid max-w-3xl gap-5">
        {(page.personas ?? []).map((p, i) => (
          <li key={p.id}>
            <DirectorBar
              p={p}
              badge={p.role}
              badgeClassName="bg-na-heket/10 text-na-heket"
              flip={i % 2 === 1}
              photoSize="large"
              onEdit={
                edit?.ready
                  ? () => edit.setSelectedId(`persona:${p.id}`)
                  : undefined
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}

export function QuienesSomosDireccionSection() {
  const cms = useCmsDocument();
  const edit = useQuienesSomosCmsEdit();
  const page = edit?.ready
    ? mergeQuienesSomosPage(edit.page)
    : mergeQuienesSomosPage(
        isCmsEnabled() ? cms?.sections.quienesSomosPage : undefined,
      );
  const director = page.directorNacional;
  const anteriores = page.directoresAnteriores ?? [];

  if (!director) return null;

  return (
    <section
      id="direccion-nacional"
      className="scroll-mt-36 border-t border-na-heket/10 bg-na-heket/[0.04] py-14 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
          En República Dominicana
        </p>
        <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
          Dirección Nacional
        </h2>
        <p className="mt-4 max-w-2xl text-na-muted">
          La sede de Nueva Acrópolis en República Dominicana está dirigida por su
          Director Nacional, junto al equipo de voluntarios que sostiene cada
          actividad.
        </p>
        <div className="mx-auto mt-10 grid max-w-3xl gap-5">
          <DirectorBar
            p={director}
            badge="Director Nacional · Actual"
            badgeClassName="bg-na-helios/15 text-na-amon"
            photoSize="large"
            onEdit={
              edit?.ready
                ? () => edit.setSelectedId(`persona:${director.id}`)
                : undefined
            }
          />
          {anteriores.map((d) => (
            <DirectorBar
              key={d.id}
              p={d}
              badge={d.role}
              badgeClassName="bg-na-kefer/10 text-na-kefer"
              flip
              photoSize="large"
              onEdit={
                edit?.ready
                  ? () => edit.setSelectedId(`persona:${d.id}`)
                  : undefined
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
