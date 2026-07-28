import { NA_INTRO_PARAGRAPHS, PERFIL_INSTITUCIONAL_OINADOM } from "@/lib/institucional-content";
import type {
  CmsPersonaBlock,
  CmsQuienesSomosPage,
  CmsRelacionesPage,
} from "@/lib/cms/types";

export const DEFAULT_QUIENES_SOMOS_PAGE: CmsQuienesSomosPage = {
  heroEyebrow: "Quiénes somos",
  heroTitle: "Qué es Nueva Acrópolis",
  heroLede: NA_INTRO_PARAGRAPHS[0],
  introParagraphs: [...NA_INTRO_PARAGRAPHS],
  presidenciaEyebrow: "Trayectoria",
  presidenciaTitle: "Fundador y presidencia internacional",
  presidenciaIntro:
    "La obra de Nueva Acrópolis ha sido guiada por su fundador y, tras él, por la continuidad de su presidencia internacional.",
  personas: [
    {
      id: "livraga",
      name: "Jorge Ángel Livraga Rizzi",
      role: "Fundador",
      period: "1930 – 1991",
      bio: "Filósofo e historiador. En 1957 fundó Nueva Acrópolis en Buenos Aires con un ideal de filosofía práctica, intercultural y al servicio del desarrollo del ser humano.",
      initials: "JL",
      photo: "/img/quienes-somos/livraga.webp",
    },
    {
      id: "delia",
      name: "Delia Steinberg Guzmán",
      role: "Presidenta de honor",
      period: "Directora internacional 1992 – 2020",
      bio: "Continuó y expandió la obra del fundador durante casi tres décadas. Pianista y filósofa, dedicó su vida a la enseñanza de la filosofía como forma de vida.",
      initials: "DS",
      photo: "/img/quienes-somos/delia-steinberg.webp",
    },
    {
      id: "carlos",
      name: "Carlos Adelantado Puchal",
      role: "Presidente internacional",
      period: "Desde 2020",
      bio: "Preside la Organización Internacional Nueva Acrópolis, impulsando su misión filosófica, cultural y de voluntariado en más de cincuenta países.",
      initials: "CA",
      photo: "/img/quienes-somos/carlos-adelantado.webp",
    },
  ],
  directorNacional: {
    id: "gabriel-paredes",
    name: "Gabriel Paredes",
    role: "Director Nacional",
    period: "República Dominicana",
    bio: "De nacionalidad chilena, es Psicólogo Clínico, Experto en Filosofía de Oriente y Occidente y Máster en Gestión de Riesgos de Desastres. Ha ocupado responsabilidades en sedes de Nueva Acrópolis en varios países y dedica su vida al voluntariado social, el desarrollo humano y la educación.",
    initials: "GP",
    photo: "/img/quienes-somos/gabriel-paredes.webp",
  },
  directoresAnteriores: [
    {
      id: "maria-eugenia",
      name: "María Eugenia Ríos Lamas",
      role: "Directora fundadora",
      period: "1998 – 2024",
      bio: "Fundadora de Nueva Acrópolis en República Dominicana. Impulsó su nacimiento en 1998 y la dirigió durante 27 años, sembrando la semilla de la filosofía, la cultura y el voluntariado en el país.",
      initials: "ME",
      photo: "/img/quienes-somos/maria-eugenia.webp",
    },
  ],
  oinaCifrasEyebrow: "OINA en cifras",
  oinaCifrasIntro:
    "Una red mundial con una misma Carta Fundacional. Nueva Acrópolis República Dominicana forma parte de NA Internacional.",
  oinaStats: [
    { id: "o1", value: "1957", label: "Fundación en Buenos Aires" },
    { id: "o2", value: "1998", label: "Fundación en República Dominicana" },
    { id: "o3", value: "+50 países", label: "Presencia internacional" },
    { id: "o4", value: "~500 sedes", label: "En todo el mundo" },
    { id: "o5", value: "Bruselas", label: "Sede internacional (OINA)" },
  ],
  perfilInstitucionalEyebrow: "Institucional",
  perfilInstitucionalTitle: PERFIL_INSTITUCIONAL_OINADOM.title,
  perfilInstitucionalLede: PERFIL_INSTITUCIONAL_OINADOM.lede,
  perfilInstitucionalNote: PERFIL_INSTITUCIONAL_OINADOM.note,
  perfilInstitucionalHref: PERFIL_INSTITUCIONAL_OINADOM.href,
  perfilInstitucionalButtonLabel: "Descargar perfil institucional (PDF)",
};

export const OINA_CIFRAS_SECTION_ID = "__oinaCifras__";
export const PERFIL_INSTITUCIONAL_SECTION_ID = "__perfilInstitucional__";

