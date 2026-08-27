import { mergeEventos } from "@/lib/cms/merge-content";
import type { CmsDocument } from "@/lib/cms/types";
import type { CmsVoluntariadoReciente } from "@/lib/cms/types";
import { EVENTOS, eventoSortKey, type EventoItem } from "@/lib/eventos";
import {
  agendaFilterCategory,
  normalizeCmsEventoCategory,
} from "@/lib/agenda-publish-categories";

const MAX_RECIENTES = 4;

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
    .sort((a, b) => eventoSortKey(b).localeCompare(eventoSortKey(a)))
    .slice(0, limit)
    .map(eventoToReciente);
}
