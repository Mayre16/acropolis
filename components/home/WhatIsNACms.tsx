"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Pencil } from "lucide-react";
import { useHomeCmsEdit } from "@/components/cms/HomeCmsEditContext";
import { DEFAULT_HOME_PAGE, mergeHomePage } from "@/lib/cms/home-page-edit";
import { useCmsDocument, isCmsEnabled } from "@/lib/cms/provider";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";

export function WhatIsNACms() {
  const cms = useCmsDocument();
  const edit = useHomeCmsEdit();
  const page = edit?.ready
    ? mergeHomePage({ ...DEFAULT_HOME_PAGE, ...edit.homePage })
    : mergeHomePage(isCmsEnabled() ? cms?.sections.homePage : undefined);
  const what = page.whatIsNa ?? DEFAULT_HOME_PAGE.whatIsNa!;
  const imageSrc = resolveCmsMediaUrl(what.imageSrc) ?? what.imageSrc ?? "";

  return (
    <section className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      {edit?.ready ? (
        <button
          type="button"
          onClick={() => edit.setSelected("whatIsNa", "whatIsNa")}
          className="absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase text-amber-950 sm:right-6"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar bloque
        </button>
      ) : null}
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.5rem] bg-na-heket/5 shadow-na-card">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={what.imageAlt ?? ""}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              unoptimized
            />
          ) : null}
        </div>
        <div>
          {(what.paragraphs ?? []).map((p) => (
            <p key={p.slice(0, 24)} className="mt-5 text-na-muted first:mt-0">
              {p.includes("Escuela de Filosofía") ? (
                <>
                  {p.split("Escuela de Filosofía")[0]}
                  <strong className="text-na-heketDark">
                    Escuela de Filosofía
                  </strong>
                  {p.split("Escuela de Filosofía")[1]}
                </>
              ) : (
                p
              )}
            </p>
          ))}
          <p className="mt-4 font-bold text-na-heketDark">
            ¡Conoce un poco más de nuestro trabajo!
          </p>
          <Link
            href="/quienes-somos"
            className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-na-heket px-6 py-3 text-sm font-bold text-na-heket transition hover:bg-na-heket hover:text-white"
          >
            {what.ctaLabel ?? "Nuestra historia"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
