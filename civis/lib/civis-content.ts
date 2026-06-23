/** Contenido editorial de Civis — submarca de Nueva Acrópolis. */

export const CIVIS_INTRO =
  "Civis es una propuesta de Nueva Acrópolis para empresas e instituciones. Lleva al entorno organizacional la tradición de cultura, filosofía y valores permanentes con la que la Escuela trabaja desde hace más de 65 años: talleres presenciales sobre convivencia, ética y responsabilidad, donde el liderazgo se comprende como parte de la cultura y de una sociedad más consciente — no como técnica aislada.";

export const CIVIS_PROPOSITO =
  "Acercar cultura, valores y formación del ser de Nueva Acrópolis al mundo empresarial e institucional, mediante talleres de convivencia, ética y responsabilidad compartida.";

export const CIVIS_OBJETIVOS = [
  {
    title: "Fortalecer la cultura organizacional",
    text: "Crear espacios de reflexión y práctica donde convivencia, diálogo y valores orienten el trabajo cotidiano de equipos e instituciones.",
  },
  {
    title: "Ética y valores en acción",
    text: "Traducir el ideal acrópoleo de una sociedad más consciente al lenguaje y las decisiones del entorno laboral.",
  },
  {
    title: "Personas al servicio del bien común",
    text: "Formar criterio compartido, confianza interna y coherencia entre lo que se declara y lo que se hace — integrando liderazgo y responsabilidad como parte de la cultura.",
  },
];

/** Pilares formativos — cultura, valores y sociedad (marca NA). */
export const CIVIS_PILARES = [
  {
    title: "Cultura y convivencia",
    text: "Comunicación, escucha activa y respeto mutuo para mejorar el clima y la vida en común en entornos exigentes.",
  },
  {
    title: "Ética y valores",
    text: "Criterios compartidos para decidir con integridad, transparencia y coherencia entre principios y acciones cotidianas.",
  },
  {
    title: "Persona y sociedad",
    text: "Responsabilidad, servicio y liderazgo con sentido — como expresión de una cultura orientada al bien común.",
  },
];

/** Datos de «Nuestros principios» — UI en `CivisPrincipiosSection.tsx` (oculta por ahora). */
export const CIVIS_PRINCIPIOS = [
  {
    title: "Persona al centro",
    text: "La formación parte de quienes integran la organización, no solo de procesos o manuales.",
  },
  {
    title: "Diálogo y escucha",
    text: "El aprendizaje surge del intercambio respetuoso, la pregunta y la reflexión compartida.",
  },
  {
    title: "Ética y coherencia",
    text: "Valores aplicados a decisiones cotidianas, relaciones internas y responsabilidad social.",
  },
];

export const CIVIS_METODOLOGIAS = [
  {
    title: "Aprendizaje experiencial",
    text: "Dinámicas, simulaciones y casos prácticos tomados del día a día laboral para que el contenido se viva, no solo se escuche.",
  },
  {
    title: "Diálogo y reflexión guiada",
    text: "Preguntas y conversaciones estructuradas que conectan cultura, convivencia y valores con situaciones reales del equipo.",
  },
  {
    title: "Trabajo colaborativo",
    text: "Ejercicios en grupo para practicar escucha, acuerdos y toma de decisiones antes de llevarlos al puesto de trabajo.",
  },
  {
    title: "Filosofía, cultura y valores aplicados",
    text: "Marcos de ética, propósito y responsabilidad inspirados en la tradición acrópolea, conectados con situaciones reales del equipo.",
  },
  {
    title: "Propuesta in company",
    text: "Duración, temas y formato se adaptan a la cultura, el tamaño y los objetivos de cada organización.",
  },
];

export type CivisCliente = {
  id: string;
  name: string;
  logo: string;
  logoAlt: string;
  /** Fondo oscuro cuando el logo es claro (p. ej. blanco). */
  logoOnDark?: boolean;
};

