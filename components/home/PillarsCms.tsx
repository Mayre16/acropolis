"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, Drama, HeartHandshake, ArrowRight, Pencil } from "lucide-react";
import { useHomeCmsEdit } from "@/components/cms/HomeCmsEditContext";
import { DEFAULT_HOME_PAGE, mergeHomePage } from "@/lib/cms/home-page-edit";
import { useCmsDocument, isCmsEnabled } from "@/lib/cms/provider";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import { accentCardShell, accentTokens } from "@/lib/brand-accents";

const PILLAR_ICONS = {
  filosofia: BookOpen,
  cultura: Drama,
  voluntariado: HeartHandshake,
} as const;

export function PillarsCms() {
  const cms = useCmsDocument();
  const edit = useHomeCmsEdit();
  const page = edit?.ready
    ? mergeHomePage({ ...DEFAULT_HOME_PAGE, ...edit.homePage })
    : mergeHomePage(isCmsEnabled() ? cms?.sections.homePage : undefined);
  const pillars = page.pillars ?? DEFAULT_HOME_PAGE.pillars!;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <p className="text-center text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
        Áreas de actuación
      </p>
      <h2 className="sr-only">Filosofía, Cultura y Voluntariado</h2>

      <ul className="mt-12 grid gap-6 md:grid-cols-3">
        {pillars.map((pillar, i) => {
          const Icon =
            PILLAR_ICONS[pillar.id as keyof typeof PILLAR_ICONS] ?? BookOpen;
          const a = accentTokens(i);
          const imgSrc =
            resolveCmsMediaUrl(pillar.img) ?? pillar.img ?? "";

          return (
            <li
              key={pillar.id}
              className={`group relative flex flex-col p-7 ${accentCardShell(i)}`}
            >
              {edit?.ready ? (
                <button
                  type="button"
                  onClick={() => edit.setSelected("pillar", pillar.id)}
                  className="absolute right-3 top-3 z-10 rounded-full bg-amber-500 p-2 text-white shadow"
                  aria-label={`Editar ${pillar.title}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              ) : null}
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${a.iconWrap} ${a.icon}`}
              >
                <Icon className="h-6 w-6" strokeWidth={1.8} />
              </div>
              <h3 className="mt-5 text-xl font-black text-na-heketDark">
                {pillar.title}
              </h3>
              <p className={`mt-2 text-sm font-bold ${a.link}`}>
                {pillar.tagline}
              </p>
              <div className="relative mt-4 aspect-[16/10] w-full overflow-hidden rounded-xl bg-na-heket/5">
                {imgSrc ? (
                  <Image
                    src={imgSrc}
                    alt={pillar.imgAlt ?? pillar.title}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                    unoptimized
                  />
                ) : null}
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-na-muted">
                {pillar.text}
              </p>
              <Link
                href={pillar.href ?? "#"}
                className={`mt-3 inline-flex items-center gap-2 text-sm font-bold transition group-hover:gap-3 ${a.link}`}
              >
                {pillar.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
