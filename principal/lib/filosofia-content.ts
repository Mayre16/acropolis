import type {
  CmsFilosofiaCard,
  CmsFilosofiaFaqItem,
  CmsFilosofiaLabeledValue,
  CmsFilosofiaPage,
} from "@/lib/cms/types";
import { VENUE_LOCATIONS } from "@/lib/locations";

export const FILOSOFIA_PROGRAMA_DEFAULTS = {
  eyebrow: "Programa de estudios",
  title: "Filosofía como modelo de vida",
  paragraphs: [
    "La Escuela de Filosofía a la manera clásica de Nueva Acrópolis se inspira en la tradición platónica para promover la filosofía como modelo de vida, apoyada en el conocimiento y el desarrollo de las cualidades de cada ser humano.",
    "Desarrollamos un programa común para todos los países, impartido en niveles sucesivos: una actualización de los conocimientos tradicionales de Oriente y Occidente que relaciona ciencias, artes y filosofías con propuestas prácticas para canalizar el potencial humano de manera eficaz.",
    "El programa se inicia con un curso introductorio que puede continuarse con niveles y materias avanzadas.",
  ],
  imageSrc: "/img/filosofia/diplomado/diplomado-02.webp",
  imageAlt: "Clase de filosofía — estudio comparado de Oriente y Occidente",
} as const;

export const FILOSOFIA_CURSO_DEFAULTS = {
  eyebrow: "Curso introductorio",
  subtitle: "Filosofía comparada de Oriente y Occidente",
  title: "Diplomado de Filosofía para la Vida",
  lede: "¿Quién eres en realidad? Acompáñanos en un viaje hacia la autoconciencia y descubre las fortalezas de tu mundo interior a través de la filosofía comparada de Oriente y Occidente.",
  heroImageSrc: "/img/filosofia/modulos/etica.webp",
  heroImageAlt: "Filosofía para la vida — autoconocimiento y sabiduría clásica",
  aprenderasTitle: "En este curso aprenderás a",
  aprenderas: [
    "Conocerte más para desarrollar tus fortalezas y ser mejor persona.",
    "Encontrar respuestas a tus interrogantes sobre la vida.",
    "Descubrir el sentido profundo de la existencia.",
    "Definir tus valores, para dejar una huella en el mundo.",
    "Comprender a los demás y el porqué de las circunstancias que vives.",
    "Tomar mejores decisiones, con la sabiduría de grandes filósofos y civilizaciones.",
  ],
  cursoInfoTitle: "Información del curso",
  cursoInfoLede:
    "A través de las enseñanzas de grandes pensadores y civilizaciones, exploramos la filosofía de manera práctica y vivencial para convertirnos en mejores personas y tomar decisiones acertadas.",
  cursoInfo: [
    { label: "Duración", value: "5 meses" },
    { label: "Modalidad", value: "Presencial en tu sede más cercana" },
    { label: "Frecuencia", value: "Una sesión por semana" },
  ] satisfies CmsFilosofiaLabeledValue[],
  incluyeLabel: "Incluye",
  incluye: [
    "Prácticas y dinámicas en clase",
    "Estudio comparado de Oriente y Occidente",
    "Certificado de participación",
  ],
  modulosTitle: "Tres módulos del curso introductorio",
} as const;

export const FILOSOFIA_MODULOS_DEFAULTS: CmsFilosofiaCard[] = [
  {
    id: "mod-01",
    badge: "01",
    src: "/img/filosofia/modulos/etica.webp",
    alt: "Busto clásico de un filósofo, símbolo del autoconocimiento",
    title: "Conocerse a uno mismo",
    text: "La filosofía como camino para conocerse, fortalecer el carácter y vivir según valores. Herramientas de Oriente y Occidente para ser mejores personas.",
  },
  {
    id: "mod-02",
    badge: "02",
    src: "/img/filosofia/modulos/convivencia.webp",
    alt: "Grupo diverso de personas conversando en círculo",
    title: "Mejorar la convivencia",
    text: "El ser humano no vive aislado. Exploramos la amistad, la justicia y la convivencia para construir relaciones y comunidades más humanas.",
  },
  {
    id: "mod-03",
    badge: "03",
    src: "/img/filosofia/modulos/historia.webp",
    alt: "Templo griego clásico al amanecer",
    title: "Construir nuestro futuro",
    text: "Comprender las grandes civilizaciones y sus enseñanzas para mirar el presente con perspectiva y construir, con sentido, el futuro.",
  },
];