/** Instituciones y empresas con las que hemos trabajado. */
export const CIVIS_CLIENTES: CivisCliente[] = [
  {
    id: "barna",
    name: "Barna Management School",
    logo: "/brand/clientes/barna.webp",
    logoAlt: "Logo de Barna Management School",
    logoOnDark: true,
  },
  {
    id: "bonanza",
    name: "Bonanza Dominicana",
    logo: "/brand/clientes/bonanza.svg",
    logoAlt: "Logo de Bonanza Dominicana",
  },
  {
    id: "cruz-roja",
    name: "Cruz Roja Dominicana",
    logo: "/brand/clientes/cruz-roja.webp",
    logoAlt: "Logo de la Cruz Roja Dominicana",
  },
  {
    id: "policia-nacional",
    name: "Policía Nacional",
    logo: "/brand/clientes/policia-nacional.webp",
    logoAlt: "Logo de la Policía Nacional de la República Dominicana",
  },
  {
    id: "coe",
    name: "COE",
    logo: "/brand/clientes/coe.webp",
    logoAlt: "Logo del Centro de Operaciones de Emergencias",
  },
  {
    id: "pucmm",
    name: "PUCMM",
    logo: "/brand/clientes/pucmm.webp",
    logoAlt: "Logo de la Pontificia Universidad Católica Madre y Maestra",
  },
  {
    id: "indomet",
    name: "INDOMET",
    logo: "/brand/clientes/indomet.webp",
    logoAlt: "Logo del Instituto Dominicano de Meteorología",
  },
];

export type EntrenadorCivis = {
  name: string;
  role: string;
  bio: string;
  certifications: string[];
  photo?: string;
  /** Texto alternativo cuando la foto es simbólica, no un retrato. */
  photoAlt?: string;
  /** Encuadre con object-cover en la foto circular del perfil. */
  photoObjectPosition?: string;
  initials: string;
  /** Destacado en la pestaña Civis (vista principal). */
  featured?: boolean;
};

export const CIVIS_ENTRENADORES: EntrenadorCivis[] = [
  {
    name: "Gabriel Paredes",
    role: "Director Nacional · Facilitador Civis",
    bio: "Profesor de Filosofía, psicólogo clínico y máster en gestión de riesgos de desastres. Facilita talleres de liderazgo, ética y convivencia para equipos directivos e instituciones.",
    certifications: [
      "Profesor de Filosofía",
      "Psicólogo Clínico",
      "Experto en Filosofía de Oriente y Occidente",
      "Máster en Gestión de Riesgos de Desastres",
      "Facilitador de programas corporativos Civis",
    ],
    photo: "/img/quienes-somos/gabriel-paredes.webp",
    photoObjectPosition: "50% 28%",
    initials: "GP",
    featured: true,
  },
  {
    name: "Eva Rodríguez",
    role: "Profesora de Filosofía · Facilitadora Civis",
    bio: "Profesora de Filosofía y abogada experta en resolución de conflictos. Facilita talleres de convivencia, comunicación y manejo de conflictos para equipos directivos e instituciones, incluyendo programas con Barna Management School.",
    certifications: [
      "Profesora de Filosofía",
      "Abogada experta en resolución de conflictos",
      "Facilitación de talleres corporativos",
      "Comunicación y convivencia organizacional",
    ],
    photo: "/img/quienes-somos/eva-rodriguez.webp",
    photoObjectPosition: "72% 28%",
    initials: "ER",
    featured: true,
  },
  {
    name: "Daniel Salinas",
    role: "Profesor de Filosofía · Facilitador Civis",
    bio: "Profesor de Filosofía con décadas de experiencia docente en Nueva Acrópolis. Facilita talleres de claridad mental y equilibrio para equipos empresariales, integrando reflexión filosófica, artes marciales internas y herramientas de desarrollo personal aplicables al entorno laboral.",
    certifications: [
      "Profesor de Filosofía",
      "Experto en Filosofía de Oriente y Occidente",
      "Experto en Astrología Filosófica",
      "Profesor en Artes Marciales Orientales — Chi Kung y Tai Chi Chuan",
      "Instructor-capacitador en desarrollo empresarial",
    ],
    photo: "/img/quienes-somos/daniel-salinas.webp",
    photoObjectPosition: "50% 22%",
    initials: "DS",
  },
  {
    name: "Sally Polanco",
    role: "Facilitadora Civis",
    bio: "Facilitadora de talleres y charlas con enfoque en cultura, simbolismo y reflexión aplicada al desarrollo personal y organizacional.",
    certifications: [
      "Facilitación de programas formativos Civis",
      "Comunicación y exposición en entornos institucionales",
    ],
    initials: "SP",
  },
  {
    name: "Karla Mota",
    role: "Facilitadora Civis",
    bio: "Acompaña procesos de formación en convivencia, ética y trabajo en equipo para equipos de empresas e instituciones.",
    certifications: [
      "Facilitación de talleres corporativos",
      "Dinámicas grupales y convivencia organizacional",
    ],
    initials: "KM",
  },
  {
    name: "Rosa Urania",
    role: "Facilitadora Civis",
    bio: "Colabora en la facilitación de talleres de liderazgo, diálogo y valores en el ámbito empresarial e institucional.",
    certifications: [
      "Facilitación de programas Civis",
      "Formación en convivencia y responsabilidad compartida",
    ],
    initials: "RU",
  },
];

