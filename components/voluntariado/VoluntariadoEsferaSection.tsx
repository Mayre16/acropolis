"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ShieldAlert } from "lucide-react";
import { EsferaLogo } from "@/components/EsferaLogo";
import { CmsSectionEditBar } from "@/components/cms/CmsEditPencil";
import { useVoluntariadoCmsEdit } from "@/components/cms/VoluntariadoCmsEditContext";
import {
  useVoluntariadoEsferaDisplay,
  VOLUNTARIADO_ESFERA_SECTION_ID,
} from "@/lib/cms/voluntariado-display";
import {
  ESFERA_OFFICIAL_SITE_LABEL,
  SPHERE_OFFICIAL,
} from "@/lib/esfera-content";

export function VoluntariadoEsferaSection() {
  const edit = useVoluntariadoCmsEdit();
  const esfera = useVoluntariadoEsferaDisplay();

  return (
    <section
      id="esfera"
      className="relative scroll-mt-24 border-t border-na-heket/10 py-14 sm:py-16"
    >
      {edit?.ready ? (
        <div className="absolute right-4 top-4 z-10 sm:right-6">
          <CmsSectionEditBar
            label="Editar sección Esfera"
            onClick={() => edit.setSelectedId(VOLUNTARIADO_ESFERA_SECTION_ID)}
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <div className="flex items-center gap-2 text-na-amon">
              <ShieldAlert className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-[0.28em]">
                {esfera.eyebrow}
              </span>
            </div>
            <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
              {esfera.title}
            </h2>
            <p className="mt-4 text-na-muted">{esfera.intro}</p>
            <p className="mt-4 text-na-muted">{esfera.intro2}</p>
            <Link
              href="/esfera"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-na-heket px-6 py-3 text-sm font-bold text-white shadow-md shadow-na-heket/20 transition hover:bg-na-kefer"
            >
              {esfera.ctaPrimary}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-na-amon/25 bg-gradient-to-br from-na-amon/10 via-na-surface to-na-kefer/10 p-7 shadow-na-card">
            <div className="flex justify-center">
              <EsferaLogo
                variant="punto-focal"
                className="h-14 max-w-[16rem] sm:h-16"
              />
            </div>
            <div className="relative mx-auto mt-6 aspect-[5/4] w-full max-w-[280px]">
              <Image
                src={esfera.manualImageSrc}
                alt={esfera.manualImageAlt}
                fill
                unoptimized
                sizes="280px"
                className="object-contain object-center drop-shadow-xl"
              />
            </div>
            <p className="mt-6 text-sm font-semibold leading-relaxed text-na-heketDark">
              {esfera.manualCaption}
            </p>
            <a
              href={SPHERE_OFFICIAL.home}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-na-kefer transition hover:gap-2 hover:text-na-heket"
            >
              {ESFERA_OFFICIAL_SITE_LABEL}
              <ArrowUpRight className="h-4 w-4" aria-hidden />
            </a>
            <Link
              href="/esfera"
              className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-na-amon transition hover:gap-2"
            >
              {esfera.ctaSecondary}
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
