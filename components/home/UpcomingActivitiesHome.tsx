"use client";

import { useEffect, useState } from "react";
import { UpcomingActivitiesCarousel } from "@/components/home/UpcomingActivitiesCarousel";
import { useHomeCmsEdit } from "@/components/cms/HomeCmsEditHooks";
import { cmsEntryToAgenda } from "@/lib/cms/agenda-edit";
import type { AgendaEntry } from "@/lib/agenda";
import type { CmsAgendaEntry } from "@/lib/cms/types";
import { useCmsEsferaTrainings, useCmsHomeAgenda } from "@/lib/cms/hooks";
import { buildHomeAgenda, getHomeUpcomingAgenda } from "@/lib/agenda-registry";
import { isCmsEnabled } from "@/lib/cms/provider";

function agendaFromCarouselEdit(
  entries: CmsAgendaEntry[],
  esferaTrainings: ReturnType<typeof useCmsEsferaTrainings>,
): AgendaEntry[] {
  return buildHomeAgenda(entries.map(cmsEntryToAgenda), esferaTrainings);
}

/** Carrusel de agenda — todo lo próximo con fecha confirmada. */
export function UpcomingActivitiesHome() {
  const edit = useHomeCmsEdit();
  const cmsItems = useCmsHomeAgenda();
  const esferaTrainings = useCmsEsferaTrainings();
  // SSR y primer paint usan el fallback estático; el CMS se aplica tras montar
  // para evitar hydration mismatch (orden/fechas distintas servidor vs cliente).
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const fallbackItems = getHomeUpcomingAgenda(undefined, esferaTrainings);

  const items =
    edit?.ready
      ? agendaFromCarouselEdit(edit.carousel, esferaTrainings)
      : mounted && isCmsEnabled()
        ? cmsItems
        : fallbackItems;

  if (items.length === 0 && !edit?.ready) return null;

  return (
    <UpcomingActivitiesCarousel
      items={items}
      variant="primary"
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
