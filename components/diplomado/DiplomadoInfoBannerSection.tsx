"use client";

import { Pencil } from "lucide-react";
import { useDiplomadoInfoDisplay } from "@/lib/cms/diplomado-display";
import { useFilosofiaCmsEdit } from "@/components/filosofia/cms/FilosofiaCmsEditContext";

export function DiplomadoInfoBannerSection() {
  const edit = useFilosofiaCmsEdit();
  const { banner } = useDiplomadoInfoDisplay();

  return (
    <section className="diplomado-info-banner relative -mx-0 bg-white px-3 py-4 lg:px-8 lg:py-5">
      {edit?.ready ? (
        <button
          type="button"
          onClick={() => edit.setActiveSection("badge")}
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-3 py-1.5 text-[11px] font-bold uppercase text-white shadow"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar fechas
        </button>
      ) : null}
      <ul className="mx-auto flex max-w-[400px] items-stretch justify-between gap-0 lg:max-w-3xl">
        {banner.map((item, i) => (
          <li key={item.label} className="flex flex-1 items-stretch">
            {i > 0 ? (
              <span className="diplomado-stat-divider mx-1" aria-hidden />
            ) : null}
            <div className="flex flex-1 flex-col items-center justify-center px-0.5 text-center">
              <p className="text-[18px] font-bold leading-tight text-[var(--dip-teal)]">
                {item.value}
              </p>
              <p className="mt-0.5 text-[10px] text-[#3c3f42] sm:text-xs">
                {item.label}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
