import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
} from "lucide-react";
import { ConstellationHero } from "@/components/diplomado/ConstellationHero";
import { DiplomadoHeroIntro } from "@/components/diplomado/DiplomadoHeroIntro";
import { DiplomadoTestimonialVideo } from "@/components/diplomado/DiplomadoTestimonialVideo";
import { DiplomadoInscriptionBlock } from "@/components/diplomado/DiplomadoInscriptionBlock";
import { DiplomadoOtherSessions } from "@/components/diplomado/DiplomadoOtherSessions";
import { DiplomadoImpactSection } from "@/components/diplomado/DiplomadoImpactSection";
import {
  DIPLOMADO_ABOUT,
  DIPLOMADO_FRAMER_ASSETS,
  DIPLOMADO_MODULOS,
  DIPLOMADO_PROGRAM,
} from "@/lib/diplomado-content";

function ModuloCard({
  n,
  title,
  question,
  image,
  alt,
}: (typeof DIPLOMADO_MODULOS)[number]) {
  return (
    <li className="overflow-hidden rounded-[1.35rem] bg-white shadow-[0_8px_28px_rgba(17,22,49,0.08)]">
      <div className="relative aspect-[16/10] w-full">
        <Image
          src={image}
          alt={alt}
          fill
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 360px"
          loading="eager"
          unoptimized
        />
        <span className="absolute left-3 top-3 rounded-md bg-[#3c3f42] px-2.5 py-1 text-[10px] font-bold text-white">
          Módulo {n}
        </span>
      </div>
      <div className="px-4 py-4">
        <h1 className="text-[1.35rem] font-extrabold leading-[1.15] text-[var(--dip-ink)]">
          {title}
        </h1>
        <h2 className="mt-2 text-sm font-normal leading-relaxed text-[var(--dip-muted)]">
          {question}
        </h2>
      </div>
    </li>
  );
}

export function DiplomadoLanding() {
  return (
    <div className="font-sans">
      {/* —— Hero: móvil (columna Framer) · web (dos columnas) —— */}
      <section className="px-4 pb-0 pt-6 text-center text-white lg:px-8 lg:pb-6 lg:pt-12">
        <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-x-12 lg:gap-y-8 lg:text-left">
          <div className="hero-diplomado-copy">
            <h1 className="mx-auto max-w-[320px] font-bold leading-[1.05] tracking-tight lg:mx-0 lg:max-w-none">
              <span className="block text-[2.65rem] text-white lg:text-[3.25rem]">Filosofía</span>
              <span className="block text-[1.75rem] font-semibold text-white/95 lg:text-[2rem]">
                para la
              </span>
              <span className="block text-[2.85rem] font-bold text-[var(--dip-gold)] lg:text-[3.5rem]">
                Vida
              </span>
            </h1>

            <DiplomadoHeroIntro />
          </div>

          <div className="hero-diplomado-visual order-3 mt-6 lg:order-2 lg:mt-0">
            <ConstellationHero />
          </div>
        </div>
      </section>

      <DiplomadoTestimonialVideo />

      <section className="diplomado-info-banner -mx-0 bg-white px-3 pb-4 lg:px-8 lg:pb-5">
        <a
          href="#otras-sesiones"
          className="mx-auto flex w-full max-w-[280px] items-center justify-center gap-2 rounded-full border-2 border-[var(--dip-teal)]/25 bg-[var(--dip-panel)] px-5 py-2.5 text-sm font-semibold text-[var(--dip-teal)] transition hover:border-[var(--dip-teal)]/45 hover:bg-[var(--dip-teal)]/5"
        >
          Cupos disponibles
          <ChevronDown className="h-4 w-4" aria-hidden />
        </a>
      </section>

      {/* —— Sobre —— */}
      <section className="bg-white px-4 py-10 text-[var(--dip-ink)] lg:px-8 lg:py-14">
        <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-10">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--dip-teal)]">
              {DIPLOMADO_ABOUT.eyebrow.toUpperCase()}
            </p>
            <h2 className="mt-2 text-[2.35rem] font-extrabold leading-[1.05] tracking-tight lg:text-[2.75rem]">
              {DIPLOMADO_ABOUT.title}
            </h2>

            <p className="mt-4 text-[15px] leading-relaxed text-[#262d38] lg:text-base">
              {DIPLOMADO_ABOUT.paragraphs[0]}
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-[#262d38] lg:text-base">
              {DIPLOMADO_ABOUT.paragraphs[1]}
            </p>

            <div className="mt-5 hidden gap-3 lg:flex">
              <span className="diplomado-quote-line" aria-hidden />
              <p className="text-sm leading-relaxed text-[#1f2021]">{DIPLOMADO_ABOUT.paragraphs[2]}</p>
            </div>
          </div>

          <div>
            <div className="relative mx-auto aspect-[4/3] w-full overflow-hidden rounded-2xl lg:mt-0">
              <Image
                src={DIPLOMADO_FRAMER_ASSETS.about}
                alt="Sesión del Diplomado"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 480px"
                loading="eager"
                unoptimized
              />
            </div>

            <div className="mt-5 flex gap-3 lg:hidden">
              <span className="diplomado-quote-line" aria-hidden />
              <p className="text-sm leading-relaxed text-[#1f2021]">{DIPLOMADO_ABOUT.paragraphs[2]}</p>
            </div>
          </div>
        </div>
      </section>

      {/* —— Módulos —— */}
      <section className="bg-[var(--dip-panel)] px-4 py-10 lg:px-8 lg:py-14">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--dip-teal)]">
          {DIPLOMADO_PROGRAM.eyebrow.toUpperCase()}
        </p>
        <h2 className="mt-2 text-[2rem] font-extrabold leading-[1.08] tracking-tight text-[var(--dip-ink)]">
          {DIPLOMADO_PROGRAM.title}
          <span className="block">{DIPLOMADO_PROGRAM.titleAccent}</span>
        </h2>

        <ul className="mt-8 flex flex-col gap-5 lg:grid lg:grid-cols-3 lg:gap-6">
          {DIPLOMADO_MODULOS.map((m) => (
            <ModuloCard key={m.n} {...m} />
          ))}
        </ul>
      </section>

      <DiplomadoImpactSection />

      <DiplomadoInscriptionBlock />

      <DiplomadoOtherSessions />
    </div>
  );
}
