/** Contenido institucional Esfera — alineado con spherestandards.org y rol OINADOM. */

import { VOLUNTARIADO_EMAIL } from "@/lib/site-config";

/** Referencias oficiales Sphere (Estándares Humanitarios). */
export const SPHERE_OFFICIAL = {
  home: "https://spherestandards.org/",
  about: "https://spherestandards.org/about/",
  focalPoints: "https://spherestandards.org/focal-points/",
  handbook: "https://spherestandards.org/handbook/",
} as const;

export const ESFERA_OFFICIAL_SITE_LABEL = "Visitar la página oficial de Esfera";

export const ESFERA_OINADOM_BROCHURE = {
  href: "/docs/brochure-talleres-charlas-oinadom-esfera.pdf",
  title: "Brochure de talleres y charlas Esfera",
  lede:
    "Presentación de nuestra oferta como punto focal Esfera en República Dominicana: modalidades, audiencias y alcance de los talleres sobre estándares humanitarios.",
  note: "PDF descargable · OINADOM.",
} as const;

export const ESFERA_TAGLINE = "Estándares humanitarios para la vida con dignidad";

export const ESFERA_TAGLINE_SUPPORT =
  "Esfera define, promueve y aplica principios humanitarios y normas mínimas para respuestas que salvan vidas, protegen a las personas y rinden cuentas ante quienes enfrentan crisis.";

export type EsferaQuienesTabId = "quienes" | "hacemos";

export const ESFERA_QUIENES_TABS: { id: EsferaQuienesTabId; label: string }[] = [
  { id: "quienes", label: "Quiénes somos" },
  { id: "hacemos", label: "Qué hacemos" },
];

export const ESFERA_QUIENES_PANELS: Record<
  EsferaQuienesTabId,
  {
    lede: string;
    image: { src: string; alt: string };
    points: { title: string; text: string }[];
  }
> = {
  quienes: {
    lede:
      "Esfera reúne a personas y organizaciones comprometidas con una acción humanitaria de calidad, guiada por principios y rendición de cuentas.",
    image: {
      src: "/img/esfera/home-ayuda-humanitaria.webp",
      alt: "Voluntarios ayudan con dignidad a una familia dominicana en situación de emergencia comunitaria",
    },
    points: [
      {
        title: "Red global",
        text: "Desde 1997 impulsada por ONG's y el Movimiento de la Cruz Roja y Media Luna Roja; hoy es referencia en respuestas humanitarias.",
      },
      {
        title: "Puntos focales",
        text: "Entidades nacionales — universidades, ONG's, movimientos humanitarios — que difunden los Estándares Esfera en cada país.",
      },
      {
        title: "Nueva Acrópolis",
        text: "Somos punto focal desde 2024: acompañamos a instituciones en el uso del Manual Esfera.",
      },
    ],
  },
  hacemos: {
    lede:
      "Traducimos los Estándares Esfera en formación práctica para equipos e instituciones dominicanas.",
    image: {
      src: "/img/eventos/simulacros.webp",
      alt: "Voluntarios en simulacro y taller de gestión de emergencias Esfera",
    },
    points: [
      {
        title: "Talleres y charlas",
        text: "Carta Humanitaria, Principios de Protección y normas mínimas del Manual Esfera, con dinámicas participativas.",
      },
      {
        title: "Todos los sectores",
        text: "Sector público, privado, académico y sociedad civil — con énfasis en mandos medios y perfiles con capacidad de multiplicar.",
      },
      {
        title: "Voluntariado responsable",
        text: "Formación en liderazgo institucional y primera respuesta comunitaria, alineada a buenas prácticas humanitarias.",
      },
    ],
  },
};

/** @deprecated Use ESFERA_QUIENES_PANELS.quienes */
export const ESFERA_QUIENES_SOMOS =
  "Esfera es una red mundial de personas y organizaciones comprometidas con una acción humanitaria basada en principios, responsable y de calidad. Los puntos focales nacionales son entidades que promueven y difunden los Estándares Esfera en cada país; pertenecen a ONG, movimientos humanitarios, universidades y otras organizaciones — no todos son Nueva Acrópolis, aunque varias escuelas de la organización desempeñan ese rol en el mundo. En República Dominicana, Nueva Acrópolis es uno de esos puntos focales y acompaña a instituciones en el uso del Manual Esfera.";

/** @deprecated Use ESFERA_QUIENES_PANELS.hacemos */
export const ESFERA_QUE_HACEMOS =
  "Difundimos la Carta Humanitaria y las normas mínimas del Manual Esfera mediante talleres y charlas para equipos del sector público, privado, académico y de la sociedad civil, con énfasis en liderazgo institucional y voluntariado responsable ante emergencias.";

