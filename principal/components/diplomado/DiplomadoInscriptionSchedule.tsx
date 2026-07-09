"use client";

import {
  Calendar,
  Clock,
  Hourglass,
  Pencil,
  UserRound,
} from "lucide-react";
import { useDiplomadoInfoDisplay } from "@/lib/cms/diplomado-display";
import { useFilosofiaCmsEdit } from "@/components/filosofia/cms/FilosofiaCmsEditContext";

const SCHEDULE_ICONS = {
  Inicio: Calendar,
  Horario: Clock,
  Modalidad: UserRound,
  Duración: Hourglass,
} as const;

export function DiplomadoInscriptionSchedule() {
  const edit = useFilosofiaCmsEdit();
  const { schedule } = useDiplomadoInfoDisplay();

  return (
    <div className="relative">
      {edit?.ready ? (
        <button
          type="button"
          onClick={() => edit.setActiveSection("badge")}
          className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-amber-400 bg-amber-50 px-3 py-1.5 text-[11px] font-bold uppercase text-amber-950"
        >
          <Pencil className="h-3.5 w-3.5" />
          Editar fechas de inscripción
        </button>
      ) : null}
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {schedule.map(({ label, value }) => {
          const Icon =
            SCHEDULE_ICONS[label as keyof typeof SCHEDULE_ICONS] ?? Calendar;
          return (
            <li key={label} className="diplomado-info-card rounded-xl px-3 py-4">
              <Icon className="h-5 w-5 text-[var(--dip-teal)]" strokeWidth={1.8} />
              <p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-[var(--dip-teal)]">
                {label}
              </p>
              <p className="mt-1 text-sm font-bold text-[var(--dip-ink)]">
                {value}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
