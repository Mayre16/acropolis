import type { AgendaEntry } from "@/lib/agenda";

/** Próximas actividades en /voluntariado. Los talleres Esfera viven en esfera-agenda.ts. */
export const VOLUNTARIADO_PROXIMAS_ACTIVIDADES: AgendaEntry[] = [
  {
    id: "vol-reforestacion-jul12",
    category: "voluntariado",
    title: "Jornada de reforestación",
    startsAt: "2026-07-12",
    date: "Sábado 12 de julio",
    time: "8:00 a.m.",
    sede: "Parque ecológico · Santo Domingo Este",
    tag: "Ecología",
    image: "/img/voluntariado/cards/ecologia.webp",
    imageAlt: "Voluntarios en jornada de reforestación y plantación de árboles",
    description:
      "Salida de voluntariado ambiental: plantación, cuidado de espacios verdes y educación ecológica. Ropa cómoda y ganas de servir a la naturaleza.",
    inscribeMessage:
      "Hola, me interesa la Jornada de reforestación — sábado 12 de julio, 8:00 a.m. ¿Me pueden confirmar punto de encuentro?",
    detailHref: "/voluntariado",
    detailLabel: "Ver voluntariado",
    showOnHome: true,
  },
  {
    id: "vol-ninos-jul26",
    category: "voluntariado",
    title: "Actividades con niños",
    startsAt: "2026-07-26",
    date: "Sábado 26 de julio",
    time: "10:00 a.m.",
    sede: "Sede Naco",
    image: "/img/voluntariado/cards/ninos.webp",
    imageAlt: "Voluntarios en actividad educativa y recreativa con niños",
    description:
      "Jornada de voluntariado con niños: juegos, valores, cultura y apoyo educativo en un ambiente alegre y responsable.",
    inscribeMessage:
      "Hola, me interesan las Actividades con niños — Sede Naco, sábado 26 de julio, 10:00 a.m. ¿Me pueden dar más información?",
    detailHref: "/voluntariado",
    detailLabel: "Ver voluntariado",
    showOnHome: true,
  },
  {
    id: "vol-ancianos-ago",
    category: "voluntariado",
    title: "Visita al hogar de ancianos",
    startsAt: "2026-08-23",
    date: "Sábado 23 de agosto",
    time: "10:00 a.m.",
    sede: "Sede Los Prados",
    image: "/img/voluntariado/cards/ancianos.webp",
    imageAlt: "Voluntarios compartiendo con residentes de un hogar de ancianos",
    description:
      "Visita solidaria: acompañamiento, conversación y actividades sencillas que devuelven alegría y dignidad a personas mayores.",
    inscribeMessage:
      "Hola, me interesa la Visita al hogar de ancianos — Sede Los Prados, sábado 23 de agosto, 10:00 a.m. ¿Me pueden dar más información?",
    showOnHome: false,
  },
];
