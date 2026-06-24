import { MANUAL_ESFERA_COVER } from "@/lib/esfera-content";
import type {
  CmsVoluntariadoCard,
  CmsVoluntariadoInfoCard,
  CmsVoluntariadoPage,
  CmsVoluntariadoReciente,
} from "@/lib/cms/types";

export const VOLUNTARIADO_QUE_HACEMOS_SECTION = {
  eyebrow: "Líneas de acción",
  title: "¿Qué hacemos?",
  intro:
    "Nuestras actividades de voluntariado se desarrollan durante todo el año en colaboración con la comunidad, promoviendo valores, solidaridad y responsabilidad social a través de acciones concretas que buscan mejorar la vida de las personas y contribuir al cuidado del entorno.",
} as const;

export const VOLUNTARIADO_QUE_HACEMOS_DEFAULTS: CmsVoluntariadoCard[] = [
  {
    id: "medio-ambiente",
    src: "/img/voluntariado/cards/ecologia.webp",
    alt: "Voluntarios de Nueva Acrópolis en una jornada de reforestación al aire libre",
    area: "Medio Ambiente",
    title: "Voluntariado Ambiental",
    text: "Realizamos jornadas de reforestación, limpieza de playas, parques y espacios públicos, así como actividades de educación ambiental que fomentan el respeto y la protección de la naturaleza.",
  },
  {
    id: "accion-social",
    src: "/img/voluntariado/cards/ancianos.webp",
    alt: "Voluntarios de Nueva Acrópolis compartiendo con residentes de un hogar de ancianos",
    area: "Acción Social",
    title: "Acción Social y Comunitaria",
    text: "Desarrollamos actividades destinadas a fortalecer el tejido social mediante visitas a hogares de ancianos, centros comunitarios y otras instituciones, promoviendo la compañía, la integración y el apoyo a quienes más lo necesitan.",
  },
  {
    id: "educacion-ninez",
    src: "/img/voluntariado/cards/ninos.webp",
    alt: "Voluntarios realizando una actividad educativa con niños",
    area: "Educación y Niñez",
    title: "Apoyo a la Niñez y la Educación",
    text: "Organizamos campañas de recolección y entrega de útiles escolares, actividades recreativas, talleres educativos y espacios de formación en valores para contribuir al desarrollo integral de niños y jóvenes.",
  },
  {
    id: "ayuda-humanitaria",
    src: "/img/actividades/voluntariado-santa-rosa.webp",
    alt: "Voluntarios entregando donaciones en una acción solidaria comunitaria",
    area: "Ayuda Humanitaria",
    title: "Ayuda Humanitaria y Solidaridad",
    text: "Impulsamos campañas de donación y recolección de alimentos, ropa, juguetes y otros recursos para apoyar a comunidades e instituciones en situación de vulnerabilidad.",
  },
  {
    id: "salud-comunitaria",
    src: "/img/actividades/feria-salud.webp",
    alt: "Voluntarios apoyando una feria de salud comunitaria",
    area: "Salud Comunitaria",
    title: "Salud y Bienestar Comunitario",
    text: "Participamos en ferias de salud y jornadas preventivas, brindando apoyo logístico, orientación a los asistentes y colaboración en iniciativas que promueven el bienestar físico y social de la comunidad.",
  },
  {
    id: "formacion-valores",
    src: "/img/actividades/unibe.webp",
    alt: "Voluntarios de Nueva Acrópolis en la Feria de Voluntariado de UNIBE",
    area: "Formación y Valores",
    title: "Formación en Valores y Ciudadanía",
    text: "Promovemos actividades culturales, educativas y de desarrollo humano que fortalecen la responsabilidad, la convivencia, la solidaridad y el compromiso con una sociedad mejor.",
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
    text: "Cada donación ayuda a sostener proyectos de medio ambiente, acción social, salud comunitaria y formación en valores. Puedes colaborar puntualmente o de forma recurrente.",
    cta: "Quiero donar",
    ctaHref: "",
  },
];

export const VOLUNTARIADO_PARTICIPACION_SECTION = {
  eyebrow: "Súmate",
  title: "Quiero ser voluntario/a",
  intro:
    "Pulsa el botón y cuéntanos qué línea de voluntariado te interesa. Envía tu solicitud por correo y te contactaremos para las próximas convocatorias.",
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