export const CIVIS_ENTRENADORES_DESTACADOS = CIVIS_ENTRENADORES.filter(
  (e) => e.featured,
);

export type CivisQuienesTabId = "civis" | "equipo" | "nueva-acropolis";

export type CivisSectionId =
  | "inicio"
  | "quienes-somos"
  | "equipo"
  | "clientes"
  | "talleres"
  | "salones"
  | "inscribete";

export type CivisNavItem = {
  href: string;
  label: string;
  id: CivisSectionId;
};

/** Rutas públicas Civis — cortas, con guiones, sin `#`. */
export const CIVIS_CLIENTES_ALIADOS_PATH = "/clientes-aliados";
export const CIVIS_NUESTRO_EQUIPO_PATH = "/nuestro-equipo";
export const CIVIS_QUIENES_SOMOS_PATH = "/quienes-somos";

/** Menú principal del header. */
export const CIVIS_HEADER_NAV: CivisNavItem[] = [
  { href: "/", label: "Inicio", id: "inicio" },
  { href: CIVIS_QUIENES_SOMOS_PATH, label: "Quiénes somos", id: "quienes-somos" },
  {
    href: CIVIS_CLIENTES_ALIADOS_PATH,
    label: "Clientes & Aliados",
    id: "clientes",
  },
  { href: "/talleres", label: "Talleres", id: "talleres" },
  { href: "/salones", label: "Salones", id: "salones" },
  { href: "/inscribete", label: "Inscríbete", id: "inscribete" },
];

/** Menú del footer — Talleres antes que Clientes & Aliados (grid 3+3). */
export const CIVIS_FOOTER_NAV: CivisNavItem[] = [
  { href: "/", label: "Inicio", id: "inicio" },
  { href: CIVIS_QUIENES_SOMOS_PATH, label: "Quiénes somos", id: "quienes-somos" },
  { href: "/talleres", label: "Talleres", id: "talleres" },
  {
    href: CIVIS_CLIENTES_ALIADOS_PATH,
    label: "Clientes & Aliados",
    id: "clientes",
  },
  { href: "/salones", label: "Salones", id: "salones" },
  { href: "/inscribete", label: "Inscríbete", id: "inscribete" },
];

/** @deprecated Usar CIVIS_HEADER_NAV */
export const CIVIS_NAV = CIVIS_HEADER_NAV;

export const CIVIS_FORM_HREF = "/inscribete";

/** @deprecated Usar CIVIS_NAV */
export const CIVIS_SECTIONS: {
  id: CivisSectionId;
  label: string;
}[] = CIVIS_NAV.map(({ id, label }) => ({ id, label }));

/** @deprecated Usar rutas limpias (`CIVIS_CLIENTES_ALIADOS_PATH`, etc.). */
export const CIVIS_QUIENES_TAB_HASH: Record<CivisQuienesTabId, string> = {
  civis: "quienes-somos",
  equipo: "equipo",
  "nueva-acropolis": "que-es-na",
};

/** Redirige hashes legacy de Quiénes somos a rutas limpias. */
export function civisLegacyHashPath(hash: string): string | null {
  const id = hash.replace("#", "").trim();
  if (id === "clientes") return CIVIS_CLIENTES_ALIADOS_PATH;
  if (id === "equipo") return CIVIS_NUESTRO_EQUIPO_PATH;
  return null;
}

export function quienesTabFromHash(hash: string): CivisQuienesTabId {
  const legacy = civisLegacyHashPath(hash);
  if (legacy === CIVIS_NUESTRO_EQUIPO_PATH) return "equipo";
  if (legacy === CIVIS_CLIENTES_ALIADOS_PATH) return "civis";
  const id = hash.replace("#", "");
  if (id === "equipo") return "equipo";
  if (id === "que-es-na" || id === "quienes-somos-nueva-acropolis") {
    return "nueva-acropolis";
  }
  return "civis";
}