export const ESFERA_HOME = {
  image: {
    src: "/img/eventos/simulacros.webp",
    alt: "Voluntarios de Nueva Acrópolis en simulacro y taller de gestión de emergencias",
  },
  lede:
    "El Manual Esfera reúne la Carta Humanitaria, los Principios de Protección, la Norma Humanitaria Esencial y estándares mínimos en agua y saneamiento, seguridad alimentaria, alojamiento y salud — referencia global para respuestas de calidad.",
  detail:
    "Desde 2024, Nueva Acrópolis República Dominicana actúa como punto focal de Esfera en el país, dentro de una red internacional de organizaciones que promueven estos estándares.",
} as const;

/** Portada El Manual Esfera (edición en español, 2018). */
export const MANUAL_ESFERA_COVER = {
  src: "/img/esfera/manual-esfera-portada-es.webp",
  alt: "El Manual Esfera — Carta Humanitaria y normas mínimas para la respuesta humanitaria, edición en español 2018",
} as const;

/** Misma portada, encuadrada 16:10 para tarjetas de agenda (portada completa visible). */
export const MANUAL_ESFERA_COVER_CARD = {
  src: "/img/esfera/manual-esfera-portada-es-card.webp",
  alt: MANUAL_ESFERA_COVER.alt,
} as const;

export const ESFERA_ESTANDARES = {
  title: "Qué son los Estándares Esfera",
  subtitle: "El referente humanitario más reconocido internacionalmente",
  puntoFocal:
    "Desde 2024, Nueva Acrópolis Dominicana es punto focal de Esfera en República Dominicana. Los puntos focales nacionales promueven la aplicación de los estándares a nivel país.",
  text: "Esfera nació en 1997 impulsada por organizaciones no gubernamentales y el Movimiento Internacional de la Cruz Roja y de la Media Luna Roja. Hoy es una red global que reúne a quienes trabajan por respuestas humanitarias de calidad y rendición de cuentas. El Manual Esfera es una de las herramientas más utilizadas por ONG, agencias de la ONU y gobiernos en situaciones de crisis.",
  detail:
    "Se basa en el principio de que toda persona afectada por una crisis tiene derecho a vivir con dignidad y a recibir asistencia y protección.",
  sectores: [
    "Agua, saneamiento e higiene",
    "Seguridad alimentaria",
    "Alojamiento y asentamiento",
    "Salud",
  ],
  manual:
    "El Manual Esfera incluye la Carta Humanitaria, los Principios de Protección y la Norma Humanitaria Esencial: nueve compromisos que promueven la calidad y la rendición de cuentas en toda acción humanitaria.",
  quote:
    "Toda persona afectada por una crisis tiene derecho a vivir con dignidad.",
  quoteSource: "Carta Humanitaria — Manual Esfera 2018",
};

export type EsferaModalidad = {
  id: string;
  title: string;
  duration: string;
  format: string;
  intro: string;
  topics: string[];
  image: string;
  imageAlt: string;
};

export const ESFERA_MODALIDADES: EsferaModalidad[] = [
  {
    id: "taller",
    title: "Taller de media jornada",
    duration: "4 horas",
    format: "Presencial",
    intro:
      "Sesión presencial de cuatro horas para introducir a su equipo en los Estándares Humanitarios Esfera, con enfoque práctico y adaptado al contexto dominicano.",
    topics: [],
    image: "/img/esfera/cards/normas.webp",
    imageAlt: "Equipo en formación sobre Estándares Humanitarios Esfera",
  },
  {
    id: "charla",
    title: "Charla informativa — Filosofía del Voluntariado",
    duration: "1–2 horas",
    format: "Flexible",
    intro:
      "Sesión flexible de una o dos horas sobre voluntariado responsable y resiliencia social, pensada para líderes con capacidad de multiplicar en su organización.",
    topics: [],
    image: "/img/esfera/cards/comunidad.webp",
    imageAlt: "Charla sobre filosofía del voluntariado y resiliencia social",
  },
];

export const ESFERA_MODALIDADES_NOTA =
  "Ambas modalidades son organizadas e impartidas por Nueva Acrópolis Dominicana. Libre de costo para el equipo de la organización anfitriona.";

export type EsferaAudiencia = {
  sector: string;
  items: string[];
  image: string;
  imageAlt: string;
};

