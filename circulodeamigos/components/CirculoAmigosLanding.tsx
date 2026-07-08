import Image from "next/image";
import { CirculoAmigosInquiryButton } from "@/components/CirculoAmigosInquiryButton";
import {
  CIRCULO_AMIGOS_BENEFICIOS,
  CIRCULO_AMIGOS_EMAIL,
  CIRCULO_AMIGOS_ESPERAMOS,
  CIRCULO_AMIGOS_HERO,
  CIRCULO_AMIGOS_IMAGE,
  CIRCULO_AMIGOS_INTRO,
  CIRCULO_AMIGOS_INTRO_IMAGES,
  CIRCULO_AMIGOS_NOTA_LEGAL,
  CIRCULO_AMIGOS_PASOS,
  CIRCULO_AMIGOS_PILARES,
  CIRCULO_AMIGOS_RECIBES,
} from "@/lib/circulo-amigos-content";

const PASO_IDS = ["inscribe", "conecta", "participa"] as const;

export function CirculoAmigosLanding() {
  return (
    <div className="font-sans text-[var(--ca-ink)]">
      <section className="ca-sec-hero relative overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <div className="lg:grid lg:min-h-[min(32rem,82vh)] lg:grid-cols-2 lg:items-center lg:gap-x-8 xl:gap-x-12">
            <div className="order-first pt-3 pb-8 sm:pt-4 lg:order-last lg:flex lg:w-full lg:justify-center lg:pb-10 lg:pt-5">
              <div className="ca-hero-photo relative mx-auto aspect-[1024/478] w-full max-w-[28rem] overflow-hidden rounded-2xl sm:max-w-[36rem] lg:max-w-none lg:w-full lg:rounded-[1.25rem]">
                <Image
                  src={CIRCULO_AMIGOS_IMAGE.src}
                  alt={CIRCULO_AMIGOS_IMAGE.alt}
                  fill
                  unoptimized
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 640px"
                />
              </div>
            </div>

            <div className="relative flex flex-col justify-center pb-10 sm:pb-14 lg:py-10">
              <p className="ca-eyebrow">{CIRCULO_AMIGOS_HERO.eyebrow}</p>
              <h1 className="ca-title mt-3 max-w-3xl text-balance text-[2rem] font-black leading-[1.08] tracking-tight sm:text-[2.65rem] lg:text-[3rem]">
                {CIRCULO_AMIGOS_HERO.title}
              </h1>
              <h2 className="ca-title--deep mt-4 max-w-2xl text-balance text-xl font-bold leading-snug sm:text-2xl">
                {CIRCULO_AMIGOS_HERO.subtitle}
              </h2>
              <h3 className="mt-5 max-w-2xl text-base font-normal leading-relaxed text-[var(--ca-muted)] sm:text-lg">
                {CIRCULO_AMIGOS_HERO.lede}
              </h3>
              <div className="mt-8 flex flex-wrap gap-3" id="inscripcion">
                <CirculoAmigosInquiryButton
                  triggerLabel="Inscríbete ahora"
                  variant="landing"
                  triggerClassName="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--ca-brand)] px-6 py-3 text-sm font-bold text-white shadow-md shadow-[rgba(58,154,212,0.28)] transition hover:bg-[var(--ca-brand-dark)]"
                />
                <a
                  href={`mailto:${CIRCULO_AMIGOS_EMAIL}?subject=${encodeURIComponent("Consulta — Círculo de Amigos")}`}
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
        <div className="mx-auto max-w-5xl">
          <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1fr]">
            <div className="relative aspect-[655/511] overflow-hidden rounded-2xl border border-[var(--ca-brand)]/10 bg-[var(--ca-panel)] shadow-[0_10px_30px_rgba(58,154,212,0.1)]">
              <Image
                src={CIRCULO_AMIGOS_INTRO_IMAGES.foto.src}
                alt={CIRCULO_AMIGOS_INTRO_IMAGES.foto.alt}
                fill
                unoptimized
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 420px"
              />
            </div>
            <div className="text-center lg:text-left">
              <p className="ca-eyebrow">Conoce el programa</p>
              <h2 className="ca-title--deep mt-3 text-2xl font-black sm:text-3xl">
                ¿Qué es el Círculo de Amigos?
              </h2>
              <div className="mt-5 space-y-4 text-base leading-relaxed text-[var(--ca-muted)]">
                {CIRCULO_AMIGOS_INTRO.map((p) => (
                  <p key={p.slice(0, 40)}>{p}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="ca-sec-panel px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <p className="ca-eyebrow text-center">Fundamentos</p>
        <h2 className="ca-title--deep mt-3 text-center text-2xl font-black sm:text-3xl">
          Nuestros tres pilares
        </h2>
        <ul className="mt-10 grid gap-5 sm:grid-cols-3">
          {CIRCULO_AMIGOS_PILARES.map((item) => (
            <li key={item.title} className="ca-pilar-card overflow-hidden rounded-2xl bg-white shadow-[0_10px_30px_rgba(58,154,212,0.1)]">
              <div className="relative aspect-[4/3] bg-[var(--ca-panel)]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="320px"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="ca-title--dark text-lg font-black">{item.title}</h3>
                <p className="mt-2 text-sm text-[var(--ca-muted)]">{item.text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="ca-sec-sky px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <p className="ca-eyebrow text-center">Ventajas</p>
        <h2 className="ca-title mt-3 text-center text-2xl font-black sm:text-3xl">
          Beneficios exclusivos para ti
        </h2>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {CIRCULO_AMIGOS_BENEFICIOS.map((item) => (
            <li
              key={item.title}
              className="ca-benefit-card flex flex-col items-center rounded-2xl p-6 text-center sm:p-8"
            >
              <div className="relative h-36 w-36 overflow-hidden rounded-full bg-white sm:h-40 sm:w-40">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  unoptimized
                  className="object-cover"
                  sizes="160px"
                />
              </div>
              <h3 className="ca-title--dark mt-5 font-black">{item.title}</h3>
              <p className="mt-2 text-sm text-[var(--ca-muted)]">{item.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="ca-sec-steps px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <p className="ca-eyebrow text-center">Proceso</p>
        <h2 className="ca-title--deep mt-3 text-center text-2xl font-black sm:text-3xl">
          Cómo unirte en tres pasos sencillos
        </h2>
        <ol className="mt-10 grid gap-5 sm:grid-cols-3">
          {CIRCULO_AMIGOS_PASOS.map((step, i) => (
            <li
              key={step.n}
              className="ca-step-card rounded-2xl p-6 text-center"
            >
              <div
                className={
                  PASO_IDS[i] === "conecta"
                    ? "relative mx-auto aspect-square w-32 rounded-xl bg-[var(--ca-panel)] ring-1 ring-[var(--ca-brand)]/15"
                    : "relative mx-auto aspect-square w-32 overflow-hidden rounded-full bg-[var(--ca-panel)] ring-1 ring-[var(--ca-brand)]/15"
                }
              >
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  unoptimized
                  className={
                    PASO_IDS[i] === "conecta" ? "object-contain p-2" : "object-cover"
                  }
                  sizes="128px"
                />
              </div>
              <span
                className={`mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ca-step-num--${i}`}
              >
                {step.n}
              </span>
              <h3 className="ca-title--dark mt-4 text-lg font-black">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--ca-muted)]">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="ca-sec-snow px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-2">
          <div className="ca-card-recibes rounded-2xl bg-[var(--ca-panel)] p-6 sm:p-8">
            <h2 className="ca-title--dark text-xl font-black">Lo que recibirás al unirte</h2>
            <ul className="mt-5 space-y-3">
              {CIRCULO_AMIGOS_RECIBES.map((item) => (
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
          <div className="ca-card-esperamos rounded-2xl border border-[var(--ca-brand)]/15 bg-white p-6 sm:p-8">
            <h2 className="ca-title--deep text-xl font-black">Lo que esperamos de ti</h2>
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

      <section
        id="inscribete"
        className="ca-sec-cta scroll-mt-28 px-4 py-16 text-center sm:px-6 lg:px-8"
      >
        <p className="text-xs font-bold uppercase tracking-[0.28em] text-[var(--ca-brand-light)] sm:text-sm">
          Únete hoy
        </p>
        <h2 className="mt-3 text-2xl font-black sm:text-3xl">¿Listo para dar el paso?</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/90">
          Únete a nosotros y forma parte de un movimiento que busca un mundo mejor.
        </p>
        <p className="mx-auto mt-4 max-w-2xl text-sm text-white/85">
          Si deseas más información puedes escribirnos a:{" "}
          <a href={`mailto:${CIRCULO_AMIGOS_EMAIL}`} className="font-semibold underline">
            {CIRCULO_AMIGOS_EMAIL}
          </a>
        </p>
        <div className="mt-8 flex justify-center">
          <CirculoAmigosInquiryButton triggerLabel="Paso 1 — Inscríbete" variant="landing" />
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-xs text-white/75">{CIRCULO_AMIGOS_NOTA_LEGAL}</p>
      </section>
    </div>
  );
}
