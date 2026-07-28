/** Contenido y medios del landing Diplomado (sesión activa). */

export const DIPLOMADO_FRAMER_ASSETS = {
  naLogo: "/img/diplomado/landing/na-logo.png",
  /** Cielo del hero (Framer): nebulosa y estrellas de fondo. */
  heroCollage: "/img/diplomado/landing/hero-bg.png",
  heroPyramids: "/img/diplomado/landing/hero-layer.png",
  heroBuddha: "/img/diplomado/landing/hero-buddha.png",
  heroPhilosopher: "/img/diplomado/landing/hero-accent.png",
  about: "/img/diplomado/landing/about.png",
  modulo01: "/img/diplomado/landing/modulo-01.png",
  modulo02: "/img/diplomado/landing/modulo-02.png",
  modulo03: "/img/diplomado/landing/modulo-03.png",
  /** Mapa mundial + escuelas OINA (generar con scripts/generate-world-map.mjs). */
  worldMap: "/img/diplomado/landing/world-map-oina.webp",
} as const;

/**
 * Medios del collage del hero — móvil (Framer 430px) y web (escritorio).
 * Usar PNG con canal alpha en figuras (pirámide, buda, filósofo).
 * Regenerar desde Framer: node scripts/download-framer-diplomado-assets.mjs
 */
export const DIPLOMADO_HERO = {
  mobile: {
    sky: DIPLOMADO_FRAMER_ASSETS.heroCollage,
    pyramids: DIPLOMADO_FRAMER_ASSETS.heroPyramids,
    buddha: DIPLOMADO_FRAMER_ASSETS.heroBuddha,
    philosopher: DIPLOMADO_FRAMER_ASSETS.heroPhilosopher,
    skyObjectPosition: "center 28%",
  },
  desktop: {
    sky: DIPLOMADO_FRAMER_ASSETS.heroCollage,
    pyramids: DIPLOMADO_FRAMER_ASSETS.heroPyramids,
    buddha: DIPLOMADO_FRAMER_ASSETS.heroBuddha,
    philosopher: DIPLOMADO_FRAMER_ASSETS.heroPhilosopher,
    skyObjectPosition: "center 32%",
  },
} as const;

/** Sesión activa que promociona esta landing. */
export const DIPLOMADO_ACTIVE_SESSION = {
  label: "Próxima sesión",
  date: "Lunes 3 de agosto",
  time: "7:00 – 9:15 p.m.",
  modality: "Presencial",
} as const;

export const DIPLOMADO_INSCRIBE_WHATSAPP =
  "Hola, me interesa inscribirme al Diplomado Filosofía para la Vida (Nueva Acrópolis). ¿Me pueden dar información sobre fechas, sedes e inscripción?";

/** Badge sobre el collage del hero (sin hora; solo día y fecha). */
export const DIPLOMADO_HERO_BADGE = {
  weekday: "Lunes",
  date: "03 AGO",
} as const;

export const DIPLOMADO_TESTIMONIAL = {
  eyebrow: "Como tú",
  quote: "«Conócete a ti mismo» — el primer paso para vivir con mayor sentido y claridad.",
  videoUrl: "https://www.youtube.com/watch?v=4sMY_gaAadE",
} as const;

/** Franja blanca bajo el hero (como Framer). */
export const DIPLOMADO_INFO_BANNER = [
  { value: "03 AGO", label: "Inicio" },
  { value: "5 meses", label: "Duración" },
  { value: "Presencial", label: "Modalidad" },
] as const;

export const DIPLOMADO_ABOUT = {
  eyebrow: "Sobre el diplomado",
  title: "¿Qué es el Diplomado?",
  paragraphs: [
    "Un programa de Nueva Acrópolis para quienes buscan sentido, crecimiento personal y herramientas reales para vivir mejor.",
    "Recorrerás las grandes tradiciones de Oriente y Occidente — India, Tíbet, China, Grecia y más — hasta nuestros días, para encontrar respuestas a las preguntas esenciales y llevarlas a tu forma de vivir.",
    "Formación práctica, no solo teoría: conocimientos útiles para aplicar en el día a día.",
  ],
} as const;

export const DIPLOMADO_PROGRAM = {
  eyebrow: "Programa · 3 módulos",
  title: "3 Módulos,",
  titleAccent: "5 Meses de Filosofía Viva",
} as const;

export const DIPLOMADO_MODULOS = [
  {
    n: "01",
    title: "Potencializar la Ética y los Valores",
    question: "¿Cómo conquistar la armonía dentro de mí mismo?",
    image: DIPLOMADO_FRAMER_ASSETS.modulo01,
    alt: "Módulo 1 — La Escuela de Atenas",
  },
  {
    n: "02",
    title: "Para Mejorar las Relaciones Humanas",
    question: "¿Cómo construir vínculos más conscientes y respetuosos?",
    image: DIPLOMADO_FRAMER_ASSETS.modulo02,
    alt: "Módulo 2 — tradición y convivencia",
  },
  {
    n: "03",
    title: "Para Construir el Futuro",
    question: "¿Cómo caminamos para construir un futuro más armonioso?",
    image: DIPLOMADO_FRAMER_ASSETS.modulo03,
    alt: "Módulo 3 — construir el futuro",
  },
] as const;

export const DIPLOMADO_IMPACT = {
  headline: { end: 500_000, suffix: "+" },
  title: "Personas en el mundo han realizado este diplomado.",
  subtitle: "Nuestra escuela de filosofía tiene presencia en todo el mundo.",
  stats: [
    { end: 500, suffix: "+", label: "Escuelas en el mundo" },
    { end: 60, suffix: "+", label: "Países" },
    { end: 27, suffix: " años", label: "En la República Dominicana" },
  ],
} as const;

export const DIPLOMADO_INSCRIPTION = {
  eyebrow: "Más información",
  title: "¿Quieres unirte a esta aventura?",
  intro:
    "Escríbenos por WhatsApp y te orientamos sobre fechas, sedes disponibles y el proceso de inscripción.",
  capacityNote: "Cupo limitado · Requiere inscripción previa",
  feeMain: "",
  feeNote: "",
  paymentNote: "",
  account: "",
  accountLabel: "",
  rnc: "",
  rncLabel: "",
  email: "",
  footnote: "",
  schedule: [],
} as const;
