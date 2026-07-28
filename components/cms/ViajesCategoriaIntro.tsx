"use client";

import { Pencil } from "lucide-react";
import { useViajesCmsEdit } from "@/components/cms/ViajesCmsEditContext";
import { useViajeCategoriaDisplay } from "@/lib/cms/viajes-display";
import type { ViajeCategoriaSlug } from "@/lib/viajes";

type Props = {
  categoria: ViajeCategoriaSlug;
};

export function ViajesCategoriaIntro({ categoria }: Props) {
  const edit = useViajesCmsEdit();
  const display = useViajeCategoriaDisplay(categoria);

  return (
    <div className="relative">
      {edit?.ready ? (
        <button
          type="button"
          onClick={() => edit.setSelectedKey("__hero__")}
          className="absolute -top-1 right-0 z-10 inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase text-amber-950"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar intro
        </button>
      ) : null}
      <p className="max-w-2xl text-na-muted">{display.intro}</p>
    </div>
  );
}