export const FILOSOFIA_TEMARIO_SECTION = {
  eyebrow: "Temario completo",
  title: "Qué estudiaremos",
  intro:
    "El recorrido del curso introductorio, sesión a sesión, integrando las grandes tradiciones de Oriente y Occidente con su aplicación práctica.",
} as const;

export const FILOSOFIA_TEMARIO_DEFAULTS: CmsFilosofiaCard[] = [
  {
    id: "tem-01",
    src: "/img/filosofia/temario/temario-01.webp",
    alt: "Persona en contemplación junto a una ventana al amanecer con un libro abierto",
    title: "Filosofía y conocimiento de uno mismo",
    text: "El ser humano según las grandes tradiciones; herramientas para conocernos y mejorar.",
  },
  {
    id: "tem-02",
    src: "/img/filosofia/temario/temario-02.webp",
    alt: "Templo de la India al amanecer junto a un estanque de lotos y una figura en meditación",
    title: "Filosofía de la India",
    text: "Las enseñanzas del Bhagavad Gita y el yoga como camino interior y deber bien hecho.",
  },
  {
    id: "tem-03",
    src: "/img/filosofia/temario/temario-03.webp",
    alt: "Pagoda tradicional sobre montañas brumosas, paisaje del Lejano Oriente",
    title: "Filosofía del Lejano Oriente",
    text: "China y el Tíbet: Confucio, el Tao y la búsqueda de la armonía y la virtud.",
  },
  {
    id: "tem-04",
    src: "/img/filosofia/temario/temario-04.webp",
    alt: "Diálogo entre dos filósofos junto a columnas griegas al atardecer",
    title: "Filosofía de Grecia: Sócrates y Platón",
    text: "El «conócete a ti mismo», el diálogo y el mundo de las ideas como guía de vida.",
  },
  {
    id: "tem-05",
    src: "/img/filosofia/temario/temario-05.webp",
    alt: "Estatua de mármol romana junto a columnas clásicas con luz cálida",
    title: "Roma y el estoicismo",
    text: "Séneca, Epicteto y Marco Aurelio: el arte de vivir con serenidad y virtud.",
  },
  {
    id: "tem-06",
    src: "/img/filosofia/temario/temario-06.webp",
    alt: "Caminante ante una bifurcación de senderos al amanecer, símbolo de la elección ética",
    title: "Ética y acción",
    text: "Los valores en la práctica: cómo llevar las ideas a decisiones cotidianas.",
  },
  {
    id: "tem-07",
    src: "/img/filosofia/temario/temario-07.webp",
    alt: "Grupo diverso de personas conversando en un patio soleado, sentido de comunidad",
    title: "Sociopolítica y convivencia",
    text: "El individuo y la comunidad: una mirada filosófica a la vida en sociedad.",
  },
  {
    id: "tem-08",
    src: "/img/filosofia/temario/temario-08.webp",
    alt: "Ruinas antiguas integradas en la naturaleza ante un amplio paisaje al atardecer",
    title: "Historia, cultura y filosofía de la naturaleza",
    text: "Una visión del ser humano, el cosmos y la cultura como un todo con sentido.",
  },
];

