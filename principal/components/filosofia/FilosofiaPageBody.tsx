"use client";

import Image from "next/image";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  GraduationCap,
  MapPin,
  Pencil,
  Users,
  type LucideIcon,
} from "lucide-react";
import { OfertaFormativaItem } from "@/components/OfertaFormativaItem";
import { useFilosofiaCmsEdit } from "@/components/filosofia/cms/FilosofiaCmsEditContext";
import {
  useFilosofiaAvanzadosDisplay,
  useFilosofiaCtaDisplay,
  useFilosofiaCursoDisplay,
  useFilosofiaEsParaTiDisplay,
  useFilosofiaProgramaDisplay,
  useFilosofiaTemarioDisplay,
} from "@/lib/cms/filosofia-display";
import { useWhatsAppUrls } from "@/lib/cms/hooks";
import { accentCardClass, accentCardShell, accentTokens } from "@/lib/brand-accents";
import { filosofiaSedeEntries } from "@/lib/filosofia-content";
import { mapsUrl } from "@/lib/locations";
import type { CmsFilosofiaFaqIcon } from "@/lib/cms/types";

const FAQ_ICONS: Record<CmsFilosofiaFaqIcon, LucideIcon> = {
  users: Users,
  check: CheckCircle2,
  clock: Clock,
  map: MapPin,
  book: BookOpen,
};

