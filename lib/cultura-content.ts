import type {
  CmsCirculoAmigosPromo,
  CmsCulturaCard,
} from "@/lib/cms/types";

export const CULTURA_TALLERES_SECTION = {
  eyebrow: "Talleres culturales",
  title: "Talleres de arte y expresión",
  intro:
    "Espacios para desarrollar la sensibilidad y el trabajo en equipo. Fechas, horarios y sedes se confirman según la programación.",
} as const;

export const CULTURA_TALLERES_DEFAULTS: CmsCulturaCard[] = [
  {
    id: "coro",
    src: "/img/cultura/talleres/coro.webp",
    alt: "Coro mixto cantando durante un ensayo",
    title: "Coro",
    text: "La voz como instrumento de unión: ensayos y presentaciones que cultivan la escucha y el trabajo en equipo.",
  },
  {
    id: "teatro",
    src: "/img/cultura/talleres/teatro.webp",
    alt: "Grupo de teatro de distintas edades ensayando en escena",
    title: "Teatro",
    text: "Expresión, memoria y carácter sobre el escenario; montajes con sentido formativo y humano, para todas las edades.",
  },
  {
    id: "cineforum",
    src: "/img/actividades/cineforum.webp",
    alt: "Cineforum filosófico con proyección y debate en sala",
    title: "Cineforum",
    text: "Cine y filosofía: proyección seguida de diálogo sobre la obra, sus ideas y lo que nos mueve como personas.",
  },
  {
    id: "danza",
    src: "/img/cultura/talleres/danza.webp",
    alt: "Clase de merengue con trajes típicos dominicanos",
    title: "Danza",
    text: "El movimiento como lenguaje: desde el merengue y nuestras danzas típicas hasta danzas de distintas culturas y su simbolismo.",
  },
  {
    id: "jovenes",
    src: "/img/cultura/talleres/jovenes.webp",
    alt: "Jóvenes en un ejercicio de trabajo en equipo al aire libre",
    title: "Jóvenes",
    text: "Actividades pensadas para jóvenes: arte, naturaleza, retos y voluntariado con espíritu de equipo.",
  },
];

export const CULTURA_VIAJES_SECTION = {
  eyebrow: "Viajes culturales",
  title: "Conocer el mundo, dentro y fuera del país",
  intro:
    "La cultura también se vive viajando. Organizamos salidas a sitios locales y expediciones internacionales para acercarnos al arte, la historia y la naturaleza con una mirada filosófica.",
} as const;

export const CULTURA_EVENTOS_SECTION = {
  eyebrow: "Eventos",
  title: "Eventos",
  intro:
    "Crónicas de encuentros culturales que ya realizamos. Pulsa cada tarjeta para leer la nota completa.",
} as const;

export const CULTURA_EVENTOS_PREVIEW_DEFAULTS: CmsCulturaCard[] = [
  {
    id: "el-arte-de-respirar",
    src: "/img/eventos/respirar.webp",
    alt: "Encuentro de respiración consciente en Nueva Acrópolis",
    title: 'Encuentro "El arte de respirar"',
    text: "Una jornada para redescubrir la respiración consciente como herramienta de calma, atención y bienestar interior.",
    date: "6 de mayo de 2026",
    sede: "Izbira Event Venue",
    href: "/eventos/el-arte-de-respirar",
  },
  {
    id: "valor-de-las-abejas",
    src: "/img/eventos/abejas.webp",
    alt: "Charla sobre el valor de las abejas y apertura del nuevo Centro Cultural",
    title: "El valor de las abejas",
    text: "Charla sobre el papel esencial de las abejas en la naturaleza, con invitadas de Miel Nucayní y la apertura de nuestro nuevo Centro Cultural.",
    date: "8 de abril de 2026",
    sede: "Izbira Event Venue",
    href: "/eventos/valor-de-las-abejas",
  },
];

export const CULTURA_CIRCULO_AMIGOS_DEFAULTS: CmsCirculoAmigosPromo = {
  eyebrow: "Abierto al público",
  title: "¿Quieres ser amigo de Nueva Acrópolis?",
  lede: "Un espacio para quienes aman la filosofía, la cultura y el voluntariado — jóvenes adultos, personas de mediana edad y mayores — y desean seguir vinculados a Nueva Acrópolis sin integrarse al plan de estudios regular. Incluye diálogos semanales sobre filosofía y temas de actualidad, y otras actividades abiertas a quienes no pueden formar parte del plan de estudios.",
  imageSrc: "/img/circulo-amigos/conversacion.webp",
  imageAlt:
    "Hombres y mujeres de distintas edades conversando juntos en círculo sobre filosofía y temas de actualidad",
};