export const DEFAULT_RELACIONES_PAGE: CmsRelacionesPage = {
  heroEyebrow: "Institucional",
  heroTitle: "Relaciones institucionales",
  heroLede:
    "Nueva Acrópolis construye puentes sólidos de colaboración con otras instituciones para sus proyectos de voluntariado, cultura y acción social, humanitaria y medioambiental.",
  intro:
    "Como bien señala la Agenda 2030, es necesario unir esfuerzos, construir alianzas y trabajar juntos por el bien común. Cada año, las sedes de Nueva Acrópolis en el mundo desarrollan más de mil alianzas con el sector público y privado para llevar adelante sus proyectos locales de filosofía, cultura y voluntariado.",
  stats: [
    { id: "s1", value: "+1,000", label: "alianzas al año para proyectos en el mundo" },
    { id: "s2", value: "ECOSOC", label: "estatus consultivo ante Naciones Unidas (ONU)" },
    { id: "s3", value: "+15,000", label: "voluntarios en más de 60 países" },
  ],
  areasEyebrow: "Cómo colaboramos",
  areasTitle: "Áreas de colaboración",
  areasIntro:
    "Sumamos esfuerzos a nivel local y global porque sabemos que, trabajando unidos, podemos lograr más. Estas son algunas de las áreas en las que construimos alianzas.",
  areas: [
    {
      id: "medio-ambiente",
      title: "Medio ambiente",
      text: "Alianzas público-privadas para reforestación, restauración de ecosistemas y la celebración del Día Internacional de la Madre Tierra.",
    },
    {
      id: "cultura",
      title: "Cultura y filosofía",
      text: "Colaboraciones con museos, universidades e instituciones culturales para promover la filosofía, el arte y el Día Mundial de la Filosofía.",
    },
    {
      id: "etica",
      title: "Ética e instituciones sólidas",
      text: "Participación en iniciativas de ética pública y ciudadanía, en colaboración con organismos y entidades de gobierno.",
    },
    {
      id: "social",
      title: "Acción social y humanitaria",
      text: "Trabajo conjunto con ONG, fundaciones y empresas comprometidas con el bien común y la respuesta ante emergencias.",
    },
    {
      id: "internacional",
      title: "Organismos internacionales",
      text: "Participación en foros de Naciones Unidas y en la Unión de Asociaciones Internacionales (UIA) como entidad de alcance global.",
    },
    {
      id: "local",
      title: "Comunidad local",
      text: "Vínculos con instituciones, gobiernos municipales y organizaciones de la sociedad civil de República Dominicana.",
    },
  ],
  rdEyebrow: "En República Dominicana",
  rdTitle: "Alianzas que transforman nuestra comunidad",
  rdIntro:
    "En el país colaboramos con instituciones públicas, privadas y comunitarias para acercar la filosofía, la cultura y el voluntariado a más personas.",
  rdItems: [
    { id: "rd1", text: "Participación en la Feria de la Salud de la Fundación Ferries del Caribe." },
    {
      id: "rd2",
      text: "Formación en gestión de emergencias como punto focal de Esfera (Estándares Humanitarios) en República Dominicana.",
    },
    {
      id: "rd3",
      text: "Actividades culturales y ambientales junto a centros culturales y comunidades.",
    },
  ],
  ctaTitle: "¿Tu institución quiere colaborar?",
  ctaText:
    "Si representas a una institución, empresa u organización y deseas construir una alianza con nosotros, conversemos.",
  ctaButtonLabel: "Proponer una alianza",
  ctaWhatsappNumber: "",
  ctaWhatsappMessage:
    "Hola, represento a una institución y me gustaría explorar una alianza con Nueva Acrópolis RD.",
};

export function mergeQuienesSomosPage(
  overrides?: CmsQuienesSomosPage | null,
): CmsQuienesSomosPage {
  if (!overrides) return DEFAULT_QUIENES_SOMOS_PAGE;
  const personasById = new Map(
    (overrides.personas ?? []).map((p) => [p.id, p]),
  );
  return {
    ...DEFAULT_QUIENES_SOMOS_PAGE,
    ...overrides,
    introParagraphs:
      overrides.introParagraphs?.length
        ? overrides.introParagraphs
        : DEFAULT_QUIENES_SOMOS_PAGE.introParagraphs,
    personas: (DEFAULT_QUIENES_SOMOS_PAGE.personas ?? []).map((d) => {
      const o = personasById.get(d.id);
      return o ? { ...d, ...o } : d;
    }),
    directorNacional: DEFAULT_QUIENES_SOMOS_PAGE.directorNacional
      ? {
          ...DEFAULT_QUIENES_SOMOS_PAGE.directorNacional,
          ...(overrides.directorNacional ?? {}),
        }
      : overrides.directorNacional,
    directoresAnteriores: mergePersonas(
      DEFAULT_QUIENES_SOMOS_PAGE.directoresAnteriores ?? [],
      overrides.directoresAnteriores,
    ),
    oinaStats: mergeById(
      DEFAULT_QUIENES_SOMOS_PAGE.oinaStats ?? [],
      overrides.oinaStats,
      "id",
    ),
  };
}

export function mergeRelacionesPage(
  overrides?: CmsRelacionesPage | null,
): CmsRelacionesPage {
  if (!overrides) return DEFAULT_RELACIONES_PAGE;
  return {
    ...DEFAULT_RELACIONES_PAGE,
    ...overrides,
    stats: mergeById(DEFAULT_RELACIONES_PAGE.stats ?? [], overrides.stats, "id"),
    areas: mergeById(DEFAULT_RELACIONES_PAGE.areas ?? [], overrides.areas, "id"),
    rdItems: mergeById(
      DEFAULT_RELACIONES_PAGE.rdItems ?? [],
      overrides.rdItems,
      "id",
    ),
  };
}

function mergePersonas(
  defaults: CmsPersonaBlock[],
  overrides?: CmsPersonaBlock[],
) {
  if (!overrides?.length) return defaults;
  const byId = new Map(overrides.map((p) => [p.id, p]));
  return defaults.map((d) => ({ ...d, ...byId.get(d.id) }));
}

function mergeById<T extends { id: string }>(
  defaults: T[],
  overrides: T[] | undefined,
  key: keyof T,
) {
  if (!overrides?.length) return defaults;
  const byId = new Map(overrides.map((o) => [o.id, o]));
  return defaults.map((d) => ({ ...d, ...byId.get(d.id) }));
}