function EditSectionButton({
  section,
  anchor,
  label,
}: {
  section:
    | "programa"
    | "curso"
    | "temario"
    | "avanzados"
    | "esParaTi"
    | "cta";
  anchor: string;
  label: string;
}) {
  const edit = useFilosofiaCmsEdit();
  if (!edit?.ready) return null;
  return (
    <button
      type="button"
      onClick={() => {
        edit.scrollToSection(anchor);
        edit.setActiveSection(section);
        edit.setSelectedFilosofiaSubId(null);
      }}
      className="absolute right-0 top-0 z-10 inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase text-amber-950"
    >
      <Pencil className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

export function FilosofiaPageBody() {
  const programa = useFilosofiaProgramaDisplay();
  const curso = useFilosofiaCursoDisplay();
  const temario = useFilosofiaTemarioDisplay();
  const avanzados = useFilosofiaAvanzadosDisplay();
  const esParaTi = useFilosofiaEsParaTiDisplay();
  const cta = useFilosofiaCtaDisplay();
  const whatsapp = useWhatsAppUrls();

  return (
    <>
      <section
        id="programa-estudios"
        className="scroll-mt-24 mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16"
      >
        <div className="relative">
          <EditSectionButton
            section="programa"
            anchor="programa-estudios"
            label="Editar programa"
          />
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
            {programa.eyebrow}
          </p>
          <h2 className="mt-3 max-w-3xl text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
            {programa.title}
          </h2>
        </div>
        <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-na-heket/5 shadow-na-card">
            <Image
              src={programa.imageSrc}
              alt={programa.imageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized
            />
          </div>
          <div className="space-y-4 text-na-muted">
            {programa.paragraphs.map((p) => (
              <p key={p.slice(0, 40)} className="leading-relaxed first:text-lg">
                {p}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section
        id="curso-introductorio"
        className="scroll-mt-24 border-t border-na-heket/10 bg-na-heket/[0.04] py-14 sm:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative">
            <EditSectionButton
              section="curso"
              anchor="curso-introductorio"
              label="Editar curso"
            />
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
              {curso.eyebrow}
            </p>
            <p className="mt-2 text-sm font-medium text-na-muted">{curso.subtitle}</p>
            <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
              {curso.title}
            </h2>
            <p className="mt-4 max-w-3xl text-lg font-normal text-na-muted">{curso.lede}</p>
          </div>

          <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.15fr]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] bg-na-heket/5 shadow-na-card sm:aspect-[3/4] lg:aspect-auto lg:min-h-[28rem]">
              <Image
                src={curso.heroImageSrc}
                alt={curso.heroImageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
                unoptimized
              />
            </div>

            <div className="flex flex-col gap-8">
              <div>
                <h3 className="text-lg font-black text-na-heketDark">
                  {curso.aprenderasTitle}
                </h3>
                <ul className="mt-4 space-y-3">
                  {curso.aprenderas.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-na-muted">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-na-kefer" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-na-heket/10 bg-na-surface p-6 shadow-na-soft">
                <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-wide text-na-heketDark">
                  <BookOpen className="h-4 w-4 text-na-kefer" />
                  {curso.cursoInfoTitle}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-na-muted">
                  {curso.cursoInfoLede}
                </p>
                <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                  {curso.cursoInfo.map(({ label, value }) => (
                    <div key={label}>
                      <dt className="text-xs font-bold uppercase tracking-wide text-na-muted">
                        {label}
                      </dt>
                      <dd className="mt-1 text-sm font-semibold text-na-heketDark">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-5 text-xs font-bold uppercase tracking-wide text-na-muted">
                  {curso.incluyeLabel}
                </p>
                <ul className="mt-2 space-y-1.5">
                  {curso.incluye.map((item) => (
                    <li key={item} className="text-sm text-na-heketDark">
                      · {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-14">
            <h3 className="text-center text-xl font-black text-na-heketDark sm:text-2xl">
              {curso.modulosTitle}
            </h3>
            <ul className="mt-8 grid gap-7 md:grid-cols-3">
              {curso.modulos.map((m, i) => {
                const a = accentTokens(i);
                return (
                  <li
                    key={m.id}
                    className={`flex flex-col overflow-hidden ${accentCardShell(i)}`}
                  >
                    <div className="relative aspect-[16/10] w-full bg-na-heket/5">
                      <Image
                        src={m.src}
                        alt={m.alt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        unoptimized
                      />
                      {m.badge ? (
                        <span
                          className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-black shadow ${a.badge}`}
                        >
                          Módulo {m.badge}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <OfertaFormativaItem
                        title={m.title}
                        intro={m.text}
                        titleClassName="text-lg leading-snug"
                        introClassName="mt-2 flex-1"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </section>

      <section
        id="temario"
        className="scroll-mt-24 mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16"
      >
        <div className="relative">
          <EditSectionButton
            section="temario"
            anchor="temario"
            label="Editar temario"
          />
          <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
            {temario.eyebrow}
          </p>
          <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
            {temario.title}
          </h2>
          <p className="mt-4 max-w-2xl text-na-muted">{temario.intro}</p>
        </div>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {temario.items.map((t, i) => (
            <li
              key={t.id}
              className={`flex flex-col overflow-hidden ${accentCardShell(i)}`}
            >
              <div className="relative aspect-[16/10] w-full bg-na-heket/5">
                <Image
                  src={t.src}
                  alt={t.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  unoptimized
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <OfertaFormativaItem
                  title={t.title}
                  intro={t.text}
                  titleClassName="leading-snug"
                  introClassName="mt-2 flex-1"
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="cursos-avanzados"
        className="scroll-mt-24 border-t border-na-heket/10 bg-na-heket/[0.04] py-14 sm:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div className="relative">
              <EditSectionButton
                section="avanzados"
                anchor="cursos-avanzados"
                label="Editar avanzados"
              />
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
                {avanzados.eyebrow}
              </p>
              <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
                {avanzados.title}
              </h2>
              {avanzados.paragraphs.map((p, i) => (
                <p
                  key={p.slice(0, 40)}
                  className={`text-na-muted ${i === 0 ? "mt-4" : "mt-3 text-sm"}`}
                >
                  {p}
                </p>
              ))}
              <ul className="mt-8 flex flex-wrap gap-2.5">
                {avanzados.materias.map((m) => (
                  <li
                    key={m}
                    className="rounded-full border border-na-heket/15 bg-na-surface px-4 py-2 text-sm font-medium text-na-heketDark shadow-na-soft"
                  >
                    {m}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-na-heket/5 shadow-na-card">
              <Image
                src={avanzados.imageSrc}
                alt={avanzados.imageAlt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 45vw"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-na-heketDark/80 via-transparent to-transparent" />
              <div className="absolute bottom-0 p-6">
                <GraduationCap className="h-8 w-8 text-na-helios" strokeWidth={1.5} />
                <p className="mt-2 text-sm font-bold text-white">
                  {avanzados.imageCaption}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="es-para-ti"
        className="scroll-mt-24 mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16"
      >
        <div className="relative">
          <EditSectionButton
            section="esParaTi"
            anchor="es-para-ti"
            label="Editar ¿Es para ti?"
          />
          <h2 className="text-center text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
            {esParaTi.title}
          </h2>
        </div>
        <div className="mt-10 flex flex-col gap-4">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {esParaTi.items.slice(0, 3).map(({ id, icon = "book", title, text }, i) => {
              const Icon = FAQ_ICONS[icon] ?? BookOpen;
              return (
                <li key={id} className={accentCardClass(i)}>
                  <Icon className={`h-6 w-6 ${accentTokens(i).icon}`} strokeWidth={1.8} />
                  <OfertaFormativaItem
                    title={title}
                    intro={text}
                    titleClassName="mt-3 text-base"
                    introClassName="mt-2 whitespace-pre-line"
                  />
                </li>
              );
            })}
          </ul>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {esParaTi.items.slice(3).map(({ id, icon = "book", title, text }, j) => {
              const i = j + 3;
              const Icon = FAQ_ICONS[icon] ?? BookOpen;
              const isSedes = id === "sedes";
              return (
                <li
                  key={id}
                  className={accentCardClass(
                    i,
                    isSedes ? "lg:col-span-2 sm:p-6" : "lg:col-span-1",
                  )}
                >
                  <Icon
                    className={`${isSedes ? "h-7 w-7" : "h-6 w-6"} ${accentTokens(i).icon}`}
                    strokeWidth={1.8}
                  />
                  {isSedes ? (
                    <>
                      <h3 className="mt-3 text-lg font-black text-na-heketDark">
                        {title}
                      </h3>
                      <ul className="mt-2 space-y-2 text-sm leading-relaxed sm:text-base">
                        {filosofiaSedeEntries().map(({ id: venueId, label, address, mapsQuery }) => (
                          <li key={venueId}>
                            <span className="font-semibold text-na-heketDark">{label}</span>
                            {" — "}
                            <a
                              href={mapsUrl(mapsQuery)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-na-heket underline-offset-2 transition hover:text-na-kefer hover:underline"
                            >
                              {address}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <OfertaFormativaItem
                      title={title}
                      intro={text}
                      titleClassName="mt-3 text-base"
                      introClassName="mt-2 whitespace-pre-line"
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section
        id="inscripcion-cta"
        className="scroll-mt-24 border-t border-na-heket/10 bg-na-heket/[0.04] py-14 sm:py-16"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-na-heketDark via-na-heket to-na-kefer p-8 text-center shadow-na-card sm:p-12">
            <EditSectionButton
              section="cta"
              anchor="inscripcion-cta"
              label="Editar inscripción"
            />
            <h2 className="text-balance text-2xl font-black text-white sm:text-3xl">
              {cta.title}
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-white/85">{cta.text}</p>
            <a
              href={`${whatsapp.diplomado}?text=${encodeURIComponent(cta.whatsappMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-na-helios px-7 py-3.5 text-sm font-bold text-na-ink shadow-lg shadow-na-helios/30 transition hover:brightness-105"
            >
              {cta.buttonLabel}
              <ArrowRight className="h-4 w-4" />
            </a>

            <div className="relative mx-auto mt-10 aspect-[16/9] w-full max-w-2xl overflow-hidden rounded-2xl bg-white/10 shadow-na-card ring-1 ring-white/20">
              <Image
                src={cta.imageSrc}
                alt={cta.imageAlt}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 42rem"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
