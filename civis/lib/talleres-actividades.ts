import type { HeroImage } from "@/lib/hero-images";
import type { TallerCivis } from "@/lib/talleres";

export type LineaTallerId = TallerCivis["id"];

export type TallerRealizado = {
  title: string;
  client: string;
  date: string;
  place?: string;
  /** Línea formativa: ética, convivencia o conflicto. */
  lineaId: LineaTallerId;
  image: HeroImage;
};

export type ProximaActividad = {
  id: string;
  title: string;
  date: string;
  startsAt?: string;
  time?: string;
  sede?: string;
  format: string;
  excerpt: string;
  /** Línea formativa: ética, convivencia o conflicto. */
  lineaId: LineaTallerId;
  image: HeroImage;
  /** Si está abierto a inscripción / solicitud de propuesta. */
  open: boolean;
};

/** Talleres corporativos recientes (6 fotos — 2 por línea formativa). */
export const TALLERES_REALIZADOS: TallerRealizado[] = [
  {
    title: "Ética y liderazgo en el entorno corporativo",
    client: "Barna Management School",
    date: "2025",
    place: "Santo Domingo",
    lineaId: "etica",
    image: {
      src: "/img/actividades/etica-liderazgo-corporativo.webp",
      alt: "Taller de ética y liderazgo con directivos y empresarios en sala de formación",
      objectPosition: "50% 35%",
    },
  },
  {
    title: "Integridad y responsabilidad en equipos directivos",
    client: "Empresa del sector privado",
    date: "2024",
    place: "República Dominicana",
    lineaId: "etica",
    image: {
      src: "/img/actividades/integridad-equipos-directivos.webp",
      alt: "Directivos en sesión de integridad y responsabilidad corporativa",
      objectPosition: "50% 30%",
    },
  },
  {
    title: "Comunicación y convivencia en equipos",
    client: "Institución pública",
    date: "2024",
    place: "Santo Domingo",
    lineaId: "convivencia",
    image: {
      src: "/img/actividades/comunicacion-convivencia-equipos.webp",
      alt: "Taller de comunicación y convivencia con participantes en ejercicio de escucha activa",
      objectPosition: "50% 28%",
    },
  },
  {
    title: "Personas y clima laboral",
    client: "Organización gremial",
    date: "2024",
    lineaId: "convivencia",
    image: {
      src: "/img/actividades/personas-clima-laboral.webp",
      alt: "Dinámica grupal sobre convivencia y clima laboral en taller corporativo",
      objectPosition: "50% 32%",
    },
  },
  {
    title: "Los conflictos como retos y oportunidades",
    client: "Barna Management School",
    date: "2025",
    place: "Santo Domingo",
    lineaId: "conflicto",
    image: {
      src: "/img/actividades/conflictos-retos-oportunidades.webp",
      alt: "Charla sobre conflictos como retos y oportunidades ante grupo de profesionales",
      objectPosition: "55% 30%",
    },
  },
  {
    title: "Conflicto y liderazgo con criterio",
    client: "Empresa privada · mandos medios",
    date: "2024",
    lineaId: "conflicto",
    image: {
      src: "/img/actividades/conflicto-liderazgo-criterio.webp",
      alt: "Mandos medios en ejercicio de mediación y liderazgo durante taller presencial",
      objectPosition: "50% 28%",
    },
  },
];

/** Próximas actividades abiertas o en planificación. */
export const PROXIMAS_ACTIVIDADES: ProximaActividad[] = [
  {
    id: "etica-in-company",
    title: "Ética y responsabilidad in company",
    date: "Por confirmar — 2026",
    format: "Taller corporativo · 4 h",
    excerpt:
      "Sesión para equipos directivos sobre integridad, transparencia y criterios compartidos de decisión.",
    lineaId: "etica",
    image: {
      src: "/img/salones/hipatia-mesas.webp",
      alt: "Salón Hipatia con mesas redondas listo para taller corporativo in company",
      objectPosition: "50% 40%",
    },
    open: true,
  },
  {
    id: "convivencia-equipos",
    title: "Personas y convivencia en el trabajo",
    date: "Por confirmar — 2026",
    format: "Taller corporativo · 6 h",
    excerpt:
      "Comunicación, escucha activa y herramientas para mejorar el clima laboral en entornos exigentes.",
    lineaId: "convivencia",
    image: {
      src: "/img/hero/taller-equipos.webp",
      alt: "Participantes en dinámica grupal de convivencia y trabajo en equipo",
      objectPosition: "50% 30%",
    },
    open: true,
  },
  {
    id: "conflicto-liderazgo",
    title: "Conflicto y liderazgo con criterio",
    date: "Por confirmar — 2026",
    format: "Taller corporativo · jornada completa",
    excerpt:
      "Herramientas prácticas para mediar tensiones y negociar acuerdos en equipos de mando medio y alta dirección.",
    lineaId: "conflicto",
    image: {
      src: "/img/hero/conflictos.webp",
      alt: "Facilitación de taller sobre manejo de conflictos ante grupo de profesionales",
      objectPosition: "50% 28%",
    },
    open: true,
  },
];
