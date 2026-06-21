import { ESFERA_PROXIMOS_ENTRENAMIENTOS } from "@/lib/esfera-agenda";
import { ESFERA_OINADOM_BROCHURE } from "@/lib/esfera-content";
import { ESFERA_ALIANZAS, ESFERA_AUDIENCIAS, ESFERA_AUDIENCIA_INTRO, ESFERA_BENEFICIOS, ESFERA_ESTANDARES, ESFERA_HOME, ESFERA_IMPACTO, ESFERA_MODALIDADES, ESFERA_MODALIDADES_NOTA, ESFERA_QUIENES_PANELS, ESFERA_QUIENES_TABS, ESFERA_TAGLINE, ESFERA_TAGLINE_SUPPORT, MANUAL_ESFERA_COVER } from "@/lib/esfera-content";
import type { EsferaImpactStat } from "@/lib/esfera-content";
import type {
  CmsEsferaAlianza,
  CmsEsferaAudiencia,
  CmsEsferaBeneficio,
  CmsEsferaGallerySlide,
  CmsEsferaHomePromo,
  CmsEsferaImpactStat,
  CmsEsferaModalidad,
  CmsEsferaPage,
  CmsEsferaPrincipio,
  CmsEsferaQuienesTab,
  CmsEsferaTrainingItem,
  CmsEsferaWorkshopLine,
} from "@/lib/cms/types";

export const DEFAULT_ESFERA_WORKSHOP_LINES: CmsEsferaWorkshopLine[] = [
  {
    id: "gestion",
    src: "/img/esfera/cards/gestion.webp",
    alt: "Equipo evaluando daños y necesidades en campo — enfoque EDAN",
    title: "Gestión operativa",
    text: "Ejercicios tipo EDAN (evaluación de daños y análisis de necesidades), sistemas de comando de incidentes y coordinación en campo.",
  },
  {
    id: "psicosocial",
    src: "/img/esfera/cards/psicosocial.webp",
    alt: "Acompañamiento psicológico y primeros auxilios emocionales en crisis",
    title: "Apoyo psicosocial",
    text: "Primeros auxilios psicológicos y acompañamiento humano en crisis, en coherencia con buenas prácticas humanitarias.",
  },
  {
    id: "comunidad",
    src: "/img/esfera/cards/comunidad.webp",
    alt: "Equipo comunitario de respuesta en entrenamiento conjunto",
    title: "Comunidad y voluntariado",
    text: "Equipos comunitarios de respuesta, simulacros y trabajo interinstitucional, con metodología alineada al Manual Esfera.",
  },
];

export const DEFAULT_ESFERA_ALIANZAS: CmsEsferaAlianza[] = ESFERA_ALIANZAS.map(
  (a) => ({ ...a }),
);

export const DEFAULT_ESFERA_IMPACT_STATS: CmsEsferaImpactStat[] = [
  {
    id: "participantes",
    label: "Participantes formados",
    kind: "count",
    countTo: 100,
    suffix: "+",
  },
  {
    id: "instituciones",
    label: "Instituciones representadas",
    kind: "count",
    countTo: 40,
  },
  {
    id: "calificacion",
    label: "Calificación promedio",
    kind: "display",
    display: "4.9/5",
  },
];

export const DEFAULT_ESFERA_BENEFICIOS: CmsEsferaBeneficio[] = [
  { id: "capacidad", ...ESFERA_BENEFICIOS[0] },
  { id: "estandares", ...ESFERA_BENEFICIOS[1] },
  { id: "responsabilidad", ...ESFERA_BENEFICIOS[2] },
  { id: "multiplicadores", ...ESFERA_BENEFICIOS[3] },
  { id: "instructores", ...ESFERA_BENEFICIOS[4] },
  { id: "red-nacional", ...ESFERA_BENEFICIOS[5] },
];

export const DEFAULT_ESFERA_AUDIENCIAS: CmsEsferaAudiencia[] = [
  { id: "sector-publico", ...ESFERA_AUDIENCIAS[0] },
  { id: "sector-privado", ...ESFERA_AUDIENCIAS[1] },
  { id: "sector-academico", ...ESFERA_AUDIENCIAS[2] },
  { id: "sector-civil", ...ESFERA_AUDIENCIAS[3] },
];

