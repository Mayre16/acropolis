"use client";

import {
  Building2,
  CalendarClock,
  Flag,
  Globe2,
  MapPin,
  type LucideIcon,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { CmsSectionEditBar } from "@/components/cms/CmsEditPencil";
import { useQuienesSomosCmsEdit } from "@/components/cms/InstitutionalPageCmsEditContext";
import { OINA_CIFRAS_SECTION_ID } from "@/lib/cms/institutional-page-edit";
import { useQuienesSomosPageDisplay } from "@/lib/cms/quienes-somos-display";
import { brandLogoHeightClass } from "@/lib/brand-clear-space";
import { FUNDACION_ORGANIZACION_BLOCKS } from "@/lib/institucional-content";

const OINA_STAT_ICONS: Record<string, LucideIcon> = {
  o1: CalendarClock,
  o2: Flag,
  o3: Globe2,
  o4: MapPin,
  o5: Building2,
};

export function FundacionOrganizacionSection() {
  const page = useQuienesSomosPageDisplay();
  const edit = useQuienesSomosCmsEdit();
  const editing = !!edit?.ready;
  const stats = page.oinaStats ?? [];

  return (
    <section
      id="fundacion-organizacion"
      className="scroll-mt-36 border-t border-na-heket/10 bg-na-heket/[0.04] py-14 sm:py-16"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.32em] text-na-kefer">
          Organización internacional
        </p>
        <h2 className="mt-3 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
          Fundación, Organización y Estructura
        </h2>

        <ul className="mt-10 grid gap-6 lg:grid-cols-2">
          {FUNDACION_ORGANIZACION_BLOCKS.map((block) => (
            <li
              key={block.title}
              className="rounded-2xl border border-na-heket/10 bg-na-surface p-6 shadow-na-soft sm:p-7"
            >
              <h3 className="text-lg font-black text-na-heketDark">
                {block.title}
              </h3>
              <p className="mt-2 text-sm font-semibold text-na-kefer">
                {block.question}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-na-muted">
                {block.text}
              </p>
            </li>
          ))}
        </ul>

        <div className="relative mt-10 rounded-[1.75rem] bg-gradient-to-br from-na-heketDark via-na-heket to-na-kefer p-8 shadow-na-card sm:p-12">
          {editing ? (
            <div className="absolute right-4 top-4 z-10 sm:right-6">
              <CmsSectionEditBar
                label="Editar OINA en cifras"
                onClick={() => edit?.setSelectedId(OINA_CIFRAS_SECTION_ID)}
              />
            </div>
          ) : null}
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-na-helios">
                {page.oinaCifrasEyebrow}
              </p>
              <p className="mt-4 max-w-xl text-white/80">
                {page.oinaCifrasIntro}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
              <div className="flex justify-center overflow-visible">
                <BrandLogo
                  lockup="oinadom"
                  variant="white"
                  render="raster"
                  className={brandLogoHeightClass.sectionStacked}
                />
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
                {stats.map((stat) => {
                  const Icon = OINA_STAT_ICONS[stat.id] ?? CalendarClock;
                  return (
                    <div key={stat.id} className="rounded-xl bg-white/5 p-4">
                      <Icon
                        className="h-5 w-5 text-na-helios"
                        strokeWidth={1.8}
                      />
                      <p className="mt-2 text-lg font-black text-white">
                        {stat.value}
                      </p>
                      <p className="text-xs leading-snug text-white/70">
                        {stat.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
