import type { AgendaEntry } from "@/lib/agenda";
import { DIPLOMADO_INSCRIBE_WHATSAPP } from "@/lib/diplomado-content";

/** Próximas convocatorias del Diplomado — home, /filosofia, /diplomado (carrusel). */
export const DIPLOMADO_PROXIMAS_SESIONES: AgendaEntry[] = [
  {
    id: "diplomado-sd-jun29",
    category: "diplomado",
    title: "Diplomado de Filosofía para la Vida",
    startsAt: "2026-08-03",
    date: "Lunes 3 de agosto",
    time: "7:00 – 9:15 p.m.",
    sede: "Presencial · Santo Domingo",
    tag: "Próxima sesión",
    image: "/img/filosofia/diplomado/diplomado-01.webp",
    imageAlt:
      "Diplomado de Filosofía para la Vida — Parthenon, libros y pensamiento clásico",
    description:
      "Nueva convocatoria del Diplomado de Filosofía para la Vida: filosofía comparada de Oriente y Occidente en sesiones presenciales. Cuatro meses, tres módulos, sin requisitos previos.",
    inscribeMessage: DIPLOMADO_INSCRIBE_WHATSAPP,
    detailHref: "/filosofia",
    detailLabel: "Ver programa completo",
  },
  {
    id: "diplomado-los-prados-jun13",
    category: "diplomado",
    title: "Diplomado de Filosofía para la Vida",
    startsAt: "2026-06-13",
    date: "Sábado 13 de junio",
    time: "10:00 a.m.",
    sede: "Sede Los Prados",
    tag: "Cupos abiertos",
    image: "/img/filosofia/diplomado/diplomado-01.webp",
    imageAlt:
      "Diplomado de Filosofía para la Vida — Parthenon, libros y pensamiento clásico",
    description:
      "Primera sesión del Diplomado de Filosofía para la Vida en la Sede Los Prados. Curso introductorio de filosofía comparada de Oriente y Occidente: cinco meses, una sesión semanal, sin requisitos previos.",
    inscribeMessage:
      "Hola, me interesa inscribirme al Diplomado de Filosofía para la Vida — Sede Los Prados, sábado 13 de junio, 10:00 a.m. ¿Me pueden dar más información?",
    detailHref: "/filosofia",
    detailLabel: "Ver programa completo",
  },
  {
    id: "diplomado-naco-jun9",
    category: "diplomado",
    title: "Diplomado de Filosofía para la Vida",
    startsAt: "2026-06-09",
    date: "Martes 9 de junio",
    time: "7:00 p.m.",
    sede: "Sede Naco",
    image: "/img/filosofia/diplomado/diplomado-02.webp",
    imageAlt:
      "Diplomado de Filosofía para la Vida — pirámides, cosmos y exploración del saber",
    description:
      "Grupo del Diplomado de Filosofía para la Vida en horario nocturno, Sede Naco. Programa de cinco meses con enfoque práctico: autoconocimiento, convivencia y futuro.",
    inscribeMessage:
      "Hola, me interesa inscribirme al Diplomado de Filosofía para la Vida — Sede Naco, martes 9 de junio, 7:00 p.m. ¿Me pueden dar más información?",
    detailHref: "/filosofia",
    detailLabel: "Ver programa completo",
  },
  {
    id: "diplomado-naco-jun20",
    category: "diplomado",
    title: "Diplomado de Filosofía para la Vida",
    startsAt: "2026-06-20",
    date: "Sábado 20 de junio",
    time: "10:00 a.m.",
    sede: "Sede Naco",
    image: "/img/filosofia/diplomado/diplomado-04.webp",
    imageAlt:
      "Diplomado de Filosofía para la Vida — manuscritos, ciencia y filosofía comparada",
    description:
      "Nuevo grupo del Diplomado en horario matutino, Sede Naco. Filosofía para la vida en sesiones participativas con prácticas en clase.",
    inscribeMessage:
      "Hola, me interesa inscribirme al Diplomado de Filosofía para la Vida — Sede Naco, sábado 20 de junio, 10:00 a.m. ¿Me pueden dar más información?",
    detailHref: "/filosofia",
    detailLabel: "Ver programa completo",
  },
];