export const DEFAULT_ESFERA_MODALIDADES: CmsEsferaModalidad[] =
  ESFERA_MODALIDADES.map((m) => ({ ...m }));

export const DEFAULT_ESFERA_QUIENES_TABS: CmsEsferaQuienesTab[] =
  ESFERA_QUIENES_TABS.map(({ id, label }) => {
    const panel = ESFERA_QUIENES_PANELS[id];
    return {
      id,
      label,
      lede: panel.lede,
      imageSrc: panel.image.src,
      imageAlt: panel.image.alt,
      points: panel.points.map((point, i) => ({
        id: `${id}-point-${i}`,
        title: point.title,
        text: point.text,
      })),
    };
  });

export const DEFAULT_ESFERA_PRINCIPIOS: CmsEsferaPrincipio[] = [
  {
    id: "normas",
    src: "/img/esfera/cards/normas.webp",
    alt: "Equipo en formación revisando estándares humanitarios internacionales",
    title: "Normas mínimas compartidas",
    text: "El marco Esfera reúne estándares reconocidos internacionalmente para la calidad y la rendición de cuentas en respuestas humanitarias. Como punto focal en RD, lo traducimos en talleres prácticos para equipos e instituciones.",
  },
  {
    id: "personas",
    src: "/img/esfera/cards/personas.webp",
    alt: "Voluntarios en feria comunitaria con enfoque en las personas",
    title: "Personas al centro",
    text: "La atención humanitaria se piensa desde la dignidad, la participación de las comunidades afectadas y la coordinación entre actores: líneas que guían tanto el manual como nuestra propuesta formativa.",
  },
  {
    id: "crisis",
    src: "/img/esfera/cards/crisis.webp",
    alt: "Simulacro de respuesta ante emergencias con equipo de voluntarios",
    title: "Crisis y emergencias",
    text: "Preparación, simulacros y herramientas para situaciones de desastre: evaluación de daños, necesidades, primeros auxilios psicológicos y respuesta comunitaria, según calendario y convocatoria local.",
  },
];

export const DEFAULT_ESFERA_HOME_PROMO: CmsEsferaHomePromo = {
  homeEyebrow: "Punto Focal",
  homeTitle: ESFERA_TAGLINE,
  homeIntro: ESFERA_TAGLINE_SUPPORT,
  homeDetail: ESFERA_HOME.detail,
  homeImageSrc: ESFERA_HOME.image.src,
  homeImageAlt: ESFERA_HOME.image.alt,
  homeCtaLabel: "Conocer Esfera en RD",
};

