"use client";

import { UpcomingActivitiesCarousel } from "@/components/home/UpcomingActivitiesCarousel";
import { useHomeCmsEdit } from "@/components/cms/HomeCmsEditContext";
import { cmsEntryToAgenda } from "@/lib/cms/agenda-edit";
import {
  getHomeAgendaItemsForCategories,
  HOME_CULTURA_CURSOS_AGENDA_CATEGORIES,
  type AgendaEntry,
} from "@/lib/agenda";
import type { CmsAgendaEntry } from "@/lib/cms/types";
import { useCmsHomeCulturaCursosAgenda } from "@/lib/cms/hooks";
import { getHomeCulturaCursosAgenda } from "@/lib/agenda-registry";
import { isCmsEnabled } from "@/lib/cms/provider";

function carouselItemsForEdit(
  entries: CmsAgendaEntry[],
  categories: readonly AgendaEntry["category"][],
): AgendaEntry[] {
  const mapped = entries.map(cmsEntryToAgenda);
  return getHomeAgendaItemsForCategories(mapped, categories);
}

/** Carrusel inferior — cultura, cursos y viajes (tras contenido digital). */
export function UpcomingCulturaCursosHome() {
  const edit = useHomeCmsEdit();
  const cmsItems = useCmsHomeCulturaCursosAgenda();
  const fallbackItems = getHomeCulturaCursosAgenda();

  const items =
    edit?.ready
      ? carouselItemsForEdit(edit.carousel, HOME_CULTURA_CURSOS_AGENDA_CATEGORIES)
      : isCmsEnabled()
        ? cmsItems
        : fallbackItems;

  if (items.length === 0 && !edit?.ready) return null;

  return (
    <UpcomingActivitiesCarousel
      items={items}
      variant="cultura"
      editMode={
        edit?.ready
          ? {
              onEditItem: (id) => edit.setSelected("carousel", id),
              onAddItem: () => edit.addCarousel(),
            }
          : undefined
      }
    />
  );
}
