"use client";

import Image from "next/image";
import { Pencil, Plus } from "lucide-react";
import { CirculoAmigosInquiryButton } from "@/components/CirculoAmigosInquiryButton";
import { useCirculoAmigosCmsEdit } from "@/components/cms/CirculoAmigosCmsEditContext";
import {
  CIRCULO_BENEFICIOS_SECTION_ID,
  CIRCULO_CTA_SECTION_ID,
  CIRCULO_ESPERAMOS_SECTION_ID,
  CIRCULO_INTRO_SECTION_ID,
  CIRCULO_PASOS_SECTION_ID,
  CIRCULO_PILARES_SECTION_ID,
  CIRCULO_RECIBES_SECTION_ID,
  circuloCardSelectedId,
} from "@/lib/cms/circulo-amigos-page-edit";
import { useCirculoAmigosPageDisplay } from "@/lib/cms/circulo-amigos-page-display";

function SectionEditButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-[11px] font-bold uppercase text-white shadow"
    >
      <Pencil className="h-3.5 w-3.5" aria-hidden />
      {label}
    </button>
  );
}

function AddCardButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold uppercase text-white shadow"
    >
      <Plus className="h-4 w-4" aria-hidden />
      {label}
    </button>
  );
}

function CardEditButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase text-white shadow"
    >
      <Pencil className="h-3 w-3" aria-hidden />
      {label}
    </button>
  );
}

