import type { AgendaEntry } from "@/lib/agenda";
import type { CmsEsferaTrainingItem } from "@/lib/cms/types";

/** Convierte un entrenamiento Esfera con fecha ISO a entrada de agenda del home. */
export function esferaTrainingToAgendaEntry(
  item: CmsEsferaTrainingItem,
): AgendaEntry | null {
  if (!item.startsAt) return null;

  return {
    id: item.id,
    category: "esfera",
    title: item.title,
    startsAt: item.startsAt,
    date: item.date,
    time: item.time ?? "",
    sede: item.sede ?? "",
    tag: "Punto Focal Esfera",
    description: item.blurb,
    image: item.imageSrc,
    imageAlt: item.imageAlt,
    inscribeMessage: `Hola, me interesa el taller ${item.title} — ${item.date}${item.sede ? `, ${item.sede}` : ""}. ¿Me pueden confirmar inscripción?`,
    detailHref: "/esfera",
    detailLabel: "Ver Punto Focal Esfera",
    showOnHome: true,
  };
}

export function esferaTrainingsToAgendaEntries(
  items: CmsEsferaTrainingItem[],
): AgendaEntry[] {
  return items
    .map(esferaTrainingToAgendaEntry)
    .filter((entry): entry is AgendaEntry => entry !== null);
}
