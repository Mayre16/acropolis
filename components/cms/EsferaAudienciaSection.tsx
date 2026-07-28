"use client";

import Image from "next/image";
import {
  Briefcase,
  Building2,
  CheckCircle2,
  GraduationCap,
  Plus,
  Users,
} from "lucide-react";
import { CmsSectionEditBar, CmsEditPencil } from "@/components/cms/CmsEditPencil";
import { useEsferaCmsEdit } from "@/components/cms/EsferaCmsEditContext";
import {
  ESFERA_AUDIENCIA_SECTION_ID,
  esferaAudienciaSelectedId,
} from "@/lib/cms/esfera-page-edit";
import { useEsferaPageDisplay } from "@/lib/cms/esfera-display";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import {
  accentCardShell,
  accentEyebrowClass,
  accentTokens,
} from "@/lib/brand-accents";

const AUDIENCIA_ICONS = [Building2, Briefcase, GraduationCap, Users] as const;

export function EsferaAudienciaSection() {
  const edit = useEsferaCmsEdit();
  const page = useEsferaPageDisplay();
  const audiencias = page.audiencias ?? [];

  return (
    <section className="relative border-t border-na-heket/10 bg-gradient-to-br from-na-kefer/[0.07] via-na-surface to-na-amon/[0.08] py-14 sm:py-16">
      {edit?.ready ? (
        <div className="absolute right-4 top-4 z-10 sm:right-6">
          <CmsSectionEditBar
            label="Editar sección"
            onClick={() => edit.setSelectedId(ESFERA_AUDIENCIA_SECTION_ID)}
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className={accentEyebrowClass(1)}>{page.audienciaEyebrow}</p>
        <h2 className="mt-2 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
          {page.audienciaTitle}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-na-muted sm:text-base">
          {page.audienciaIntro}
        </p>

        {edit?.ready ? (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => edit.addAudiencia()}
              className="inline-flex items-center gap-2 rounded-full bg-na-helios px-4 py-2 text-xs font-bold uppercase text-na-ink shadow"
            >
              <Plus className="h-4 w-4" />
              Añadir perfil
            </button>
          </div>
        ) : null}

        <ul className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {audiencias.map(({ id, sector, items, image, imageAlt }, i) => {
            const a = accentTokens(i);
            const Icon = AUDIENCIA_ICONS[i % AUDIENCIA_ICONS.length] ?? Building2;
            const imageSrc = resolveCmsMediaUrl(image) ?? image;
            return (
              <li
                key={id}
                className={`relative flex flex-col overflow-hidden ${accentCardShell(i, "p-0")}`}
              >
                {edit?.ready ? (
                  <CmsEditPencil
                    label={`Editar ${sector}`}
                    onClick={() =>
                      edit.setSelectedId(esferaAudienciaSelectedId(id))
                    }
                  />
                ) : null}
                <div className="relative aspect-[16/10] w-full bg-na-heket/5">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={imageAlt}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover"
                    />
                  ) : edit?.ready ? (
                    <div className="flex h-full items-center justify-center bg-amber-50 text-xs font-semibold text-amber-800">
                      Sin imagen — clic en lápiz
                    </div>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-start gap-3">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${a.iconBox}`}
                    >
                      <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                    </div>
                    <h3 className={`text-base font-black ${a.icon}`}>{sector}</h3>
                  </div>
                  <ul className="mt-4 space-y-2 border-t border-na-heket/8 pt-4">
                    {items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2 text-sm leading-relaxed text-na-muted"
                      >
                        <CheckCircle2
                          className={`mt-0.5 h-4 w-4 shrink-0 ${a.check}`}
                          strokeWidth={2}
                          aria-hidden
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
