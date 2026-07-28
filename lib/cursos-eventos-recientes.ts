import { mergeEventos } from "@/lib/cms/merge-content";
import type { CmsDocument } from "@/lib/cms/types";
import type { CmsVoluntariadoReciente } from "@/lib/cms/types";
import { EVENTOS, type EventoItem } from "@/lib/eventos";

const RECIENTES_CATEGORIES = new Set(["Cursos", "Talleres"]);

/** Crónicas culturales que corresponden a talleres del catálogo de cursos. */
const RECIENTES_CULTURA_SLUGS = new Set([
  "el-arte-de-respirar",
  "valor-de-las-abejas",
]);

const MAX_RECIENTES = 3;

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

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isPastEvent(evento: EventoItem, reference = new Date()) {
  const key = eventSortKey(evento);
  if (!key) return false;
  const [y, m, d] = key.split("-").map(Number);
  const eventDate = new Date(y, m - 1, d);
  return eventDate < startOfDay(reference);
}

function matchesCursosRecientes(evento: EventoItem) {
  if (RECIENTES_CATEGORIES.has(evento.category)) return true;
  if (evento.category === "Cultura" && RECIENTES_CULTURA_SLUGS.has(evento.slug)) {
    return true;
  }
  return false;
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

/** Últimas crónicas de cursos y talleres (desde /eventos). */
export function getCursosRecientesFromEventos(
  cms: CmsDocument | null | undefined,
  reference = new Date(),
  limit = MAX_RECIENTES,
): CmsVoluntariadoReciente[] {
  const merged = mergeEventos(EVENTOS, cms ?? null);
  return merged
    .filter(matchesCursosRecientes)
    .filter((e) => isPastEvent(e, reference))
    .sort((a, b) => eventSortKey(b).localeCompare(eventSortKey(a)))
    .slice(0, limit)
    .map(eventoToReciente);
}
