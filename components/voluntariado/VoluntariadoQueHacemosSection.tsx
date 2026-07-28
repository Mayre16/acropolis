"use client";

import Image from "next/image";
import { Pencil } from "lucide-react";
import { useVoluntariadoCmsEdit } from "@/components/cms/VoluntariadoCmsEditContext";
import {
  useVoluntariadoQueHacemosDisplay,
  VOLUNTARIADO_QUE_HACEMOS_SECTION_ID,
  voluntariadoQueHacemosCardId,
} from "@/lib/cms/voluntariado-display";
import { CmsSectionEditBar } from "@/components/cms/CmsEditPencil";
import { accentCardShell, accentEyebrowClass } from "@/lib/brand-accents";

export function VoluntariadoQueHacemosSection() {
  const edit = useVoluntariadoCmsEdit();
  const section = useVoluntariadoQueHacemosDisplay();

  return (
    <section className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      {edit?.ready ? (
        <div className="absolute right-4 top-4 z-10 sm:right-6">
          <CmsSectionEditBar
            label="Editar sección"
            onClick={() => edit.setSelectedId(VOLUNTARIADO_QUE_HACEMOS_SECTION_ID)}
          />
        </div>
      ) : null}

      <p className={accentEyebrowClass(3)}>{section.eyebrow}</p>
      <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
        {section.title}
      </h2>
      <p className="mt-4 max-w-3xl text-na-muted">{section.intro}</p>

      <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {section.cards.map(({ id, src, alt, area, title, text }, i) => (
          <li
            key={id}
            className={`relative flex flex-col overflow-hidden ${accentCardShell(i)}`}
          >
            {edit?.ready ? (
              <button
                type="button"
                onClick={() =>
                  edit.setSelectedId(voluntariadoQueHacemosCardId(id))
                }
                className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white shadow"
                aria-label={`Editar ${title}`}
              >
                <Pencil className="h-4 w-4" />
              </button>
            ) : null}
            <div className="relative aspect-[16/10] w-full bg-na-heket/5">
              <Image
                src={src}
                alt={alt}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                unoptimized
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              {area ? (
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-na-kefer">
                  {area}
                </p>
              ) : null}
              <h3
                className={`text-lg font-black text-na-heketDark ${area ? "mt-2" : ""}`}
              >
                {title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-na-muted">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