export const FILOSOFIA_AVANZADOS_DEFAULTS = {
  eyebrow: "Tras el curso introductorio",
  title: "Cursos avanzados",
  paragraphs: [
    "El programa continúa en niveles sucesivos y materias que profundizan el estudio comparado de filosofías, ciencias, artes y tradiciones de sabiduría — la senda hacia un conocimiento integral y una visión global del ser humano y del universo.",
    "Se imparten de forma escalonada, con ritmo compatible con el trabajo y otros estudios. Si deseas profundizar lo aprendido en el primer nivel, puedes continuar en calidad de miembro de la Escuela de Filosofía.",
  ],
  materias: [
    "Psicología",
    "Sabiduría de Oriente y Occidente",
    "Simbología de las civilizaciones",
    "Filosofía moral y ética aplicada",
    "Sociopolítica",
    "Oratoria",
    "Historia de la Filosofía",
    "Historia de la Filosofía moderna",
    "Historia de la Filosofía contemporánea",
    "Historia de la Filosofía oriental",
    "Antropogénesis y cosmogénesis",
    "Astrología",
    "Filosofía de la ciencia",
    "Estética metafísica",
  ],
  imageSrc: "/img/filosofia/diplomado/diplomado-03.webp",
  imageAlt: "Programa avanzado — profundización en filosofía comparada",
  imageCaption: "Materias avanzadas en sedes de todo el mundo",
} as const;

export type FilosofiaSedeEntry = {
  id: string;
  label: string;
  address: string;
  mapsQuery: string;
};

const FILOSOFIA_SEDE_VENUES = [
  { venueId: "sede-naco", label: "Naco" },
  { venueId: "sede-los-prados", label: "Los Prados" },
  { venueId: "sede-santiago", label: "Santiago" },
  { venueId: "punto-cultural-roberto-pastoriza", label: "Izbira" },
] as const;

/** Sedes del diplomado con dirección y consulta de Google Maps desde `locations.ts`. */
export function filosofiaSedeEntries(): FilosofiaSedeEntry[] {
  return FILOSOFIA_SEDE_VENUES.flatMap(({ venueId, label }) => {
    const venue = VENUE_LOCATIONS.find((v) => v.id === venueId);
    if (!venue) return [];

    const address =
      venueId === "sede-naco" || venueId === "punto-cultural-roberto-pastoriza"
        ? `${venue.address}, ${venue.zone}`
        : venue.address;

    return [{ id: venueId, label, address, mapsQuery: venue.mapsQuery }];
  });
}

export const FILOSOFIA_ES_PARA_TI_DEFAULTS = {
  title: "¿Es para ti?",
  items: [
    {
      id: "quien",
      icon: "users",
      title: "¿Quién puede venir?",
      text: "Personas mayores de 18 años. No se requiere formación previa en filosofía.",
    },
    {
      id: "saber",
      icon: "check",
      title: "¿Hace falta haber estudiado filosofía?",
      text: "No. Basta con curiosidad, disposición al diálogo e interés por profundizar en las grandes preguntas de la vida.",
    },
    {
      id: "tiempo",
      icon: "clock",
      title: "¿Cuánto tiempo?",
      text: "5 meses, una sesión presencial a la semana.",
    },
    {
      id: "sedes",
      icon: "map",
      title: "Sedes",
      text: "Naco — Calle Cub Scouts No. 6, 3er nivel, Ens. Naco\nLos Prados — Eugenio Deschamps No. 81\nSantiago — Dirección próximamente\nIzbira — Roberto Pastoriza No. 709, Evaristo Morales",
    },
    {
      id: "reconoces",
      icon: "book",
      title: "¿Te reconoces?",
      text: "Si buscas comprender con mayor profundidad la vida, el ser humano y las tradiciones de sabiduría de Oriente y Occidente, este programa puede ser para ti.",
    },
  ] satisfies CmsFilosofiaFaqItem[],
} as const;

export const FILOSOFIA_CTA_DEFAULTS = {
  title: "Información e inscripción",
  text: "Escríbenos por WhatsApp para conocer fechas, horarios y el proceso de inscripción.",
  whatsappNumber: "",
  whatsappMessage:
    "Hola, me interesa el Diplomado de Filosofía para la Vida. ¿Me dan información de fechas e inscripción?",
  buttonLabel: "Quiero inscribirme",
  imageSrc: "/img/filosofia/diplomado/diplomado-01.webp",
  imageAlt: "Diplomado de Filosofía para la Vida — sabiduría de Oriente y Occidente",
} as const;

