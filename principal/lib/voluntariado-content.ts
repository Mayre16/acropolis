import { MANUAL_ESFERA_COVER } from "@/lib/esfera-content";
import type {
  CmsVoluntariadoCard,
  CmsVoluntariadoInfoCard,
  CmsVoluntariadoPage,
  CmsVoluntariadoReciente,
} from "@/lib/cms/types";

export const VOLUNTARIADO_QUE_HACEMOS_SECTION = {
  eyebrow: "Líneas de acción",
  title: "Qué hacemos",
  intro:
    "Nuestras actividades de voluntariado se desarrollan durante todo el año en colaboración con la comunidad.",
} as const;

export const VOLUNTARIADO_QUE_HACEMOS_DEFAULTS: CmsVoluntariadoCard[] = [
  {
    id: "ecologia",
    src: "/img/voluntariado/cards/ecologia.webp",
    alt: "Voluntarios de Nueva Acrópolis en una jornada de reforestación al aire libre",
    title: "Ecología y plantación",
    text: "Jornadas de reforestación, limpieza de espacios y educación ambiental: cuidar la naturaleza como un acto de servicio.",
  },
  {
    id: "ancianos",
    src: "/img/voluntariado/cards/ancianos.webp",
    alt: "Voluntarios de Nueva Acrópolis compartiendo con residentes de un hogar de ancianos",
    title: "Hogar de ancianos",
    text: "Acompañamiento a personas mayores: visitas, actividades y compañía que devuelven dignidad y alegría.",
  },
  {
    id: "ninos",
    src: "/img/voluntariado/cards/ninos.webp",
    alt: "Voluntarios realizando una actividad educativa con niños",
    title: "Actividades con niños",
    text: "Programas educativos y recreativos que transmiten valores, juego y cultura a los más pequeños.",
  },
];

export const VOLUNTARIADO_ESFERA_SECTION = {
  eyebrow: "Punto Focal",
  title: "Somos Punto Focal Esfera",
  intro:
    "Nueva Acrópolis República Dominicana es punto focal de Esfera — la iniciativa internacional que define y promueve estándares humanitarios para respuestas de calidad y rendición de cuentas. Varios centros de Nueva Acrópolis desempeñan este rol en distintos países; aquí formamos y acompañamos a instituciones con base en el Manual Esfera, con acropolitans de distintas edades.",
  intro2:
    "Si te interesa formarte en respuesta humanitaria o colaborar con la línea Esfera, conoce nuestra página dedicada.",
  ctaPrimary: "Conoce el Punto Focal Esfera",
  ctaSecondary: "Ver formación y actividades de Esfera",
  manualCaption:
    "El Manual Esfera reúne principios y normas mínimas para una respuesta humanitaria digna.",
  manualImageSrc: MANUAL_ESFERA_COVER.src,
  manualImageAlt: MANUAL_ESFERA_COVER.alt,
} as const;

export const VOLUNTARIADO_SOSTENIBILIDAD_SECTION = {
  eyebrow: "Cómo nos sostenemos",
  title: "Todos somos voluntarios",
  intro:
    "Nueva Acrópolis es una organización sin fines de lucro. Quienes la hacemos posible —docentes, instructores, coordinadores y colaboradores— participamos de forma voluntaria y desinteresada. Nadie recibe un salario por su labor: el tiempo que entregamos es nuestra primera forma de servicio.",
} as const;

export const VOLUNTARIADO_SOSTENIBILIDAD_DEFAULTS: CmsVoluntariadoInfoCard[] = [
  {
    id: "trabajo",
    icon: "users",
    title: "Trabajo voluntario",
    text: "Las clases, actividades culturales y jornadas de voluntariado se imparten y organizan por voluntarios. Es la base de nuestro modelo: el servicio antes que el beneficio.",
  },
  {
    id: "financiamiento",
    icon: "coins",
    title: "Cómo nos financiamos",
    text: "Nos sostenemos con las cuotas de socios, los aportes de cursos y talleres, las actividades culturales, la venta de libros de nuestra editorial y donaciones. Todo se reinvierte en la misión.",
  },
  {
    id: "donacion",
    icon: "heart",
    title: "Tu aporte transforma",
    text: "Cada donación ayuda a sostener proyectos de ecología, apoyo social y formación humanitaria. Puedes colaborar puntualmente o de forma recurrente.",
    cta: "Quiero donar",
    ctaHref: "",
  },
];

export const VOLUNTARIADO_PARTICIPACION_SECTION = {
  eyebrow: "Súmate",
  title: "Quiero ser voluntario/a",
  intro:
    "Pulsa el botón y cuéntanos si te interesa el voluntariado humanitario o la línea Punto Focal Esfera. Envía tu solicitud por correo y te contactaremos para las próximas convocatorias.",
} as const;

