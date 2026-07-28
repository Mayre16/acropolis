import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Drama,
  FileText,
  HeartHandshake,
  Library,
} from "lucide-react";
import {
  AREAS_ACTUACION_INSTITUCIONAL,
  AREAS_DOCUMENTOS_INSTITUCIONALES,
} from "@/lib/institucional-content";
import { accentCardShell, accentTokens } from "@/lib/brand-accents";

const ICONS = [BookOpen, Drama, HeartHandshake] as const;
const DOC_ICONS = [Library, FileText] as const;

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

        <div className="mt-14 border-t border-na-heket/10 pt-12">
          <p className="text-center text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
            Publicaciones e institucional
          </p>
          <h3 className="mt-3 text-center text-balance text-2xl font-black text-na-heketDark sm:text-3xl">
            Anuario y CV institucional
          </h3>
          <ul className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
            {AREAS_DOCUMENTOS_INSTITUCIONALES.map((doc, i) => {
              const Icon = DOC_ICONS[i] ?? FileText;
              const a = accentTokens(i + 3);
              return (
                <li key={doc.title}>
                  <Link
                    href={doc.href}
                    className={`flex h-full flex-col p-6 ${accentCardShell(i + 3)}`}
                  >
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${a.iconWrap} ${a.icon}`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                    </div>
                    <span className="mt-4 text-lg font-black text-na-heketDark">
                      {doc.title}
                    </span>
                    <span className="mt-2 flex-1 text-sm leading-relaxed text-na-muted">
                      {doc.text}
                    </span>
                    <span
                      className={`mt-4 inline-flex items-center gap-2 text-sm font-bold ${a.link}`}
                    >
                      Ver {doc.title.toLowerCase()}
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