export const DEFAULT_FILOSOFIA_PAGE_BODY: Partial<CmsFilosofiaPage> = {
  programaEyebrow: FILOSOFIA_PROGRAMA_DEFAULTS.eyebrow,
  programaTitle: FILOSOFIA_PROGRAMA_DEFAULTS.title,
  programaParagraphs: [...FILOSOFIA_PROGRAMA_DEFAULTS.paragraphs],
  programaImageSrc: FILOSOFIA_PROGRAMA_DEFAULTS.imageSrc,
  programaImageAlt: FILOSOFIA_PROGRAMA_DEFAULTS.imageAlt,
  cursoEyebrow: FILOSOFIA_CURSO_DEFAULTS.eyebrow,
  cursoSubtitle: FILOSOFIA_CURSO_DEFAULTS.subtitle,
  cursoTitle: FILOSOFIA_CURSO_DEFAULTS.title,
  cursoLede: FILOSOFIA_CURSO_DEFAULTS.lede,
  cursoHeroImageSrc: FILOSOFIA_CURSO_DEFAULTS.heroImageSrc,
  cursoHeroImageAlt: FILOSOFIA_CURSO_DEFAULTS.heroImageAlt,
  aprenderasTitle: FILOSOFIA_CURSO_DEFAULTS.aprenderasTitle,
  aprenderas: [...FILOSOFIA_CURSO_DEFAULTS.aprenderas],
  cursoInfoTitle: FILOSOFIA_CURSO_DEFAULTS.cursoInfoTitle,
  cursoInfoLede: FILOSOFIA_CURSO_DEFAULTS.cursoInfoLede,
  cursoInfo: FILOSOFIA_CURSO_DEFAULTS.cursoInfo.map((x) => ({ ...x })),
  incluyeLabel: FILOSOFIA_CURSO_DEFAULTS.incluyeLabel,
  incluye: [...FILOSOFIA_CURSO_DEFAULTS.incluye],
  modulosTitle: FILOSOFIA_CURSO_DEFAULTS.modulosTitle,
  modulos: FILOSOFIA_MODULOS_DEFAULTS.map((x) => ({ ...x })),
  temarioEyebrow: FILOSOFIA_TEMARIO_SECTION.eyebrow,
  temarioTitle: FILOSOFIA_TEMARIO_SECTION.title,
  temarioIntro: FILOSOFIA_TEMARIO_SECTION.intro,
  temario: FILOSOFIA_TEMARIO_DEFAULTS.map((x) => ({ ...x })),
  avanzadosEyebrow: FILOSOFIA_AVANZADOS_DEFAULTS.eyebrow,
  avanzadosTitle: FILOSOFIA_AVANZADOS_DEFAULTS.title,
  avanzadosParagraphs: [...FILOSOFIA_AVANZADOS_DEFAULTS.paragraphs],
  avanzadosMaterias: [...FILOSOFIA_AVANZADOS_DEFAULTS.materias],
  avanzadosImageSrc: FILOSOFIA_AVANZADOS_DEFAULTS.imageSrc,
  avanzadosImageAlt: FILOSOFIA_AVANZADOS_DEFAULTS.imageAlt,
  avanzadosImageCaption: FILOSOFIA_AVANZADOS_DEFAULTS.imageCaption,
  esParaTiTitle: FILOSOFIA_ES_PARA_TI_DEFAULTS.title,
  esParaTi: FILOSOFIA_ES_PARA_TI_DEFAULTS.items.map((x) => ({ ...x })),
  ctaTitle: FILOSOFIA_CTA_DEFAULTS.title,
  ctaText: FILOSOFIA_CTA_DEFAULTS.text,
  ctaWhatsappMessage: FILOSOFIA_CTA_DEFAULTS.whatsappMessage,
  ctaButtonLabel: FILOSOFIA_CTA_DEFAULTS.buttonLabel,
  ctaImageSrc: FILOSOFIA_CTA_DEFAULTS.imageSrc,
  ctaImageAlt: FILOSOFIA_CTA_DEFAULTS.imageAlt,
};