export const ESFERA_AUDIENCIAS: EsferaAudiencia[] = [
  {
    sector: "Sector público",
    image: "/img/esfera/audiencia/sector-publico.webp",
    imageAlt:
      "Bomberos, comandantes y personal institucional uniformado en formación Esfera",
    items: [
      "Ministerios y organismos del Estado",
      "Ayuntamientos y municipios",
      "Defensa Civil, COE y gestión de riesgos",
      "Fuerzas de seguridad y bomberos",
    ],
  },
  {
    sector: "Sector privado",
    image: "/img/esfera/audiencia/sector-privado.webp",
    imageAlt:
      "Equipos corporativos en dinámica de coordinación durante formación Esfera",
    items: [
      "Empresas con programas de RSE",
      "Fundaciones corporativas",
      "Gremios y cámaras empresariales",
      "Recursos humanos y desarrollo de liderazgo",
    ],
  },
  {
    sector: "Sector académico",
    image: "/img/esfera/audiencia/sector-academico.webp",
    imageAlt:
      "Participantes en la Feria de Voluntariado UNIBE — formación Esfera en el ámbito universitario",
    items: [
      "Universidades e institutos técnicos",
      "Facultades de ciencias sociales y salud",
      "Programas de gestión de riesgos",
      "Coordinadores de bienestar estudiantil",
    ],
  },
  {
    sector: "Sociedad civil",
    image: "/img/esfera/audiencia/sector-civil.webp",
    imageAlt:
      "Voluntarios y líderes comunitarios en jornada de capacitación Esfera",
    items: [
      "Organizaciones comunitarias",
      "ONGs y fundaciones sin fines de lucro",
      "Grupos de voluntarios",
      "Líderes comunitarios y juntas de vecinos",
    ],
  },
];

export const ESFERA_AUDIENCIA_INTRO =
  "Mandos medios y superiores con capacidad de impacto. Al dirigirnos a perfiles de liderazgo con el aval explícito de sus organizaciones, aseguramos una base sólida para la transformación institucional y para la formación de futuros instructores Esfera.";

export type EsferaBeneficio = {
  title: string;
  text: string;
};

export const ESFERA_BENEFICIOS: EsferaBeneficio[] = [
  {
    title: "Capacidad institucional",
    text: "Equipos mejor preparados ante situaciones de crisis, emergencias y respuesta humanitaria.",
  },
  {
    title: "Estándares internacionales",
    text: "Alineación con las normas humanitarias más utilizadas a nivel mundial.",
  },
  {
    title: "Responsabilidad social",
    text: "Demuestre el compromiso de su institución con el bienestar comunitario.",
  },
  {
    title: "Multiplicadores internos",
    text: "Los líderes formados replican el conocimiento y refuerzan la cultura organizacional.",
  },
  {
    title: "Futuros instructores Esfera",
    text: "Con el aval de su organización, sus colaboradores pueden certificarse como instructores.",
  },
  {
    title: "Red Nacional Esfera",
    text: "Su organización pasa a formar parte de la Red Nacional Esfera en construcción en el país.",
  },
];

export type EsferaImpactStat =
  | {
      label: string;
      countTo: number;
      suffix?: string;
    }
  | {
      label: string;
      display: string;
    };

export const ESFERA_IMPACTO = {
  title: "Ciclo de talleres Esfera 2025",
  intro:
    "Entre octubre y noviembre de 2025, Nueva Acrópolis Dominicana llevó a cabo un ciclo de cuatro talleres presenciales de formación sobre los Estándares Humanitarios Esfera, posibles gracias a la donación del Premio Nacional de Voluntariado Solidario 2025 (MEPyD) por un miembro de la escuela.",
  testimonial:
    "Los participantes destacaron la claridad de los contenidos, su relevancia práctica y el valor del intercambio interinstitucional generado a lo largo del ciclo.",
  stats: [
    { label: "Participantes formados", countTo: 100, suffix: "+" },
    { label: "Instituciones representadas", countTo: 40 },
    { label: "Calificación promedio", display: "4.9/5" },
  ] satisfies EsferaImpactStat[],
};

export type EsferaAlianza = {
  id: string;
  name: string;
  logo: string;
  logoAlt: string;
};

export const ESFERA_ALIANZAS: EsferaAlianza[] = [
  {
    id: "coe",
    name: "COE — Centro de Operaciones de Emergencias",
    logo: "/brand/alianzas/coe.webp",
    logoAlt: "Logo del Centro de Operaciones de Emergencias de la República Dominicana",
  },
  {
    id: "cruz-roja",
    name: "Cruz Roja Dominicana",
    logo: "/brand/alianzas/cruz-roja.webp",
    logoAlt: "Logo de la Cruz Roja Dominicana",
  },
  {
    id: "pucmm",
    name: "PUCMM — Pontificia Universidad Madre y Maestra",
    logo: "/brand/alianzas/pucmm.webp",
    logoAlt: "Logo de la Pontificia Universidad Católica Madre y Maestra",
  },
  {
    id: "indomet",
    name: "INDOMET — Instituto Meteorológico Nacional",
    logo: "/brand/alianzas/indomet.webp",
    logoAlt: "Logo del Instituto Dominicano de Meteorología",
  },
  {
    id: "privado",
    name: "Empresas del sector privado",
    logo: "/brand/alianzas/sector-privado.svg",
    logoAlt: "Representación del sector privado",
  },
];

export const ESFERA_CONTACTO = {
  direccion: "Cub Scout No. 6, Naco",
  ciudad: "Santo Domingo, República Dominicana",
  email: VOLUNTARIADO_EMAIL,
};
