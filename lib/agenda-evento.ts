import {
  eventoCategoryLabel,
  publishCategoryDef,
} from "@/lib/agenda-publish-categories";
import type { AgendaCategory } from "@/lib/agenda";
import {
  isAgendaActive,
} from "@/lib/agenda";
import { uniqueSlug } from "@/lib/cms/content-edit";
import type { CmsAgendaEntry, CmsDocument, CmsEvento } from "@/lib/cms/types";

export { isAgendaClosed } from "@/lib/agenda";

/** Etiqueta de crónica en /eventos según categoría de agenda. */
export function eventoCategoryLabelFromAgenda(
  category: AgendaCategory,
): string {
  return eventoCategoryLabel(category);
}

/** Los grupos del Diplomado no se convierten en crónica de /eventos. */
export function canPromoteAgendaToEvento(category: AgendaCategory): boolean {
  return category !== "diplomado";
}

export function isEventoPublished(evento: Pick<CmsEvento, "published">): boolean {
  return evento.published !== false;
}

function formatIsoDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const [, y, m, d] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  return date.toLocaleDateString("es-DO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Borrador de crónica a partir de una actividad de agenda ya cerrada. */
export function draftEventoFromAgendaEntry(
  entry: CmsAgendaEntry,
  existingSlugs: string[],
): CmsEvento {
  const slug = uniqueSlug(entry.title, existingSlugs);
  const excerpt =
    entry.description?.trim() ||
    `Crónica de «${entry.title}»${entry.sede ? ` — ${entry.sede}` : ""}.`;

  return {
    slug,
    title: entry.title,
    date: entry.date || formatIsoDate(entry.startsAt),
    category: eventoCategoryLabelFromAgenda(entry.category),
    excerpt,
    image: {
      src: entry.image ?? "",
      alt: entry.imageAlt ?? entry.title,
    },
    gallery: [],
    body: [
      entry.description?.trim() ||
        "Completa aquí la crónica del evento: qué se vivió, quién participó y qué aprendimos.",
    ],
    published: false,
    sourceAgendaId: entry.id,
    seoTags: entry.seoTags,
  };
}

/** ¿La actividad ya salió de la ventana visible en agenda? */
export function isAgendaEntryClosed(
  entry: Pick<CmsAgendaEntry, "startsAt" | "category">,
  reference = new Date(),
): boolean {
  return !isAgendaActive(entry, reference);
}

/** Añade borrador de crónica y enlaza la actividad de agenda. */
export function mergeEventoDraftFromAgenda(
  doc: CmsDocument,
  entry: CmsAgendaEntry,
): { doc: CmsDocument; evento: CmsEvento } {
  if (!canPromoteAgendaToEvento(entry.category)) {
    throw new Error("Las sesiones del Diplomado no se publican como evento.");
  }
  if (entry.eventoSlug) {
    const existing = (doc.sections.eventos ?? []).find(
      (e) => e.slug === entry.eventoSlug,
    );
    if (existing) {
      return { doc, evento: existing };
    }
  }

  const existingSlugs = [
    ...(doc.sections.eventos ?? []).map((e) => e.slug),
    ...(doc.sections.eventosHidden ?? []),
  ];
  const evento = draftEventoFromAgendaEntry(entry, existingSlugs);
  const agenda = (doc.sections.agenda ?? []).map((e) =>
    e.id === entry.id ? { ...e, eventoSlug: evento.slug } : e,
  );
  const hasAgendaEntry = agenda.some((e) => e.id === entry.id);

  return {
    doc: {
      ...doc,
      sections: {
        ...doc.sections,
        eventos: [...(doc.sections.eventos ?? []), evento],
        agenda: hasAgendaEntry
          ? agenda
          : [...agenda, { ...entry, eventoSlug: evento.slug }],
      },
    },
    evento,
  };
}

/** Ruta de la página donde rota la actividad según su categoría. */
export const AGENDA_PAGE_BY_CATEGORY: Record<AgendaCategory, string> = {
  diplomado: "/filosofia",
  filosofia: "/filosofia",
  curso: "/cursos",
  taller: "/cursos",
  conferencia: "/cursos",
  cultura: "/cultura",
  voluntariado: "/voluntariado",
  "voluntariado-comunidad": "/voluntariado",
  "voluntariado-ninos": "/voluntariado",
  "voluntariado-ambiente": "/voluntariado",
  esfera: "/esfera",
};

export function publishPagesForCategory(category: AgendaCategory) {
  return publishCategoryDef(category).pages;
}

export function isAgendaEntryPromotable(
  entry: CmsAgendaEntry,
  reference = new Date(),
): boolean {
  return (
    canPromoteAgendaToEvento(entry.category) &&
    !isAgendaActive(entry, reference) &&
    !entry.eventoSlug
  );
}

export function promoteAgendaEntryLocally(
  entry: CmsAgendaEntry,
  existingEventoSlugs: string[],
): { updatedEntry: CmsAgendaEntry; draft: CmsEvento } {
  const draft = draftEventoFromAgendaEntry(entry, existingEventoSlugs);
  return {
    updatedEntry: { ...entry, eventoSlug: draft.slug },
    draft,
  };
}
