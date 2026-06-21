/** Salones disponibles para alquiler — talleres, cursos y eventos. */

import acropolisPublished from "../../principal/data/acropolis/published.json";

export type LayoutKind = "butacas" | "mesas" | "herradura";

export type SalonCapacities = {
  butacas: number;
  mesas: number;
  herradura: number;
};

export type Salon = {
  id: string;
  name: string;
  sede: "Naco" | "Los Prados";
  city: "Santo Domingo";
  summary: string;
  /** Disposición que muestra la foto de referencia. */
  featuredLayout: LayoutKind;
  capacities: SalonCapacities;
  image: { src: string; alt: string };
};

export const LAYOUT_LABELS: Record<LayoutKind, string> = {
  butacas: "Butacas en filas",
  mesas: "Mesas tipo escuela",
  herradura: "Disposición herradura",
};

/** Fallback alineado con `principal/data/acropolis/published.json` (misma fuente que Acrópolis). */
function salonesFromAcropolisPublished(): Salon[] {
  const items = acropolisPublished.sections?.salones ?? [];
  return items.map((s) => ({
    id: s.id,
    name: s.name,
    sede: s.sede as Salon["sede"],
    city: "Santo Domingo",
    summary: s.summary,
    featuredLayout: s.featuredLayout as LayoutKind,
    capacities: { ...s.capacities },
    image: { src: s.image.src, alt: s.image.alt },
  }));
}

export const SALONES: Salon[] = salonesFromAcropolisPublished();

export const SALONES_BY_SEDE = [
  {
    sede: "Naco" as const,
    salones: SALONES.filter((s) => s.sede === "Naco"),
  },
  {
    sede: "Los Prados" as const,
    salones: SALONES.filter((s) => s.sede === "Los Prados"),
  },
];