export const DEFAULT_ESFERA_PAGE: CmsEsferaPage = {
  ...DEFAULT_ESFERA_HOME_PROMO,
  heroEyebrow: "Punto Focal · Crisis y emergencias",
  heroTitle: "Formación que transforma la respuesta humanitaria",
  heroLede:
    "Talleres y charlas para líderes institucionales sobre los Estándares Humanitarios Esfera, contextualizados a la realidad dominicana.",
  quienesEyebrow: "Esfera en República Dominicana",
  quienesTitle: "Punto focal · Estándares humanitarios",
  quienesTabs: DEFAULT_ESFERA_QUIENES_TABS,
  agendaEyebrow: "Agenda",
  agendaTitle: "Actividades y próximos entrenamientos",
  agendaIntro:
    "Líneas habituales de capacitación y práctica; fechas y sedes se confirman con el equipo en República Dominicana.",
  trainings: ESFERA_PROXIMOS_ENTRENAMIENTOS,
  workshopLinesTitle: "Líneas complementarias de formación",
  workshopLinesIntro:
    "Además de los talleres y charlas para instituciones, desarrollamos prácticas operativas y simulacros con voluntarios.",
  workshopLines: DEFAULT_ESFERA_WORKSHOP_LINES,
  alianzasEyebrow: "Alianzas institucionales",
  alianzasTitle: "Hemos trabajado con",
  alianzas: DEFAULT_ESFERA_ALIANZAS,
  impactEyebrow: "Impacto",
  impactTitle: ESFERA_IMPACTO.title,
  impactIntro: ESFERA_IMPACTO.intro,
  impactTestimonial: ESFERA_IMPACTO.testimonial,
  impactStats: DEFAULT_ESFERA_IMPACT_STATS,
  impactGalleryTitle: "Momentos de los talleres",
  impactGalleryEmptyText:
    "Galería fotográfica del ciclo 2025 — próximamente.",
  impactGallery: [],
  beneficiosEyebrow: "Por qué invertir en esta formación",
  beneficiosTitle: "Su organización, preparada para lo que importa",
  beneficiosIntro:
    "Invertir en formación humanitaria es demostrar compromiso real con su gente y con la sociedad.",
  beneficiosQuote:
    "«Juntos construimos una sociedad más preparada, solidaria y resiliente.»",
  beneficios: DEFAULT_ESFERA_BENEFICIOS,
  audienciaEyebrow: "A quién va dirigido",
  audienciaTitle: "Perfil de los participantes",
  audienciaIntro: ESFERA_AUDIENCIA_INTRO,
  audiencias: DEFAULT_ESFERA_AUDIENCIAS,
  modalidadesEyebrow: "Modalidades disponibles",
  modalidadesTitle: "Dos formas de acercar Esfera a su organización",
  modalidadesIntro: "Formación adaptada a sus necesidades institucionales.",
  modalidadesNota: ESFERA_MODALIDADES_NOTA,
  modalidades: DEFAULT_ESFERA_MODALIDADES,
  principios: DEFAULT_ESFERA_PRINCIPIOS,
  estandaresEyebrow: ESFERA_ESTANDARES.title,
  estandaresTitle: ESFERA_ESTANDARES.subtitle,
  estandaresPuntoFocal: ESFERA_ESTANDARES.puntoFocal,
  estandaresText: ESFERA_ESTANDARES.text,
  estandaresDetail: ESFERA_ESTANDARES.detail,
  estandaresSectores: [...ESFERA_ESTANDARES.sectores],
  estandaresManual: ESFERA_ESTANDARES.manual,
  estandaresQuote: ESFERA_ESTANDARES.quote,
  estandaresQuoteSource: ESFERA_ESTANDARES.quoteSource,
  manualCoverSrc: MANUAL_ESFERA_COVER.src,
  manualCoverAlt: MANUAL_ESFERA_COVER.alt,
  manualCaption: "El Manual Esfera · Edición 2018",
  manualSubtitle:
    "Carta Humanitaria, Principios de Protección y Norma Humanitaria Esencial.",
  esferaLogoSrc: "/brand/logo-esfera-red-global.svg",
  esferaLogoWhiteSrc: "/brand/logo-esfera-red-global.svg",
  esferaLogoAlt: "Estándares Humanitarios Esfera",
  brochureEyebrow: "Recursos",
  brochureTitle: ESFERA_OINADOM_BROCHURE.title,
  brochureLede: ESFERA_OINADOM_BROCHURE.lede,
  brochureNote: ESFERA_OINADOM_BROCHURE.note,
  brochureHref: ESFERA_OINADOM_BROCHURE.href,
  brochureButtonLabel: "Descargar brochure (PDF)",
};

export const ESFERA_WORKSHOP_SECTION_ID = "__esfera-workshop-section__";
export const ESFERA_ALIANZAS_SECTION_ID = "__esfera-alianzas-section__";
export const ESFERA_IMPACT_SECTION_ID = "__esfera-impact-section__";
export const ESFERA_IMPACT_GALLERY_SECTION_ID =
  "__esfera-impact-gallery-section__";
export const ESFERA_BENEFICIOS_SECTION_ID = "__esfera-beneficios-section__";
export const ESFERA_AUDIENCIA_SECTION_ID = "__esfera-audiencia-section__";
export const ESFERA_MODALIDADES_SECTION_ID = "__esfera-modalidades-section__";
export const ESFERA_ESTANDARES_SECTION_ID = "__esfera-estandares-section__";
export const ESFERA_ESTANDARES_SIDEBAR_ID = "__esfera-estandares-sidebar__";
export const ESFERA_QUIENES_SECTION_ID = "__esfera-quienes-section__";
export const ESFERA_HOME_PROMO_SECTION_ID = "__esfera-home-promo__";
export const ESFERA_BROCHURE_SECTION_ID = "__esfera-brochure-section__";

