"use client";

import {
  getActiveAgendaItems,
  getUpcomingAgendaItems,
  type AgendaEntry,
} from "@/lib/agenda";
import { ARTICULOS } from "@/lib/articulos";
import { EVENTOS } from "@/lib/eventos";
import { MEDIOS } from "@/lib/medios";
import { VIAJES_DESTINOS, type ViajeCategoriaSlug } from "@/lib/viajes";
import { VENUE_LOCATIONS } from "@/lib/locations";
import { INFO_EMAIL } from "@/lib/site-config";
import { resolveAgendaFromCms } from "@/lib/cms/merge";
import { getEsferaTrainings } from "@/lib/cms/esfera-page-edit";
import {
  getCmsGalleryArticulo,
  getCmsGalleryEvento,
  mergeArticulos,
  mergeEventos,
  mergeMedios,
  mergeVenues,
  mergeViajes,
} from "@/lib/cms/merge-content";
import { useCmsDocument, isCmsEnabled } from "@/lib/cms/provider";
import {
  formatCentrosSummary,
  formatSedesSummary,
} from "@/lib/cms/venues-edit";
import {
  DIPLOMADO_INFO_BANNER,
  DIPLOMADO_INSCRIPTION,
} from "@/lib/diplomado-content";
import { CULTURA_PROXIMAS_ACTIVIDADES } from "@/lib/cultura-agenda";
import { filterCursosAgendaEntries } from "@/lib/cursos-agenda";
import { VOLUNTARIADO_PROXIMAS_ACTIVIDADES } from "@/lib/voluntariado-agenda";
import { ACTIVITY_PHOTOS, HOME_ACTIVITY_PHOTOS_LIMIT } from "@/lib/home-content";
import {
  cmsEntryToAgenda,
  getCulturaEntries,
  getVoluntariadoEntries,
} from "@/lib/cms/agenda-edit";
import { ALL_AGENDA_ENTRIES, buildHomeAgenda } from "@/lib/agenda-registry";
import { DIPLOMADO_PROXIMAS_SESIONES } from "@/lib/diplomado-sessions";

export function useCmsAllAgenda(fallback = ALL_AGENDA_ENTRIES): AgendaEntry[] {
  const cms = useCmsDocument();
  return resolveAgendaFromCms(cms, fallback);
}

export function useCmsHomeAgenda(reference = new Date()) {
  const cms = useCmsDocument();
  const entries = useCmsAllAgenda();
  const esferaTrainings = getEsferaTrainings(cms ?? null);
  return buildHomeAgenda(entries, esferaTrainings, reference);
}

/** @deprecated Usar useCmsHomeAgenda */
export function useCmsHomePrimaryAgenda(reference = new Date()) {
  return useCmsHomeAgenda(reference);
}

/** @deprecated Usar useCmsHomeAgenda */
export function useCmsHomeCulturaCursosAgenda(reference = new Date()) {
  return useCmsHomeAgenda(reference);
}

export function useCmsDiplomadoSessions(reference = new Date()) {
  const cms = useCmsDocument();
  const base = resolveAgendaFromCms(cms, DIPLOMADO_PROXIMAS_SESIONES);
  return getActiveAgendaItems(
    base.filter((e) => e.category === "diplomado"),
    reference,
  );
}

/** Sesiones del Diplomado y actividades de filosofía en /filosofia. */
export function useCmsFilosofiaPageAgenda(reference = new Date()) {
  const cms = useCmsDocument();
  const base = resolveAgendaFromCms(cms, ALL_AGENDA_ENTRIES);
  return getActiveAgendaItems(
    base.filter(
      (e) => e.category === "diplomado" || e.category === "filosofia",
    ),
    reference,
  );
}

export function useCmsDiplomadoBadge(fallback: { weekday: string; date: string }) {
  const cms = useCmsDocument();
  const h = cms?.sections.diplomadoHero;
  if (!isCmsEnabled() || (!h?.badgeWeekday && !h?.badgeDate)) return fallback;
  return {
    weekday: h.badgeWeekday ?? fallback.weekday,
    date: h.badgeDate ?? fallback.date,
  };
}

export function useCmsDiplomadoInfo() {
  const cms = useCmsDocument();
  const h = cms?.sections.diplomadoHero;
  const bannerFallback = DIPLOMADO_INFO_BANNER;

  if (!isCmsEnabled() || !h) {
    return {
      banner: [...bannerFallback],
      schedule: [],
    };
  }

  return {
    banner: [
      {
        value: h.badgeDate ?? bannerFallback[0].value,
        label: bannerFallback[0].label,
      },
      {
        value: h.bannerDuration ?? bannerFallback[1].value,
        label: bannerFallback[1].label,
      },
      {
        value: h.activeModality ?? bannerFallback[2].value,
        label: bannerFallback[2].label,
      },
    ],
    schedule: [],
  };
}

export function useCmsCulturaAgenda(reference = new Date()) {
  const cms = useCmsDocument();
  if (!isCmsEnabled() || !cms) {
    return getUpcomingAgendaItems(CULTURA_PROXIMAS_ACTIVIDADES, reference);
  }
  const entries = getCulturaEntries(cms, CULTURA_PROXIMAS_ACTIVIDADES);
  return getUpcomingAgendaItems(entries.map(cmsEntryToAgenda), reference);
}

