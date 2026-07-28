import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PRINCIPIOS_OINA } from "@/lib/institucional-content";
import { accentCardShell, accentTokens } from "@/lib/brand-accents";

export function Values({ showFundacionalLink = true }: { showFundacionalLink?: boolean }) {
  return (
    <section id="principios" className="scroll-mt-36 bg-na-heket/[0.04] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-amon">
              Nuestros principios
            </p>
            <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
              Fraternidad, Conocimiento y Desarrollo
            </h2>
            <p className="mt-4 text-na-muted">
              Los principios de la Carta Fundacional de la Organización
              Internacional Nueva Acrópolis orientan nuestra acción en filosofía,
              cultura y voluntariado.
            </p>
            {showFundacionalLink ? (
              <Link
                href="/principios"
                className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-na-heket transition hover:gap-3"
              >
                Conoce la Carta Fundacional
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : null}
          </div>

          <ul className="grid gap-4 sm:grid-cols-1">
            {PRINCIPIOS_OINA.map((v, i) => (
              <li key={v.title} className={accentCardShell(i, "p-6")}>
                <h3 className={`text-lg font-black ${accentTokens(i).icon}`}>
                  {v.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-na-muted">
                  {v.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