export function pickEsferaHomePromo(page: CmsEsferaPage): CmsEsferaHomePromo {
  return {
    homeEyebrow: page.homeEyebrow,
    homeTitle: page.homeTitle,
    homeIntro: page.homeIntro,
    homeDetail: page.homeDetail,
    homeImageSrc: page.homeImageSrc,
    homeImageAlt: page.homeImageAlt,
    homeCtaLabel: page.homeCtaLabel,
  };
}

export function mergeEsferaHomePromo(
  overrides?: CmsEsferaHomePromo | null,
): CmsEsferaHomePromo {
  return { ...DEFAULT_ESFERA_HOME_PROMO, ...overrides };
}

export function esferaQuienesTabSelectedId(id: string) {
  return `esfera-quienes-tab:${id}`;
}

export function esferaQuienesPointSelectedId(tabId: string, pointId: string) {
  return `esfera-quienes-point:${tabId}:${pointId}`;
}

export function parseEsferaQuienesTabSelectedId(selectedId: string | null) {
  if (!selectedId?.startsWith("esfera-quienes-tab:")) return null;
  return selectedId.slice("esfera-quienes-tab:".length);
}

export function parseEsferaQuienesPointSelectedId(selectedId: string | null) {
  if (!selectedId?.startsWith("esfera-quienes-point:")) return null;
  const rest = selectedId.slice("esfera-quienes-point:".length);
  const colon = rest.indexOf(":");
  if (colon < 0) return null;
  return {
    tabId: rest.slice(0, colon),
    pointId: rest.slice(colon + 1),
  };
}

export function esferaWorkshopSelectedId(id: string) {
  return `esfera-workshop:${id}`;
}

export function esferaAlianzaSelectedId(id: string) {
  return `esfera-alianza:${id}`;
}

export function esferaImpactStatSelectedId(id: string) {
  return `esfera-impact-stat:${id}`;
}

export function esferaImpactGallerySelectedId(id: string) {
  return `esfera-impact-gallery:${id}`;
}

export function esferaBeneficioSelectedId(id: string) {
  return `esfera-beneficio:${id}`;
}

export function esferaAudienciaSelectedId(id: string) {
  return `esfera-audiencia:${id}`;
}

export function esferaModalidadSelectedId(id: string) {
  return `esfera-modalidad:${id}`;
}

export function esferaPrincipioSelectedId(id: string) {
  return `esfera-principio:${id}`;
}

export function parseEsferaWorkshopSelectedId(selectedId: string | null) {
  if (!selectedId?.startsWith("esfera-workshop:")) return null;
  return selectedId.slice("esfera-workshop:".length);
}

export function parseEsferaAlianzaSelectedId(selectedId: string | null) {
  if (!selectedId?.startsWith("esfera-alianza:")) return null;
  return selectedId.slice("esfera-alianza:".length);
}

export function parseEsferaImpactStatSelectedId(selectedId: string | null) {
  if (!selectedId?.startsWith("esfera-impact-stat:")) return null;
  return selectedId.slice("esfera-impact-stat:".length);
}

export function parseEsferaImpactGallerySelectedId(selectedId: string | null) {
  if (!selectedId?.startsWith("esfera-impact-gallery:")) return null;
  return selectedId.slice("esfera-impact-gallery:".length);
}

export function parseEsferaBeneficioSelectedId(selectedId: string | null) {
  if (!selectedId?.startsWith("esfera-beneficio:")) return null;
  return selectedId.slice("esfera-beneficio:".length);
}

export function parseEsferaAudienciaSelectedId(selectedId: string | null) {
  if (!selectedId?.startsWith("esfera-audiencia:")) return null;
  return selectedId.slice("esfera-audiencia:".length);
}

export function parseEsferaModalidadSelectedId(selectedId: string | null) {
  if (!selectedId?.startsWith("esfera-modalidad:")) return null;
  return selectedId.slice("esfera-modalidad:".length);
}

export function parseEsferaPrincipioSelectedId(selectedId: string | null) {
  if (!selectedId?.startsWith("esfera-principio:")) return null;
  return selectedId.slice("esfera-principio:".length);
}

export function newEsferaTrainingId() {
  return `esfera-${Date.now().toString(36)}`;
}

