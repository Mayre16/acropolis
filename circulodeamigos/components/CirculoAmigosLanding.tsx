import Image from "next/image";
import {
  BookOpen,
  Globe2,
  Heart,
  Lightbulb,
  Sparkles,
  Users,
} from "lucide-react";
import { CirculoAmigosInquiryButton } from "@/components/CirculoAmigosInquiryButton";
import {
  CIRCULO_AMIGOS_BENEFICIOS,
  CIRCULO_AMIGOS_ESPERAMOS,
  CIRCULO_AMIGOS_HERO,
  CIRCULO_AMIGOS_IMAGE,
  CIRCULO_AMIGOS_INTRO,
  CIRCULO_AMIGOS_NOTA_LEGAL,
  CIRCULO_AMIGOS_PASOS,
  CIRCULO_AMIGOS_PILARES,
  CIRCULO_AMIGOS_RECIBES,
} from "@/lib/circulo-amigos-content";
import { INFO_EMAIL } from "@/lib/site-config";

const PILAR_ICONS = [Heart, BookOpen, Lightbulb] as const;
const BENEFICIO_ICONS = [Sparkles, Globe2, Users, Lightbulb] as const;

export function CirculoAmigosLanding() {
  return (
    <div className="font-sans text-[var(--ca-ink)]">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 pb-16 pt-10 text-white sm:px-6 lg:px-8 lg:pb-20 lg:pt-14">
        <div className="pointer-events-none absolute -right-20 top-0 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-0 h-56 w-56 rounded-full bg-[var(--ca-brand-light)]/20 blur-3xl" />

        <div className="relative grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/85">
              {CIRCULO_AMIGOS_HERO.eyebrow}
            </p>
            <h1 className="mt-3 text-balance text-[2rem] font-black leading-[1.08] sm:text-[2.65rem] lg:text-[3rem]">
              {CIRCULO_AMIGOS_HERO.title}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
              {CIRCULO_AMIGOS_HERO.lede}
            </p>
            <div className="mt-8 flex flex-wrap gap-3" id="inscripcion">
              <CirculoAmigosInquiryButton
                triggerLabel="Inscríbete ahora"
                variant="landing"
              />
              <a
                href={`mailto:${INFO_EMAIL}?subject=${encodeURIComponent("Consulta — Círculo de Amigos")}`}
                className="inline-flex items-center justify-center rounded-full border-2 border-white/35 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20"
              >
                Más información
              </a>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-[0_24px_60px_rgba(17,22,49,0.22)] ring-1 ring-white/20">
            <Image
              src={CIRCULO_AMIGOS_IMAGE.src}
              alt={CIRCULO_AMIGOS_IMAGE.alt}
              fill
              unoptimized
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 540px"
            />
          </div>
        </div>
      </section>

      {/* Qué es */}
      <section className="bg-[var(--ca-surface)] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[var(--ca-brand-dark)]">
            ¿Qué es el Círculo de Amigos?
          </p>
          <div className="mt-5 space-y-4 text-left text-base leading-relaxed text-[var(--ca-muted)] sm:text-center">
            {CIRCULO_AMIGOS_INTRO.map((p) => (
              <p key={p.slice(0, 40)}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Pilares */}
      <section className="bg-[var(--ca-panel)] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="text-center">
          <h2 className="text-2xl font-black text-[var(--ca-ink)] sm:text-3xl">
            Nuestros tres pilares
          </h2>
        </div>
        <ul className="mt-10 grid gap-5 sm:grid-cols-3">
          {CIRCULO_AMIGOS_PILARES.map((item, i) => {
            const Icon = PILAR_ICONS[i] ?? Heart;
            return (
              <li
                key={item.title}
                className="rounded-2xl bg-white p-6 shadow-[0_10px_30px_rgba(58,154,212,0.12)]"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--ca-bg)] text-[var(--ca-brand-dark)]">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 text-lg font-black text-[var(--ca-ink)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--ca-muted)]">
                  {item.text}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Beneficios */}
      <section className="bg-[var(--ca-surface)] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="text-center">
          <h2 className="text-2xl font-black text-[var(--ca-ink)] sm:text-3xl">
            Beneficios exclusivos para ti
          </h2>
        </div>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2">
          {CIRCULO_AMIGOS_BENEFICIOS.map((item, i) => {
            const Icon = BENEFICIO_ICONS[i] ?? Sparkles;
            return (
              <li
                key={item.title}
                className="flex gap-4 rounded-2xl border border-[var(--ca-brand)]/15 bg-[var(--ca-panel)] p-5"
              >
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--ca-brand)] text-white">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <h3 className="font-black text-[var(--ca-ink)]">{item.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--ca-muted)]">
                    {item.text}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Pasos */}
      <section className="bg-[var(--ca-brand-dark)] px-4 py-14 text-white sm:px-6 lg:px-8 lg:py-16">
        <div className="text-center">
          <h2 className="text-2xl font-black sm:text-3xl">
            Cómo unirte en tres pasos sencillos
          </h2>
        </div>
        <ol className="mt-10 grid gap-5 sm:grid-cols-3">
          {CIRCULO_AMIGOS_PASOS.map((step) => (
            <li
              key={step.n}
              className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm ring-1 ring-white/15"
            >
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-black text-[var(--ca-brand-dark)]">
                {step.n}
              </span>
              <h3 className="mt-4 text-lg font-black">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/85">
                {step.text}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Recibes / Esperamos */}
      <section className="bg-[var(--ca-surface)] px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl bg-[var(--ca-panel)] p-6 sm:p-8">
            <h2 className="text-xl font-black text-[var(--ca-ink)]">
              Lo que recibirás al unirte
            </h2>
            <ul className="mt-5 space-y-3">
              {CIRCULO_AMIGOS_RECIBES.map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-sm leading-relaxed text-[var(--ca-muted)]"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--ca-brand)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[var(--ca-brand)]/20 bg-white p-6 sm:p-8">
            <h2 className="text-xl font-black text-[var(--ca-ink)]">
              Lo que esperamos de ti
            </h2>
            <ul className="mt-5 space-y-3">
              {CIRCULO_AMIGOS_ESPERAMOS.map((item) => (
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

      {/* CTA final */}
      <section className="bg-gradient-to-br from-[var(--ca-brand-dark)] to-[var(--ca-brand)] px-4 py-16 text-center text-white sm:px-6 lg:px-8">
        <h2 className="text-2xl font-black sm:text-3xl">
          ¿Listo para dar el paso?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-white/90">
          Únete a nosotros y forma parte de un movimiento que busca un mundo
          mejor.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <CirculoAmigosInquiryButton
            triggerLabel="Paso 1 — Inscríbete"
            variant="landing"
          />
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-xs leading-relaxed text-white/75">
          {CIRCULO_AMIGOS_NOTA_LEGAL}
        </p>
      </section>
    </div>
  );
}
