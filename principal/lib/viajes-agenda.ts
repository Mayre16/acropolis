import type { AgendaEntry } from "@/lib/agenda";

/** Próximas salidas de viajes culturales — destacadas en el carrusel del home. */
export const VIAJES_PROXIMAS_SALIDAS: AgendaEntry[] = [
  {
    id: "viaje-tres-ojos-jul12",
    category: "cultura",
    title: "Excursión: Los Tres Ojos",
    startsAt: "2026-07-12",
    date: "Domingo 12 de julio",
    time: "8:00 a.m.",
    sede: "Salida coordinada · Santo Domingo",
    tag: "Viaje cultural",
    image: "/img/cultura/viajes/tres-ojos.webp",
    imageAlt: "Laguna azul turquesa en el Parque Nacional Los Tres Ojos",
    description:
      "Excursión de medio día al parque de cuevas y lagos subterráneos: naturaleza, geología y simbolismo del agua con una mirada filosófica.",
    inscribeMessage:
      "Hola, me interesa la excursión a Los Tres Ojos — domingo 12 de julio. ¿Me pueden confirmar cupo, punto de encuentro e inversión?",
    detailHref: "/cultura/viajes/locales/los-tres-ojos/",
    detailLabel: "Ver viaje",
    showOnHome: true,
  },
  {
    id: "viaje-pomier-ago16",
    category: "cultura",
    title: "Excursión: Cuevas de Pomier",
    startsAt: "2026-08-16",
    date: "Domingo 16 de agosto",
    time: "7:00 a.m.",
    sede: "Salida desde Santo Domingo · San Cristóbal",
    tag: "Viaje cultural",
    image: "/img/cultura/viajes/pomier.webp",
    imageAlt: "Petroglifos taínos en las Cuevas de Pomier, San Cristóbal",
    description:
      "Jornada completa al mayor santuario rupestre del Caribe: más de cuatro mil petroglifos y pictografías taínas con guía especializado.",
    inscribeMessage:
      "Hola, me interesa la excursión a las Cuevas de Pomier — domingo 16 de agosto. ¿Me pueden dar detalles de inscripción y transporte?",
    detailHref: "/cultura/viajes/locales/cuevas-de-pomier/",
    detailLabel: "Ver viaje",
    showOnHome: true,
  },
  {
    id: "viaje-egipto-sep10",
    category: "cultura",
    title: "Expedición cultural a Egipto",
    startsAt: "2026-09-10",
    date: "",
    time: "7:00 p.m.",
    sede: "Charla informativa · Sede Naco",
    tag: "Viaje internacional",
    image: "/img/cultura/viajes/egipto.webp",
    imageAlt: "Grupo de Nueva Acrópolis frente a las pirámides de Giza",
    description:
      "Charla sobre el viaje a El Cairo, Luxor y Aswan: pirámides, templos del Nilo e inscripción a la expedición de diez días.",
    inscribeMessage:
      "Hola, me interesa recibir información sobre la expedición cultural a Egipto. ¿Me pueden enviar fechas, itinerario e inversión?",
    detailHref: "/cultura/viajes/internacionales/egipto/",
    detailLabel: "Ver expedición",
    showOnHome: true,
  },
];