export function newEsferaWorkshopId() {
  return `esfera-linea-${Date.now().toString(36)}`;
}

export function newEsferaAlianzaId() {
  return `esfera-alianza-${Date.now().toString(36)}`;
}

export function newEsferaGallerySlideId() {
  return `esfera-galeria-${Date.now().toString(36)}`;
}

export function newEsferaBeneficioId() {
  return `esfera-beneficio-${Date.now().toString(36)}`;
}

export function newEsferaAudienciaId() {
  return `esfera-audiencia-${Date.now().toString(36)}`;
}

export function newEsferaModalidadId() {
  return `esfera-modalidad-${Date.now().toString(36)}`;
}

export function newEsferaPrincipioId() {
  return `esfera-principio-${Date.now().toString(36)}`;
}

export function cmsImpactStatToDisplay(stat: CmsEsferaImpactStat): EsferaImpactStat {
  if (stat.kind === "display") {
    return { label: stat.label, display: stat.display ?? "" };
  }
  return {
    label: stat.label,
    countTo: stat.countTo ?? 0,
    suffix: stat.suffix,
  };
}

function mergeById<T extends { id: string }>(
  defaults: T[],
  overrides?: T[],
): T[] {
  if (!overrides?.length) return defaults;
  const byId = new Map(overrides.map((item) => [item.id, item]));
  const merged = defaults.map((d) => {
    const o = byId.get(d.id);
    return o ? { ...d, ...o } : d;
  });
  for (const item of overrides) {
    if (!defaults.some((d) => d.id === item.id)) merged.push(item);
  }
  return merged;
}

function mergeQuienesTabs(
  defaults: CmsEsferaQuienesTab[],
  overrides?: CmsEsferaQuienesTab[],
): CmsEsferaQuienesTab[] {
  const tabs = mergeById(defaults, overrides);
  return tabs.map((tab) => {
    const def = defaults.find((d) => d.id === tab.id);
    const ov = overrides?.find((o) => o.id === tab.id);
    return {
      ...tab,
      points: mergeById(def?.points ?? [], ov?.points),
    };
  });
}

export function mergeEsferaPage(
  overrides?: CmsEsferaPage | null,
): CmsEsferaPage {
  if (!overrides) return DEFAULT_ESFERA_PAGE;
  return {
    ...DEFAULT_ESFERA_PAGE,
    ...overrides,
    trainings: mergeById(
      DEFAULT_ESFERA_PAGE.trainings ?? [],
      overrides.trainings,
    ),
    workshopLines: mergeById(
      DEFAULT_ESFERA_PAGE.workshopLines ?? [],
      overrides.workshopLines,
    ),
    alianzas: mergeById(DEFAULT_ESFERA_PAGE.alianzas ?? [], overrides.alianzas),
    impactStats: mergeById(
      DEFAULT_ESFERA_PAGE.impactStats ?? [],
      overrides.impactStats,
    ),
    impactGallery: overrides.impactGallery ?? DEFAULT_ESFERA_PAGE.impactGallery,
    beneficios: mergeById(
      DEFAULT_ESFERA_PAGE.beneficios ?? [],
      overrides.beneficios,
    ),
    audiencias: mergeById(
      DEFAULT_ESFERA_PAGE.audiencias ?? [],
      overrides.audiencias,
    ),
    modalidades: mergeById(
      DEFAULT_ESFERA_PAGE.modalidades ?? [],
      overrides.modalidades,
    ),
    principios: mergeById(
      DEFAULT_ESFERA_PAGE.principios ?? [],
      overrides.principios,
    ),
    quienesTabs: mergeQuienesTabs(
      DEFAULT_ESFERA_PAGE.quienesTabs ?? [],
      overrides.quienesTabs,
    ),
  };
}

export function getEsferaTrainings(
  doc?: { sections?: { esferaPage?: CmsEsferaPage } } | null,
): CmsEsferaTrainingItem[] {
  return mergeEsferaPage(doc?.sections?.esferaPage).trainings ?? [];
}

export function getEsferaPage(
  doc?: { sections?: { esferaPage?: CmsEsferaPage } } | null,
): CmsEsferaPage {
  return mergeEsferaPage(doc?.sections?.esferaPage);
}
