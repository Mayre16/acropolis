"use client";

import { UpcomingActivitiesCarousel } from "@/components/home/UpcomingActivitiesCarousel";
import { useCmsEsferaTrainings, useCmsHomeAgenda } from "@/lib/cms/hooks";
import { getHomeUpcomingAgenda } from "@/lib/agenda-registry";
import { isCmsEnabled } from "@/lib/cms/provider";

/** Vista previa de la agenda en el hub de contenido — enlace a /agenda. */
export function ContenidoAgendaSection() {
  const cmsItems = useCmsHomeAgenda();
  const esferaTrainings = useCmsEsferaTrainings();
  const fallbackItems = getHomeUpcomingAgenda(undefined, esferaTrainings);

  const items = isCmsEnabled()
    ? cmsItems
    : fallbackItems;

  if (items.length === 0) return null;

  return (
    <UpcomingActivitiesCarousel items={items} variant="agenda" />
  );
}
