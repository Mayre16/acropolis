import { mergeEventos } from "@/lib/cms/merge-content";
import type { CmsDocument } from "@/lib/cms/types";
import type { CmsVoluntariadoReciente } from "@/lib/cms/types";
import { EVENTOS, type EventoItem } from "@/lib/eventos";
import {
  agendaFilterCategory,
  normalizeCmsEventoCategory,
} from "@/lib/agenda-publish-categories";

const MAX_RECIENTES = 4;

const SPANISH_MONTHS: Record<string, string> = {
  enero: "01",
  febrero: "02",
  marzo: "03",
  abril: "04",
  mayo: "05",
  junio: "06",
  julio: "07",
  agosto: "08",
  septiembre: "09",
  octubre: "10",
  noviembre: "11",
  diciembre: "12",
};

function parseSpanishDateToIso(date: string): string {
  const m = date.match(/(\d{1,2})\s+de\s+(\p{L}+)\s+de\s+(\d{4})/iu);
  if (!m) return "";
  const month = SPANISH_MONTHS[m[2].toLowerCase()];
  if (!month) return "";
  return `${m[3]}-${month}-${m[1].padStart(2, "0")}`;
}

function eventSortKey(evento: EventoItem): string {
  return evento.sortAt ?? parseSpanishDateToIso(evento.date);
}

function eventoToReciente(evento: EventoItem): CmsVoluntariadoReciente {
  return {
    id: evento.slug,
    src: evento.image.src,
    alt: evento.image.alt,
    title: evento.title,
    date: evento.date,
    text: evento.excerpt,
    href: `/eventos/${evento.slug}`,
  };
}

function matchesVoluntariadoRecientes(evento: EventoItem): boolean {
  const id =
    evento.categoryId ?? normalizeCmsEventoCategory(evento.category);
  if (id === "esfera") return true;
  return agendaFilterCategory(id) === "voluntariado";
}

/** Últimas crónicas de voluntariado / Esfera / comunidad (desde /eventos). */
export function getVoluntariadoRecientesFromEventos(
  cms: CmsDocument | null | undefined,
  limit = MAX_RECIENTES,
): CmsVoluntariadoReciente[] {
  const merged = mergeEventos(EVENTOS, cms ?? null);
  return merged
    .filter(matchesVoluntariadoRecientes)
    .sort((a, b) => eventSortKey(b).localeCompare(eventSortKey(a)))
    .slice(0, limit)
    .map(eventoToReciente);
}
