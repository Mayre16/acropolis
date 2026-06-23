import type { AgendaEntry } from "@/lib/agenda";
import {
  getActiveAgendaItems,
  getHomeAgendaItems,
  getHomeAgendaItemsForCategories,
  getUpcomingAgendaItems,
  HOME_AGENDA_CATEGORIES,
  sortAgendaEntries,
} from "@/lib/agenda";
import { CULTURA_PROXIMAS_ACTIVIDADES } from "@/lib/cultura-agenda";
import { CURSOS_PROXIMAS_CONVOCATORIAS } from "@/lib/cursos-agenda";
import { CONFERENCIAS_PROXIMAS } from "@/lib/conferencias-agenda";
import { VOLUNTARIADO_PROXIMAS_ACTIVIDADES } from "@/lib/voluntariado-agenda";
import { VIAJES_PROXIMAS_SALIDAS } from "@/lib/viajes-agenda";
import { DIPLOMADO_PROXIMAS_SESIONES } from "@/lib/diplomado-sessions";
import { ESFERA_PROXIMOS_ENTRENAMIENTOS } from "@/lib/esfera-agenda";
import { esferaTrainingsToAgendaEntries } from "@/lib/esfera-agenda-entries";
import type { CmsEsferaTrainingItem } from "@/lib/cms/types";

/** Todas las actividades fechadas del sitio (fuente única para home y filtros). */
export const ALL_AGENDA_ENTRIES: AgendaEntry[] = [
  ...DIPLOMADO_PROXIMAS_SESIONES,
  ...CURSOS_PROXIMAS_CONVOCATORIAS,
  ...CONFERENCIAS_PROXIMAS,
  ...CULTURA_PROXIMAS_ACTIVIDADES,
  ...VIAJES_PROXIMAS_SALIDAS,
  ...VOLUNTARIADO_PROXIMAS_ACTIVIDADES,
];

export function getAllUpcomingAgenda(reference = new Date()) {
  return getUpcomingAgendaItems(ALL_AGENDA_ENTRIES, reference);
}

export function getAllActiveAgenda(reference = new Date()) {
  return getActiveAgendaItems(ALL_AGENDA_ENTRIES, reference);
}

/** Carrusel de agenda del home: todo lo próximo + Esfera (CMS). */
export function buildHomeAgenda(
  entries: AgendaEntry[],
  esferaTrainings: CmsEsferaTrainingItem[] = ESFERA_PROXIMOS_ENTRENAMIENTOS,
  reference = new Date(),
) {
  const fromEntries = getHomeAgendaItemsForCategories(
    entries,
    HOME_AGENDA_CATEGORIES,
    reference,
  );
  const esfera = getHomeAgendaItemsForCategories(
    esferaTrainingsToAgendaEntries(esferaTrainings),
    ["esfera"],
    reference,
  );

  const seen = new Set<string>();
  return sortAgendaEntries(
    [...fromEntries, ...esfera].filter((entry) => {
      if (seen.has(entry.id)) return false;
      seen.add(entry.id);
      return true;
    }),
  );
}

export function getHomeUpcomingAgenda(
  reference = new Date(),
  esferaTrainings: CmsEsferaTrainingItem[] = ESFERA_PROXIMOS_ENTRENAMIENTOS,
) {
  return buildHomeAgenda(ALL_AGENDA_ENTRIES, esferaTrainings, reference);
}

/** @deprecated Usar buildHomeAgenda */
export function buildHomePrimaryAgenda(
  entries: AgendaEntry[],
  esferaTrainings: CmsEsferaTrainingItem[],
  reference = new Date(),
) {
  return buildHomeAgenda(entries, esferaTrainings, reference);
}

/** @deprecated Usar getHomeUpcomingAgenda */
export function getHomePrimaryAgenda(
  reference = new Date(),
  esferaTrainings: CmsEsferaTrainingItem[] = ESFERA_PROXIMOS_ENTRENAMIENTOS,
) {
  return getHomeUpcomingAgenda(reference, esferaTrainings);
}

export function getHomeAgenda(reference = new Date()) {
  return getHomeAgendaItems(ALL_AGENDA_ENTRIES, reference);
}

/** @deprecated Usar getHomeUpcomingAgenda */
export function getHomeCulturaCursosAgenda(reference = new Date()) {
  return getHomeAgendaItemsForCategories(
    ALL_AGENDA_ENTRIES,
    ["cultura", "curso", "taller"],
    reference,
  );
}

export function getUpcomingByCategory(
  category: AgendaEntry["category"],
  reference = new Date(),
) {
  return getActiveAgendaItems(
    ALL_AGENDA_ENTRIES.filter((e) => e.category === category),
    reference,
  );
}