export function useCmsCulturaSectionText() {
  const cms = useCmsDocument();
  const cp = cms?.sections.culturaPage;
  return {
    title: cp?.proximasTitle ?? "Próximas actividades",
    intro:
      cp?.proximasIntro ??
      "Clases, ensayos y encuentros culturales en nuestras sedes de Santo Domingo y en el Punto Cultural Roberto Pastoriza. Haz clic para ver más.",
  };
}

export function useCmsVoluntariadoAgenda(reference = new Date()) {
  const cms = useCmsDocument();
  if (!isCmsEnabled() || !cms) {
    return getUpcomingAgendaItems(VOLUNTARIADO_PROXIMAS_ACTIVIDADES, reference);
  }
  const entries = getVoluntariadoEntries(cms, VOLUNTARIADO_PROXIMAS_ACTIVIDADES);
  return getUpcomingAgendaItems(entries.map(cmsEntryToAgenda), reference);
}

export function useCmsVoluntariadoSectionText() {
  const cms = useCmsDocument();
  const vp = cms?.sections.voluntariadoPage;
  return {
    title: vp?.proximasTitle ?? "Próximas actividades",
    intro:
      vp?.proximasIntro ??
      "Jornadas de voluntariado y formación Esfera en nuestras sedes. Haz clic para ver más.",
  };
}

/** Convocatorias de cursos, talleres y conferencias — misma fuente que /agenda. */
export function useCmsCursosAgenda(reference = new Date()) {
  const cms = useCmsDocument();
  const base = resolveAgendaFromCms(cms, ALL_AGENDA_ENTRIES);
  return getActiveAgendaItems(filterCursosAgendaEntries(base), reference);
}

export function useCmsCursosSectionText() {
  const cms = useCmsDocument();
  const cp = cms?.sections.cursosPage;
  return {
    title: cp?.proximasTitle ?? "Próximas convocatorias",
    intro:
      cp?.proximasIntro ??
      "Cursos, talleres y conferencias con fecha próxima — la misma agenda que en /agenda. Haz clic para inscribirte o pedir más información.",
  };
}

export function useCmsEsferaTrainings() {
  const cms = useCmsDocument();
  if (!isCmsEnabled() || !cms) {
    return getEsferaTrainings(null);
  }
  return getEsferaTrainings(cms);
}

export function useCmsEsferaSectionText() {
  const cms = useCmsDocument();
  const ep = cms?.sections.esferaPage;
  return {
    eyebrow: ep?.agendaEyebrow ?? "Agenda",
    title: ep?.agendaTitle ?? "Actividades y próximos entrenamientos",
    intro:
      ep?.agendaIntro ??
      "Líneas habituales de capacitación y práctica; fechas y sedes se confirman con el equipo en República Dominicana.",
  };
}

export function useCmsActivityPhotos() {
  const cms = useCmsDocument();
  const photos = cms?.sections.activityPhotos;
  if (!isCmsEnabled() || !photos?.length) return ACTIVITY_PHOTOS;
  return photos.slice(0, HOME_ACTIVITY_PHOTOS_LIMIT);
}

export function useMergedArticulos() {
  const cms = useCmsDocument();
  return mergeArticulos(ARTICULOS, cms);
}

export function useMergedEventos() {
  const cms = useCmsDocument();
  return mergeEventos(EVENTOS, cms);
}

export function useMergedMedios() {
  const cms = useCmsDocument();
  return mergeMedios(MEDIOS, cms);
}

export function useMergedViajes(categoria?: ViajeCategoriaSlug) {
  const cms = useCmsDocument();
  const all = mergeViajes(VIAJES_DESTINOS, cms);
  return categoria ? all.filter((v) => v.categoria === categoria) : all;
}

export function useMergedVenues() {
  const cms = useCmsDocument();
  return mergeVenues(VENUE_LOCATIONS, cms);
}

export function useVenuesSummary() {
  const venues = useMergedVenues();
  return {
    sedes: formatSedesSummary(venues),
    centros: formatCentrosSummary(venues),
    venues,
  };
}

export function usePrimarySedeContact() {
  const venues = useMergedVenues();
  const naco =
    venues.find((v) => v.id === "sede-naco") ??
    venues.find((v) => v.kind === "sede");
  if (!naco) {
    return {
      direccion: "Cub Scout No. 6, Naco",
      ciudad: "Santo Domingo, República Dominicana",
      email: INFO_EMAIL,
    };
  }
  return {
    direccion: `${naco.address}, ${naco.zone}`,
    ciudad: `${naco.city}, República Dominicana`,
    email: naco.email ?? INFO_EMAIL,
  };
}

export function useArticuloGallery(slug: string) {
  const cms = useCmsDocument();
  if (!isCmsEnabled()) return [];
  return getCmsGalleryArticulo(cms, slug);
}

export function useEventoGallery(slug: string) {
  const cms = useCmsDocument();
  if (!isCmsEnabled()) return [];
  return getCmsGalleryEvento(cms, slug);
}
