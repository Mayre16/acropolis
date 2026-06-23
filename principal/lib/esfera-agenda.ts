import type { CmsEsferaTrainingItem } from "@/lib/cms/types";
import { MANUAL_ESFERA_COVER, MANUAL_ESFERA_COVER_CARD } from "@/lib/esfera-content";

/** Próximos talleres Esfera — aparecen en /esfera y en la agenda del sitio. */
export const ESFERA_PROXIMOS_ENTRENAMIENTOS: CmsEsferaTrainingItem[] = [
  {
    id: "esfera-manual-ago",
    title: "Introducción al Manual Esfera",
    startsAt: "2026-08-09",
    date: "Sábado 9 de agosto",
    time: "9:00 a.m. – 1:00 p.m.",
    sede: "Sede Naco",
    blurb:
      "Taller de media jornada sobre estándares humanitarios y calidad en emergencias. Abierto a voluntarios e instituciones interesadas en la línea Esfera.",
    imageSrc: MANUAL_ESFERA_COVER_CARD.src,
    imageAlt: MANUAL_ESFERA_COVER_CARD.alt,
  },  {
    id: "esfera-simulacro-sep",
    title: "Simulacro de gestión de emergencias",
    startsAt: "2026-09-13",
    date: "Sábado 13 de septiembre",
    time: "8:00 a.m. – 12:00 m.",
    sede: "Sede Naco",
    blurb:
      "Ejercicio práctico de respuesta coordinada, evaluación de necesidades y trabajo en equipo bajo criterios Esfera.",
    imageSrc: "/img/esfera/cards/simulacro-indoor.webp",
    imageAlt:
      "Simulacro de gestión de emergencias en espacio cerrado — voluntarios en ejercicio de respuesta humanitaria",
  },
];
