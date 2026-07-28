import type { AgendaEntry } from "@/lib/agenda";

/** Conferencias culturales fechadas — agenda del home y páginas correspondientes. */
export const CONFERENCIAS_PROXIMAS: AgendaEntry[] = [
  {
    id: "conferencia-arte-vivir-jul16",
    category: "conferencia",
    title: "El arte de vivir con propósito",
    startsAt: "2026-07-16",
    date: "Miércoles 16 de julio",
    time: "7:00 p.m.",
    sede: "Sede Naco · Santo Domingo",
    tag: "Abierta y gratuita",
    image: "/img/agenda/conferencia-auditorio.webp",
    imageAlt:
      "Conferencia abierta en auditorio universitario — filosofía práctica y sentido de la vida",
    description:
      "Conferencia cultural para explorar la filosofía como herramienta práctica: sentido, voluntad y decisiones cotidianas.",
    inscribeMessage:
      "Hola, me interesa asistir a la conferencia «El arte de vivir con propósito» — miércoles 16 de julio, 7:00 p.m., Sede Naco. ¿Me pueden confirmar cupo?",
    detailHref: "/eventos",
    detailLabel: "Ver eventos",
  },
];