export const VOLUNTARIADO_RECIENTES_SECTION = {
  eyebrow: "Voluntariado en acción",
  title: "Nuestras actividades recientes",
  intro:
    "Crónicas de nuestro voluntariado, la línea Esfera y encuentros comunitarios recientes. Cada tarjeta enlaza a la nota completa en Eventos.",
} as const;

export const VOLUNTARIADO_RECIENTES_DEFAULTS: CmsVoluntariadoReciente[] = [
  {
    id: "playa",
    src: "/img/voluntariado/cards/playa.webp",
    alt: "Voluntarios de Nueva Acrópolis en jornada de limpieza de playa",
    title: "Limpieza de playa",
    text: "Jornada ambiental en la costa: voluntarios retiraron desechos y sensibilizaron sobre el cuidado del mar y las playas como espacio compartido.",
  },
  {
    id: "siembra",
    src: "/img/voluntariado/cards/ecologia.webp",
    alt: "Voluntarios en jornada de reforestación y plantación de árboles",
    title: "Siembra de árboles",
    date: "Abril 2026",
    text: "En La Jagua, Yaguate (San Cristóbal), 53 voluntarios sembraron 1.080 plántulas de caoba dominicana y guázara en una jornada de reforestación.",
    href: "/eventos/dia-de-la-tierra",
  },
  {
    id: "regalos",
    src: "/img/actividades/voluntariado-santa-rosa.webp",
    alt: "Voluntariado comunitario en Santa Rosa de Lima",
    title: "Entrega de regalos",
    text: "Acción solidaria en Santa Rosa de Lima: voluntarios organizaron y entregaron regalos a familias de la comunidad, con espíritu de servicio y fraternidad.",
  },
  {
    id: "tierra",
    src: "/img/eventos/tierra.webp",
    alt: "Actividad comunitaria del Día de la Tierra con ciencia y filosofía",
    title: "Día de la Tierra",
    date: "Abril 2026",
    text: "Trilogía de encuentros sobre la naturaleza —abejas, bosques y cosmos— y cierre con reforestación, uniendo reflexión filosófica y acción ecológica.",
    href: "/eventos/dia-de-la-tierra",
  },
];

export const DEFAULT_VOLUNTARIADO_PAGE: CmsVoluntariadoPage = {
  proximasTitle: "Próximas actividades",
  proximasIntro:
    "Jornadas y encuentros de voluntariado en nuestras sedes. Haz clic para ver más.",
  queHacemosEyebrow: VOLUNTARIADO_QUE_HACEMOS_SECTION.eyebrow,
  queHacemosTitle: VOLUNTARIADO_QUE_HACEMOS_SECTION.title,
  queHacemosIntro: VOLUNTARIADO_QUE_HACEMOS_SECTION.intro,
  queHacemosCards: VOLUNTARIADO_QUE_HACEMOS_DEFAULTS,
  esferaEyebrow: VOLUNTARIADO_ESFERA_SECTION.eyebrow,
  esferaTitle: VOLUNTARIADO_ESFERA_SECTION.title,
  esferaIntro: VOLUNTARIADO_ESFERA_SECTION.intro,
  esferaIntro2: VOLUNTARIADO_ESFERA_SECTION.intro2,
  esferaCtaPrimary: VOLUNTARIADO_ESFERA_SECTION.ctaPrimary,
  esferaCtaSecondary: VOLUNTARIADO_ESFERA_SECTION.ctaSecondary,
  esferaManualCaption: VOLUNTARIADO_ESFERA_SECTION.manualCaption,
  esferaManualImageSrc: VOLUNTARIADO_ESFERA_SECTION.manualImageSrc,
  esferaManualImageAlt: VOLUNTARIADO_ESFERA_SECTION.manualImageAlt,
  sostenibilidadEyebrow: VOLUNTARIADO_SOSTENIBILIDAD_SECTION.eyebrow,
  sostenibilidadTitle: VOLUNTARIADO_SOSTENIBILIDAD_SECTION.title,
  sostenibilidadIntro: VOLUNTARIADO_SOSTENIBILIDAD_SECTION.intro,
  sostenibilidadCards: VOLUNTARIADO_SOSTENIBILIDAD_DEFAULTS,
  participacionEyebrow: VOLUNTARIADO_PARTICIPACION_SECTION.eyebrow,
  participacionTitle: VOLUNTARIADO_PARTICIPACION_SECTION.title,
  participacionIntro: VOLUNTARIADO_PARTICIPACION_SECTION.intro,
  recientesEyebrow: VOLUNTARIADO_RECIENTES_SECTION.eyebrow,
  recientesTitle: VOLUNTARIADO_RECIENTES_SECTION.title,
  recientesIntro: VOLUNTARIADO_RECIENTES_SECTION.intro,
  recientesItems: VOLUNTARIADO_RECIENTES_DEFAULTS,
};