export function CirculoAmigosLanding() {
  const page = useCirculoAmigosPageDisplay();
  const edit = useCirculoAmigosCmsEdit();

  return (
    <div className="font-sans text-[var(--ca-ink)]">
      <section className="ca-sec-hero relative overflow-hidden">
        {edit?.ready ? (
          <SectionEditButton
            label="Editar encabezado"
            onClick={() => edit.setSelectedId("__hero__")}
          />
        ) : null}
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="lg:grid lg:min-h-[min(32rem,82vh)] lg:grid-cols-2 lg:items-center lg:gap-x-8 xl:gap-x-12">
            <div className="order-first pt-3 pb-8 sm:pt-4 lg:order-last lg:flex lg:w-full lg:justify-center lg:pb-10 lg:pt-5">
              <div className="ca-hero-photo relative mx-auto aspect-[1024/478] w-full max-w-[28rem] overflow-hidden rounded-2xl sm:max-w-[36rem] lg:max-w-none lg:w-full lg:rounded-[1.25rem]">
                <Image
                  src={page.heroImageSrc ?? ""}
                  alt={page.heroImageAlt ?? ""}
                  fill
                  unoptimized
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 640px"
                />
              </div>
            </div>

            <div className="relative flex flex-col justify-center pb-10 sm:pb-14 lg:py-10">
              <p className="ca-eyebrow">{page.heroEyebrow}</p>
              <h1 className="ca-title mt-3 max-w-3xl text-balance text-[2rem] font-black leading-[1.08] tracking-tight sm:text-[2.65rem] lg:text-[3rem]">
                {page.heroTitle}
              </h1>
              <h2 className="ca-title--deep mt-4 max-w-2xl text-balance text-xl font-bold leading-snug sm:text-2xl">
                {page.heroSubtitle}
              </h2>
              <h3 className="mt-5 max-w-2xl text-base font-normal leading-relaxed text-[var(--ca-muted)] sm:text-lg">
                {page.heroLede}
              </h3>
              <div className="mt-8 flex flex-wrap gap-3" id="inscripcion">
                <CirculoAmigosInquiryButton
                  triggerLabel="Inscríbete ahora"
                  variant="landing"
                  triggerClassName="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ca-brand)] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[rgba(58,154,212,0.28)] transition hover:bg-[var(--ca-brand-dark)]"
                />
                <a
                  href={`mailto:${page.ctaEmail}?subject=${encodeURIComponent("Círculo de Amigos — Solicitud de información")}`}
                  className="inline-flex items-center justify-center rounded-full border-2 border-[var(--ca-brand)]/35 bg-white px-6 py-3 text-sm font-bold text-[var(--ca-brand-dark)] transition hover:bg-[var(--ca-panel)]"
                >
                  Más información
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ca-sec-mist px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="relative mx-auto max-w-5xl">
          {edit?.ready ? (
            <SectionEditButton
              label="Editar sección"
              onClick={() => edit.setSelectedId(CIRCULO_INTRO_SECTION_ID)}
            />
          ) : null}
          <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1fr]">
            <div className="relative aspect-[655/511] overflow-hidden rounded-2xl bg-[var(--ca-panel)] shadow-[0_10px_30px_rgba(58,154,212,0.12)]">
              <Image
                src={page.introBannerSrc ?? ""}
                alt={page.introBannerAlt ?? ""}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 420px"
              />
            </div>
            <div className="text-center lg:text-left">
              <p className="ca-eyebrow">Conoce el programa</p>
              <h2 className="ca-title--deep mt-3 text-2xl font-black sm:text-3xl">
                {page.introEyebrow}
              </h2>
              <div className="mt-5 space-y-4 text-base leading-relaxed text-[var(--ca-muted)]">
                {(page.introParagraphs ?? []).map((p: string) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ca-sec-panel px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="relative text-center">
          {edit?.ready ? (
            <SectionEditButton
              label="Editar sección"
              onClick={() => edit.setSelectedId(CIRCULO_PILARES_SECTION_ID)}
            />
          ) : null}
          <p className="ca-eyebrow">Fundamentos</p>
          <h2 className="ca-title--deep mt-3 text-2xl font-black sm:text-3xl">
            {page.pilaresTitle}
          </h2>
          {edit?.ready ? (
            <div className="mt-6 flex justify-center">
              <AddCardButton label="Añadir tarjeta" onClick={() => edit.addPilar()} />
            </div>
          ) : null}
        </div>
        <ul className="mt-10 grid gap-5 sm:grid-cols-3">
          {(page.pilares ?? []).map((item) => (
            <li
              key={item.id}
              className="ca-pilar-card relative overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(58,154,212,0.12)]"
            >
              {edit?.ready ? (
                <CardEditButton
                  label="Editar"
                  onClick={() =>
                    edit.setSelectedId(circuloCardSelectedId("pilar", item.id))
                  }
                />
              ) : null}
              <div className="relative aspect-[4/3] w-full bg-[var(--ca-panel)]">
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 320px"
                />
              </div>
              <div className="p-6 pt-4 text-center">
                <h3 className="ca-title--dark text-lg font-black">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ca-muted)]">
                  {item.text}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="ca-sec-sky px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="relative text-center">
          {edit?.ready ? (
            <SectionEditButton
              label="Editar sección"
              onClick={() => edit.setSelectedId(CIRCULO_BENEFICIOS_SECTION_ID)}
            />
          ) : null}
          <p className="ca-eyebrow">Ventajas</p>
          <h2 className="ca-title mt-3 text-2xl font-black sm:text-3xl">
            {page.beneficiosTitle}
          </h2>
          {edit?.ready ? (
            <div className="mt-6 flex justify-center">
              <AddCardButton
                label="Añadir tarjeta"
                onClick={() => edit.addBeneficio()}
              />
            </div>
          ) : null}
        </div>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {(page.beneficios ?? []).map((item) => (
            <li
              key={item.id}
              className="ca-benefit-card relative flex flex-col items-center rounded-2xl p-6 text-center sm:p-8"
            >
              {edit?.ready ? (
                <CardEditButton
                  label="Editar"
                  onClick={() =>
                    edit.setSelectedId(circuloCardSelectedId("beneficio", item.id))
                  }
                />
              ) : null}
              <div className="relative h-36 w-36 overflow-hidden rounded-full bg-white shadow-[0_8px_24px_rgba(58,154,212,0.15)] sm:h-40 sm:w-40">
                <Image
                  src={item.imageSrc}
                  alt={item.imageAlt}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="160px"
                />
              </div>
              <h3 className="ca-title--dark mt-5 font-black">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ca-muted)]">
                {item.text}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="ca-sec-steps px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="relative text-center">
          {edit?.ready ? (
            <SectionEditButton
              label="Editar sección"
              onClick={() => edit.setSelectedId(CIRCULO_PASOS_SECTION_ID)}
            />
          ) : null}
          <p className="ca-eyebrow">Proceso</p>
          <h2 className="ca-title--deep mt-3 text-2xl font-black sm:text-3xl">
            {page.pasosTitle}
          </h2>
          {edit?.ready ? (
            <div className="mt-6 flex justify-center">
              <AddCardButton label="Añadir paso" onClick={() => edit.addPaso()} />
            </div>
          ) : null}
        </div>
        <ol className="mt-10 grid gap-5 sm:grid-cols-3">
          {(page.pasos ?? []).map((step, i) => (
            <li
              key={step.id}
              className="ca-step-card relative overflow-hidden rounded-2xl"
            >
              {edit?.ready ? (
                <CardEditButton
                  label="Editar"
                  onClick={() =>
                    edit.setSelectedId(circuloCardSelectedId("paso", step.id))
                  }
                />
              ) : null}
              <div
                className={
                  step.id === "conecta"
                    ? "relative mx-auto mt-6 aspect-square w-32 rounded-xl bg-[var(--ca-panel)] ring-1 ring-[var(--ca-brand)]/15"
                    : "relative mx-auto mt-6 aspect-square w-32 overflow-hidden rounded-full bg-[var(--ca-panel)] ring-1 ring-[var(--ca-brand)]/15"
                }
              >
                <Image
                  src={step.imageSrc}
                  alt={step.imageAlt}
                  fill
                  unoptimized
                  className={
                    step.id === "conecta" ? "object-contain p-2" : "object-cover"
                  }
                  sizes="128px"
                />
              </div>
              <div className="p-6 pt-4 text-center">
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ca-step-num--${i}`}
                >
                  {step.n}
                </span>
                <h3 className="ca-title--dark mt-4 text-lg font-black">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ca-muted)]">
                  {step.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="ca-sec-snow px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="ca-card-recibes relative rounded-2xl bg-[var(--ca-panel)] p-6 sm:p-8">
            {edit?.ready ? (
              <SectionEditButton
                label="Editar"
                onClick={() => edit.setSelectedId(CIRCULO_RECIBES_SECTION_ID)}
              />
            ) : null}
            <h2 className="ca-title--dark text-xl font-black">
              {page.recibesTitle}
            </h2>
            <ul className="mt-5 space-y-3">
              {(page.recibesItems ?? []).map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-[var(--ca-muted)]"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ca-brand-light)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="ca-card-esperamos relative rounded-2xl border border-[var(--ca-brand)]/15 bg-white p-6 sm:p-8">
            {edit?.ready ? (
              <SectionEditButton
                label="Editar"
                onClick={() => edit.setSelectedId(CIRCULO_ESPERAMOS_SECTION_ID)}
              />
            ) : null}
            <h2 className="ca-title--deep text-xl font-black">
              {page.esperamosTitle}
            </h2>
            <ul className="mt-5 space-y-3">
              {(page.esperamosItems ?? []).map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-[var(--ca-muted)]"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ca-brand-dark)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="inscribete"
        className="ca-sec-cta relative scroll-mt-28 px-4 py-16 text-center sm:px-6 lg:px-8"
      >
        {edit?.ready ? (
          <SectionEditButton
            label="Editar CTA"
            onClick={() => edit.setSelectedId(CIRCULO_CTA_SECTION_ID)}
          />
        ) : null}
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--ca-brand-light)] sm:text-sm">
          Únete hoy
        </p>
        <h2 className="mt-3 text-2xl font-black sm:text-3xl">{page.ctaTitle}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/90">
          {page.ctaText}
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-white/85">
          Si deseas más información puedes escribirnos a:{" "}
          <a
            href={`mailto:${page.ctaEmail}`}
            className="font-semibold underline underline-offset-2"
          >
            {page.ctaEmail}
          </a>
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <CirculoAmigosInquiryButton
            triggerLabel="Paso 1 — Inscríbete"
            variant="landing"
          />
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-xs leading-relaxed text-white/75">
          {page.notaLegal}
        </p>
      </section>
    </div>
  );
}
