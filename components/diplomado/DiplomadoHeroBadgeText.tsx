"use client";

import { Pencil } from "lucide-react";
import { useDiplomadoBadgeDisplay } from "@/lib/cms/diplomado-display";
import { useFilosofiaCmsEdit } from "@/components/filosofia/cms/FilosofiaCmsEditContext";

export function DiplomadoHeroBadgeText({
  weekdayClass,
  dateClass,
}: {
  weekdayClass: string;
  dateClass: string;
}) {
  const edit = useFilosofiaCmsEdit();
  const show = useDiplomadoBadgeDisplay();

  return (
    <>
      {edit?.ready ? (
        <button
          type="button"
          onClick={() => edit.setActiveSection("badge")}
          className="absolute -right-2 -top-8 z-20 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2 py-1 text-[10px] font-bold uppercase text-white shadow"
        >
          <Pencil className="h-3 w-3" />
        </button>
      ) : null}
      <p className={weekdayClass}>{show.weekday}</p>
      <p className={dateClass}>{show.date}</p>
    </>
  );
}
