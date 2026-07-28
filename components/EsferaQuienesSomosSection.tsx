"use client";

import Image from "next/image";
import { useState } from "react";
import { CmsSectionEditBar, CmsEditPencil } from "@/components/cms/CmsEditPencil";
import { useEsferaCmsEdit } from "@/components/cms/EsferaCmsEditContext";
import {
  ESFERA_QUIENES_SECTION_ID,
  esferaQuienesPointSelectedId,
  esferaQuienesTabSelectedId,
} from "@/lib/cms/esfera-page-edit";
import { useEsferaPageDisplay } from "@/lib/cms/esfera-display";
import { resolveCmsMediaUrl } from "@/lib/cms/api-client";
import type { EsferaQuienesTabId } from "@/lib/esfera-content";
import { accentEyebrowClass } from "@/lib/brand-accents";

const ESFERA_ACCENT = "#1f9078";

export function EsferaQuienesSomosSection() {
  const edit = useEsferaCmsEdit();
  const page = useEsferaPageDisplay();
  const tabs = page.quienesTabs ?? [];
  const [tab, setTab] = useState<EsferaQuienesTabId>("quienes");
  const panel = tabs.find((t) => t.id === tab) ?? tabs[0];
  const imageSrc = panel ? resolveCmsMediaUrl(panel.imageSrc) ?? panel.imageSrc : "";

  return (
    <section className="relative border-b border-na-heket/10 bg-gradient-to-br from-na-surface via-na-surface to-na-amon/[0.06] py-14 sm:py-16">
      {edit?.ready ? (
        <div className="absolute right-4 top-4 z-10 sm:right-6">
          <CmsSectionEditBar
            label="Editar sección"
            onClick={() => edit.setSelectedId(ESFERA_QUIENES_SECTION_ID)}
          />
        </div>
      ) : null}

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className={accentEyebrowClass(0)}>{page.quienesEyebrow}</p>
        <h2 className="mt-2 text-balance text-3xl font-black text-na-heketDark sm:text-4xl">
          {page.quienesTitle}
        </h2>

        <div className="mt-10 overflow-hidden rounded-[1.75rem] border border-na-heket/12 bg-white shadow-na-card">
          <div
            role="tablist"
            aria-label="Quiénes somos y qué hacemos"
            className="flex flex-wrap gap-2 border-b border-na-heket/10 bg-gradient-to-br from-na-heket/[0.06] via-white to-na-amon/[0.04] p-4 sm:gap-3 sm:p-6"
          >
            {tabs.map(({ id, label }) => {
              const isActive = tab === id;
              return (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`esfera-quienes-panel-${id}`}
                  id={`esfera-quienes-tab-${id}`}
                  onClick={() => setTab(id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition sm:px-5 sm:py-2.5 ${
                    isActive
                      ? "text-white shadow-md"
                      : "bg-white/80 text-na-muted ring-1 ring-na-heket/15 hover:bg-white hover:text-na-ink"
                  }`}
                  style={
                    isActive
                      ? {
                          backgroundColor: ESFERA_ACCENT,
                          boxShadow: `0 4px 14px ${ESFERA_ACCENT}40`,
                        }
                      : undefined
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>

          {panel ? (
            <div
              role="tabpanel"
              id={`esfera-quienes-panel-${tab}`}
              aria-labelledby={`esfera-quienes-tab-${tab}`}
              className="relative p-6 sm:p-8"
            >
              {edit?.ready ? (
                <CmsEditPencil
                  label={`Editar ${panel.label}`}
                  onClick={() =>
                    edit.setSelectedId(esferaQuienesTabSelectedId(panel.id))
                  }
                />
              ) : null}

              <div className="grid items-start gap-8 lg:grid-cols-[1fr_min(38%,18rem)] lg:gap-10">
                <div>
                  <p className="text-base leading-relaxed text-na-ink sm:text-lg">
                    {panel.lede}
                  </p>

                  <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
                    {panel.points.map((point) => (
                      <li
                        key={point.id}
                        className="relative rounded-2xl border border-na-heket/10 bg-gradient-to-br from-na-heket/[0.04] to-white p-5 shadow-na-soft"
                      >
                        {edit?.ready ? (
                          <CmsEditPencil
                            label={`Editar ${point.title}`}
                            onClick={() =>
                              edit.setSelectedId(
                                esferaQuienesPointSelectedId(panel.id, point.id),
                              )
                            }
                          />
                        ) : null}
                        <p
                          className="text-xs font-bold uppercase tracking-[0.24em]"
                          style={{ color: ESFERA_ACCENT }}
                        >
                          {point.title}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-na-muted">
                          {point.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-na-card ring-1 ring-na-heket/10 lg:sticky lg:top-24">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={panel.imageAlt}
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 18rem"
                      className="object-cover"
                    />
                  ) : edit?.ready ? (
                    <div className="flex h-full items-center justify-center bg-amber-50 text-xs font-semibold text-amber-800">
                      Sin imagen — clic en lápiz
                    </div>
                  ) : null}
                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-na-heketDark/25 via-transparent to-transparent"
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
