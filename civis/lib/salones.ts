/** Salones disponibles para alquiler — talleres, cursos y eventos. */

import acropolisPublished from "../../principal/data/acropolis/published.json";

export type LayoutKind = "butacas" | "mesas" | "herradura";

export type SalonCapacities = {
  butacas: number;
  mesas: number;
  herradura: number;
};

export const SALON_SEDES = ["Naco", "Los Prados", "Santiago"] as const;
export type SalonSede = (typeof SALON_SEDES)[number];
export type SalonCity = "Santo Domingo" | "Santiago";

export type Salon = {
  id: string;
  name: string;
  sede: SalonSede;
  city: SalonCity;
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

function salonCityFromPublished(city?: string): SalonCity {
  return city === "Santiago" ? "Santiago" : "Santo Domingo";
}

/** Fallback alineado con `principal/data/acropolis/published.json` (misma fuente que Acrópolis). */
function salonesFromAcropolisPublished(): Salon[] {
  const items = acropolisPublished.sections?.salones ?? [];
  return items.map((s) => ({
    id: s.id,
    name: s.name,
    sede: s.sede as SalonSede,
    city: salonCityFromPublished(s.city),
    summary: s.summary,
    featuredLayout: s.featuredLayout as LayoutKind,
    capacities: { ...s.capacities },
    image: { src: s.image.src, alt: s.image.alt },
  }));
}

export const SALONES: Salon[] = salonesFromAcropolisPublished();

export const SALONES_BY_SEDE = SALON_SEDES.map((sede) => ({
  sede,
  salones: SALONES.filter((s) => s.sede === sede),
})).filter((group) => group.salones.length > 0);
