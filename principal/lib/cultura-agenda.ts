import type { AgendaEntry } from "@/lib/agenda";

/** Próximas actividades culturales — /cultura y carrusel del home (showOnHome). */
export const CULTURA_PROXIMAS_ACTIVIDADES: AgendaEntry[] = [
  {
    id: "cultura-teatro-jun11",
    category: "cultura",
    title: "Taller de Teatro",
    startsAt: "2026-06-11",
    date: "Jueves 11 de junio",
    time: "7:00 p.m.",
    sede: "Sede Naco",
    tag: "Clase",
    image: "/img/cultura/agenda/teatro.webp",
    imageAlt: "Grupo de teatro ensayando en escena",
    description:
      "Taller de expresión escénica en la Sede Naco: voz, cuerpo y presencia en escena. Espacio para todas las edades, con montajes que combinan formación y disfrute del arte dramático.",
    inscribeMessage:
      "Hola, me interesa el Taller de Teatro — Sede Naco, jueves 11 de junio, 7:00 p.m. ¿Me pueden dar más información?",
    detailHref: "/cultura",
    detailLabel: "Ver cultura",
  },
  {
    id: "cultura-coro-jun13",
    category: "cultura",
    title: "Ensayo de Coro",
    startsAt: "2026-06-13",
    date: "Sábado 13 de junio",
    time: "10:00 a.m.",
    sede: "Sede Los Prados",
    image: "/img/cultura/agenda/coro.webp",
    imageAlt: "Coro mixto cantando durante un ensayo",
    description:
      "Ensayo del coro mixto de Nueva Acrópolis en Los Prados. Cantamos en grupo, cultivamos la escucha y preparamos presentaciones para veladas y celebraciones culturales.",
    inscribeMessage:
      "Hola, me interesa el Ensayo de Coro — Sede Los Prados, sábado 13 de junio, 10:00 a.m. ¿Me pueden dar más información?",
    detailHref: "/cultura",
    detailLabel: "Ver cultura",
  },
  {
    id: "cultura-jovenes-jun20",
    category: "cultura",
    title: "Encuentro cultural de jóvenes",
    startsAt: "2026-06-20",
    date: "Sábado 20 de junio",
    time: "10:00 a.m.",
    sede: "Sede Naco",
    image: "/img/cultura/agenda/jovenes.webp",
    imageAlt: "Jóvenes en actividad cultural al aire libre",
    description:
      "Encuentro para jóvenes en la Sede Naco: arte, dinámicas en equipo, naturaleza y reflexión. Un espacio para compartir, crear y conocer propuestas culturales de la escuela.",
    inscribeMessage:
      "Hola, me interesa el Encuentro cultural de jóvenes — Sede Naco, sábado 20 de junio, 10:00 a.m. ¿Me pueden dar más información?",
    detailHref: "/cultura",
    detailLabel: "Ver cultura",
  },
  {
    id: "cultura-teatro-jul8",
    category: "cultura",
    title: "Taller de Teatro",
    startsAt: "2026-07-08",
    date: "Martes 8 de julio",
    time: "7:00 p.m.",
    sede: "Sede Naco",
    tag: "Clase",
    image: "/img/cultura/agenda/teatro.webp",
    imageAlt: "Grupo de teatro ensayando en escena",
    description:
      "Nueva convocatoria del taller de expresión escénica: voz, cuerpo y presencia en escena. Espacio para todas las edades.",
    inscribeMessage:
      "Hola, me interesa el Taller de Teatro — Sede Naco, martes 8 de julio, 7:00 p.m. ¿Me pueden dar más información?",
    detailHref: "/cultura",
    detailLabel: "Ver cultura",
    showOnHome: true,
  },
  {
    id: "cultura-coro-jul6",
    category: "cultura",
    title: "Ensayo de Coro",
    startsAt: "2026-07-06",
    date: "Domingo 6 de julio",
    time: "10:00 a.m.",
    sede: "Sede Los Prados",
    image: "/img/cultura/agenda/coro.webp",
    imageAlt: "Coro mixto cantando durante un ensayo",
    description:
      "Ensayo del coro mixto de Nueva Acrópolis en Los Prados. Cantamos en grupo, cultivamos la escucha y preparamos presentaciones culturales.",
    inscribeMessage:
      "Hola, me interesa el Ensayo de Coro — Sede Los Prados, domingo 6 de julio, 10:00 a.m. ¿Me pueden dar más información?",
    detailHref: "/cultura",
    detailLabel: "Ver cultura",
    showOnHome: true,
  },
];
