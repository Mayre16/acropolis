import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Drama,
  HeartHandshake,
} from "lucide-react";
import { AREAS_ACTUACION_INSTITUCIONAL } from "@/lib/institucional-content";
import { accentCardShell, accentTokens } from "@/lib/brand-accents";

const ICONS = [BookOpen, Drama, HeartHandshake] as const;

export function AreasActuacionInstitucionalSection() {
  return (
    <section
      id="areas-actuacion"
      className="scroll-mt-36 border-t border-na-heket/10 bg-na-heket/[0.04] py-14 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-center text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
          Áreas de actuación
        </p>
        <h2 className="mt-3 text-center text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
          Filosofía, Cultura y Voluntariado
        </h2>

        <ul className="mt-10 grid gap-6 lg:grid-cols-3">
          {AREAS_ACTUACION_INSTITUCIONAL.map((area, i) => {
            const Icon = ICONS[i] ?? BookOpen;
            const a = accentTokens(i);
            return (
              <li key={area.title} className={`flex flex-col p-7 ${accentCardShell(i)}`}>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${a.iconWrap} ${a.icon}`}
                >
                  <Icon className="h-6 w-6" strokeWidth={1.8} aria-hidden />
                </div>
                <h3 className="mt-5 text-xl font-black text-na-heketDark">
                  {area.title}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-relaxed text-na-muted">
                  {area.text}
                </p>
                <Link
                  href={area.href}
                  className={`mt-5 inline-flex items-center gap-2 text-sm font-bold transition hover:gap-3 ${a.link}`}
                >
                  Ver {area.title.toLowerCase()}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