export function quienesTabRoute(tab: CivisQuienesTabId): string {
  if (tab === "equipo") return CIVIS_NUESTRO_EQUIPO_PATH;
  if (tab === "nueva-acropolis") {
    return `${CIVIS_QUIENES_SOMOS_PATH}?tab=nueva-acropolis`;
  }
  return CIVIS_QUIENES_SOMOS_PATH;
}

export function quienesTabFromLocation(
  pathname: string,
  searchParams: { get(name: string): string | null } | null,
): CivisQuienesTabId {
  const path = pathname.replace(/\/$/, "") || "/";

  if (path === CIVIS_NUESTRO_EQUIPO_PATH) return "equipo";

  if (path === CIVIS_QUIENES_SOMOS_PATH) {
    if (searchParams?.get("tab") === "nueva-acropolis") {
      return "nueva-acropolis";
    }
    return "civis";
  }

  return "civis";
}

export function isQuienesSomosAreaPath(pathname: string): boolean {
  const path = pathname.replace(/\/$/, "") || "/";
  return path === CIVIS_QUIENES_SOMOS_PATH || path === CIVIS_NUESTRO_EQUIPO_PATH;
}

export function civisNavIsActive(
  pathname: string,
  _hash: string,
  item: CivisNavItem,
): boolean {
  const path = pathname.replace(/\/$/, "") || "/";

  if (item.id === "inicio") {
    return path === "/";
  }

  if (item.id === "clientes") {
    return path === CIVIS_CLIENTES_ALIADOS_PATH;
  }

  if (item.id === "quienes-somos") {
    return isQuienesSomosAreaPath(pathname);
  }

  const itemPath = item.href.replace(/\/$/, "") || "/";
  return path === itemPath || path.startsWith(`${itemPath}/`);
}

export function isQuienesSomosPath(pathname: string): boolean {
  return pathname.replace(/\/$/, "") === CIVIS_QUIENES_SOMOS_PATH;
}

export function isClientesAliadosPath(pathname: string): boolean {
  return pathname.replace(/\/$/, "") === CIVIS_CLIENTES_ALIADOS_PATH;
}

export function isNuestroEquipoPath(pathname: string): boolean {
  return pathname.replace(/\/$/, "") === CIVIS_NUESTRO_EQUIPO_PATH;
}

export const CIVIS_QUIENES_TAB_EVENT = "civis:quienes-tab";

export function dispatchQuienesTab(tab: CivisQuienesTabId) {
  if (typeof window === "undefined") return;
  window.location.assign(quienesTabRoute(tab));
}

/** Offset para scroll con header fijo (logo + menú). */
export const CIVIS_SCROLL_MT = "scroll-mt-[7rem] sm:scroll-mt-[7.25rem]";

/** Pestañas dentro de la página Quiénes somos. */
export const CIVIS_QUIENES_PAGE_TABS: {
  id: CivisQuienesTabId;
  label: string;
}[] = [
  { id: "civis", label: "Civis" },
  { id: "equipo", label: "Nuestro equipo" },
  { id: "nueva-acropolis", label: "Qué es Nueva Acrópolis" },
];

/** @deprecated Usar CIVIS_QUIENES_PAGE_TABS. */
export const CIVIS_QUIENES_TABS = CIVIS_QUIENES_PAGE_TABS;

/** Texto institucional de Nueva Acrópolis (contexto para visitantes de Civis). */
export const CIVIS_NA_INTRO = [
  "Nueva Acrópolis es una Escuela de Filosofía que promueve la cultura y practica el voluntariado. Propone un ideal de valores permanentes para contribuir a la evolución individual y colectiva.",
  "Desde hace más de 65 años, en más de 50 países, los programas de la Escuela de Filosofía han transformado la vida de miles de personas en todo el mundo.",
  "Civis es la propuesta de Nueva Acrópolis para el mundo empresarial e institucional: la misma raíz de cultura, valores y formación de personas que define a la Escuela.",
] as const;

export const CIVIS_NA_PRINCIPIOS = [
  {
    title: "Fraternidad",
    text: "Promover un ideal de fraternidad basado en el respeto a la dignidad humana, más allá de las diferencias culturales, sociales o religiosas.",
  },
  {
    title: "Conocimiento",
    text: "Fomentar el amor a la sabiduría a través del estudio comparado de filosofías, religiones, ciencias y artes.",
  },
  {
    title: "Desarrollo",
    text: "Desarrollar lo mejor del ser humano, promoviendo su realización como individuo y como miembro activo de la sociedad.",
  },
] as const;
