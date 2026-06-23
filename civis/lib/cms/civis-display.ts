import type { CivisCliente, EntrenadorCivis } from "@/lib/civis-content";
import {
  CIVIS_INTRO,
  CIVIS_METODOLOGIAS,
  CIVIS_NA_INTRO,
  CIVIS_NA_PRINCIPIOS,
  CIVIS_OBJETIVOS,
  CIVIS_PRINCIPIOS,
  CIVIS_PROPOSITO,
} from "@/lib/civis-content";
import { PRINCIPAL_SITE_URL } from "@/lib/site-config";
import type { TallerCivis } from "@/lib/talleres";
import type {
  ProximaActividad,
  TallerRealizado,
} from "@/lib/talleres-actividades";
import {
  itemsFromCivisHero,
  type CmsHeroCarouselItem,
} from "@/lib/cms/hero-carousel-edit";
import { CIVIS_HERO_IMAGES } from "@/lib/hero-images";
import type {
  CmsCivisCliente,
  CmsCivisEntrenador,
  CmsCivisHomePage,
  CmsCivisHomePrincipios,
  CmsCivisProximaActividad,
  CmsCivisQuienesCivis,
  CmsCivisQuienesNa,
  CmsCivisQuienesPage,
  CmsCivisSectionCopy,
  CmsCivisTaller,
  CmsCivisTallerRealizado,
  CmsCivisTalleresPage,
  CmsDocument,
} from "@/lib/cms/types";

export function entrenadorSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function overlaySection(
  fallback: CmsCivisSectionCopy,
  cms?: CmsCivisSectionCopy,
): CmsCivisSectionCopy {
  if (!cms) return fallback;
  return {
    eyebrow: cms.eyebrow ?? fallback.eyebrow,
    title: cms.title ?? fallback.title,
    lede: cms.lede ?? fallback.lede,
  };
}

export function mergeOferta(
  code: TallerCivis[],
  cms?: CmsCivisTaller[],
): TallerCivis[] {
  if (cms?.length) {
    const codeMap = new Map(code.map((t) => [t.id, t]));
    return cms.map((o) => cmsToTaller(o, codeMap.get(o.id)));
  }
  return code;
}

function cmsToTaller(o: CmsCivisTaller, fallback?: TallerCivis): TallerCivis {
  return {
    id: o.id,
    title: o.title ?? fallback?.title ?? "Nueva línea formativa",
    intro: o.intro ?? fallback?.intro ?? "",
    topics: o.topics ?? fallback?.topics ?? [],
    duration: o.duration ?? fallback?.duration ?? "4 horas",
    durationLabel: o.durationLabel ?? fallback?.durationLabel ?? "4 horas",
    durationHours: o.durationHours ?? fallback?.durationHours ?? 4,
    format: o.format ?? fallback?.format ?? "Presencial",
    maxParticipants: o.maxParticipants ?? fallback?.maxParticipants ?? 25,
    image: {
      src: o.image?.src ?? fallback?.image.src ?? "",
      alt: o.image?.alt ?? fallback?.image.alt ?? "",
      objectPosition: o.image?.objectPosition ?? fallback?.image.objectPosition,
    },
  };
}

export function codeToCmsOferta(code: TallerCivis[]): CmsCivisTaller[] {
  return code.map((t) => ({
    id: t.id,
    title: t.title,
    intro: t.intro,
    topics: [...t.topics],
    duration: t.duration,
    durationLabel: t.durationLabel,
    durationHours: t.durationHours,
    format: t.format,
    maxParticipants: t.maxParticipants,
    image: { ...t.image },
  }));
}

export function codeToCmsEntrenador(e: EntrenadorCivis): CmsCivisEntrenador {
  return {
    id: entrenadorSlug(e.name),
    name: e.name,
    role: e.role,
    bio: e.bio,
    certifications: [...e.certifications],
    photo: e.photo,
    photoAlt: e.photoAlt,
    photoObjectPosition: e.photoObjectPosition,
    initials: e.initials,
    featured: e.featured,
  };
}

export function cmsToEntrenador(
  cms: CmsCivisEntrenador,
  fallback?: EntrenadorCivis,
): EntrenadorCivis & { id: string } {
  return {
    id: cms.id,
    name: cms.name ?? fallback?.name ?? "",
    role: cms.role ?? fallback?.role ?? "",
    bio: cms.bio ?? fallback?.bio ?? "",
    certifications: cms.certifications ?? fallback?.certifications ?? [],
    photo: cms.photo ?? fallback?.photo,
    photoAlt: cms.photoAlt ?? fallback?.photoAlt,
    photoObjectPosition:
      cms.photoObjectPosition ?? fallback?.photoObjectPosition,
    initials: cms.initials ?? fallback?.initials ?? "?",
    featured: cms.featured ?? fallback?.featured,
  };
}

export function mergeEntrenadores(
  code: EntrenadorCivis[],
  cms?: CmsCivisEntrenador[],
): (EntrenadorCivis & { id: string })[] {
  if (cms?.length) {
    const codeMap = new Map(code.map((e) => [entrenadorSlug(e.name), e]));
    return cms.map((o) => cmsToEntrenador(o, codeMap.get(o.id)));
  }
  return code.map((e) => ({ ...e, id: entrenadorSlug(e.name) }));
}

export function codeToCmsTallerRealizado(
  items: TallerRealizado[],
): CmsCivisTallerRealizado[] {
  return items.map((t, i) => ({
    id: `code-${i}`,
    title: t.title,
    client: t.client,
    date: t.date,
    place: t.place,
    lineaId: t.lineaId,
    image: { ...t.image },
  }));
}

export function cmsToTallerRealizado(t: CmsCivisTallerRealizado): TallerRealizado {
  return {
    title: t.title,
    client: t.client,
    date: t.date,
    place: t.place,
    lineaId: t.lineaId as TallerRealizado["lineaId"],
    image: {
      src: t.image.src,
      alt: t.image.alt,
      objectPosition: t.image.objectPosition,
    },
  };
}

export function mergeTalleresRealizadosList(
  code: TallerRealizado[],
  cms?: CmsCivisTallerRealizado[],
): TallerRealizado[] {
  if (cms?.length) return cms.map(cmsToTallerRealizado);
  return code;
}

export function codeToCmsProxima(a: ProximaActividad): CmsCivisProximaActividad {
  return {
    id: a.id,
    title: a.title,
    date: a.date,
    startsAt: a.startsAt,
    time: a.time,
    sede: a.sede,
    format: a.format,
    excerpt: a.excerpt,
    lineaId: a.lineaId,
    image: { ...a.image },
    open: a.open,
  };
}

export function cmsToProxima(a: CmsCivisProximaActividad): ProximaActividad {
  return {
    id: a.id,
    title: a.title,
    date: a.date,
    startsAt: a.startsAt,
    time: a.time,
    sede: a.sede,
    format: a.format,
    excerpt: a.excerpt,
    lineaId: a.lineaId as ProximaActividad["lineaId"],
    image: {
      src: a.image.src,
      alt: a.image.alt,
      objectPosition: a.image.objectPosition,
    },
    open: a.open,
  };
}

export function mergeProximasList(
  code: ProximaActividad[],
  cms?: CmsCivisProximaActividad[],
): ProximaActividad[] {
  if (cms?.length) return cms.map(cmsToProxima);
  return code;
}

export function codeToCmsCliente(c: CivisCliente): CmsCivisCliente {
  return {
    id: c.id,
    name: c.name,
    logo: c.logo,
    logoAlt: c.logoAlt,
    logoOnDark: c.logoOnDark,
  };
}

export function cmsToCliente(c: CmsCivisCliente): CivisCliente {
  return {
    id: c.id,
    name: c.name ?? "",
    logo: c.logo ?? "",
    logoAlt: c.logoAlt ?? c.name ?? "",
    logoOnDark: c.logoOnDark,
  };
}

export function mergeClientes(
  code: CivisCliente[],
  cms?: CmsCivisCliente[],
): CivisCliente[] {
  if (cms?.length) return cms.map(cmsToCliente);
  return code;
}

export const DEFAULT_HOME_PRINCIPIOS: CmsCivisHomePrincipios = {
  eyebrow: "Civis",
  title: "Nuestros principios",
  items: CIVIS_PRINCIPIOS.map((p) => ({ title: p.title, text: p.text })),
  footerLede:
    "Conoce nuestra propuesta, metodología, clientes y el equipo que facilita los talleres.",
  footerLinkLabel: "Ver quiénes somos",
  footerLinkHref: "/quienes-somos",
};

export const DEFAULT_HOME_PAGE: CmsCivisHomePage = {
  oferta: {
    eyebrow: "Oferta formativa",
    title: "Nuestra oferta formativa",
    lede: "Cuatro líneas de talleres presenciales para empresas e instituciones. Cada propuesta se adapta in company a su organización.",
  },
  actividades: {
    eyebrow: "Experiencia",
    title: "Fotos de nuestras actividades",
    lede: "Talleres corporativos recientes con empresas e instituciones en República Dominicana.",
  },
  entrenadores: {
    eyebrow: "Equipo",
    title: "Entrenadores",
    lede: "Facilitadores con experiencia en liderazgo, convivencia y talleres corporativos para empresas e instituciones.",
  },
  principios: DEFAULT_HOME_PRINCIPIOS,
};

export const DEFAULT_TALLERES_PAGE: CmsCivisTalleresPage = {
  oferta: {
    eyebrow: "Oferta formativa",
    title: "Cuatro líneas de talleres para empresas y equipos",
    lede: "Talleres presenciales con duración y cupo de referencia. La propuesta final se adapta a los objetivos de su organización.",
  },
  agenda: {
    eyebrow: "Agenda",
    title: "Próximas actividades",
    lede: "Talleres en planificación o abiertos a propuestas in company. Pulse una actividad para ver el detalle e inscribirse.",
  },
};

export const DEFAULT_QUIENES_CIVIS: CmsCivisQuienesCivis = {
  intro: CIVIS_INTRO,
  propositoEyebrow: "Nuestro propósito",
  proposito: CIVIS_PROPOSITO,
  objetivosIntro: "De este propósito surgen",
  objetivos: CIVIS_OBJETIVOS.map((o) => ({ title: o.title, text: o.text })),
  sideImage: {
    src: "/img/quienes-somos/piramide-ciudadania.webp",
    alt: "Grupo central con columna clásica transparente al fondo",
    objectPosition: "50% 35%",
    caption:
      "Cultura, valores y responsabilidad compartida para equipos e instituciones.",
  },
  metodologiaEyebrow: "Metodología",
  metodologiaTitle: "Cómo trabajamos en los talleres",
  metodologia: CIVIS_METODOLOGIAS.map((m) => ({ title: m.title, text: m.text })),
};

export const DEFAULT_QUIENES_NA: CmsCivisQuienesNa = {
  title: "Qué es Nueva Acrópolis",
  intro: [...CIVIS_NA_INTRO],
  heroImage: {
    src: "/img/home/grecia.webp",
    alt: "Visitante contemplando el Partenón en la Acrópolis de Atenas",
    objectPosition: "50% 50%",
  },
  principios: CIVIS_NA_PRINCIPIOS.map((p) => ({ title: p.title, text: p.text })),
  ctaIntro:
    "Conoce nuestra historia, actividades y sedes en República Dominicana.",
  ctaLabel: "Visitar acropolis.org.do",
  ctaUrl: PRINCIPAL_SITE_URL,
};

export const DEFAULT_QUIENES_PAGE: CmsCivisQuienesPage = {
  equipo: {
    eyebrow: "Equipo",
    title: "Entrenadores y facilitadores",
    lede: "Profesores de filosofía y facilitadores con experiencia en liderazgo, convivencia y talleres corporativos.",
  },
  clientes: {
    eyebrow: "Confianza",
    title: "Quienes han confiado en nosotros",
    lede: "Hemos acompañado a empresas, instituciones y organizaciones que buscan fortalecer a sus equipos con formación en convivencia, liderazgo y ética aplicada.",
  },
  civis: DEFAULT_QUIENES_CIVIS,
  nuevaAcropolis: DEFAULT_QUIENES_NA,
};

export function resolveHomePrincipios(
  cms?: CmsCivisHomePrincipios,
): CmsCivisHomePrincipios {
  const d = DEFAULT_HOME_PRINCIPIOS;
  return {
    eyebrow: cms?.eyebrow ?? d.eyebrow,
    title: cms?.title ?? d.title,
    items: cms?.items?.length ? cms.items : d.items,
    footerLede: cms?.footerLede ?? d.footerLede,
    footerLinkLabel: cms?.footerLinkLabel ?? d.footerLinkLabel,
    footerLinkHref: cms?.footerLinkHref ?? d.footerLinkHref,
  };
}

export function resolveHomePage(
  cms?: CmsDocument | null,
): CmsCivisHomePage {
  const p = cms?.sections.civisHomePage;
  return {
    oferta: overlaySection(DEFAULT_HOME_PAGE.oferta!, p?.oferta),
    actividades: overlaySection(
      DEFAULT_HOME_PAGE.actividades!,
      p?.actividades,
    ),
    entrenadores: overlaySection(
      DEFAULT_HOME_PAGE.entrenadores!,
      p?.entrenadores,
    ),
    principios: resolveHomePrincipios(p?.principios),
  };
}

export function resolveTalleresPage(
  cms?: CmsDocument | null,
): CmsCivisTalleresPage {
  const p = cms?.sections.civisTalleresPage;
  return {
    oferta: overlaySection(DEFAULT_TALLERES_PAGE.oferta!, p?.oferta),
    agenda: overlaySection(DEFAULT_TALLERES_PAGE.agenda!, p?.agenda),
  };
}

export function resolveQuienesNa(
  cms?: CmsCivisQuienesNa,
): CmsCivisQuienesNa {
  const d = DEFAULT_QUIENES_NA;
  return {
    title: cms?.title ?? d.title,
    intro: cms?.intro?.length ? cms.intro : d.intro,
    heroImage: {
      src: cms?.heroImage?.src ?? d.heroImage?.src ?? "",
      alt: cms?.heroImage?.alt ?? d.heroImage?.alt ?? "",
      objectPosition:
        cms?.heroImage?.objectPosition ?? d.heroImage?.objectPosition,
    },
    principios:
      cms?.principios?.length ? cms.principios : d.principios,
    ctaIntro: cms?.ctaIntro ?? d.ctaIntro,
    ctaLabel: cms?.ctaLabel ?? d.ctaLabel,
    ctaUrl: cms?.ctaUrl ?? d.ctaUrl,
  };
}

export function resolveQuienesPage(
  cms?: CmsDocument | null,
): CmsCivisQuienesPage {
  const p = cms?.sections.civisQuienesPage;
  return {
    equipo: overlaySection(DEFAULT_QUIENES_PAGE.equipo!, p?.equipo),
    clientes: overlaySection(DEFAULT_QUIENES_PAGE.clientes!, p?.clientes),
    civis: resolveQuienesCivis(p?.civis),
    nuevaAcropolis: resolveQuienesNa(p?.nuevaAcropolis),
  };
}

export function resolveQuienesCivis(
  cms?: CmsCivisQuienesCivis,
): CmsCivisQuienesCivis {
  const d = DEFAULT_QUIENES_CIVIS;
  return {
    intro: cms?.intro ?? d.intro,
    propositoEyebrow: cms?.propositoEyebrow ?? d.propositoEyebrow,
    proposito: cms?.proposito ?? d.proposito,
    objetivosIntro: cms?.objetivosIntro ?? d.objetivosIntro,
    objetivos:
      cms?.objetivos?.length ? cms.objetivos : d.objetivos,
    sideImage: {
      src: cms?.sideImage?.src ?? d.sideImage?.src ?? "",
      alt: cms?.sideImage?.alt ?? d.sideImage?.alt ?? "",
      objectPosition:
        cms?.sideImage?.objectPosition ?? d.sideImage?.objectPosition,
      caption: cms?.sideImage?.caption ?? d.sideImage?.caption,
    },
    metodologiaEyebrow: cms?.metodologiaEyebrow ?? d.metodologiaEyebrow,
    metodologiaTitle: cms?.metodologiaTitle ?? d.metodologiaTitle,
    metodologia:
      cms?.metodologia?.length ? cms.metodologia : d.metodologia,
  };
}

export function loadEditableDoc(
  draft: CmsDocument,
  codeOferta: TallerCivis[],
  codeEntrenadores: EntrenadorCivis[],
  codeClientes: CivisCliente[],
  codeTalleres: TallerRealizado[],
  codeProximas: ProximaActividad[],
) {
  const oferta =
    draft.sections.civisOferta?.length
      ? draft.sections.civisOferta
      : codeToCmsOferta(codeOferta);
  const entrenadores =
    draft.sections.civisEntrenadores?.length
      ? draft.sections.civisEntrenadores
      : codeEntrenadores.map(codeToCmsEntrenador);
  const talleresRealizados =
    draft.sections.civisTalleresRealizados?.length
      ? draft.sections.civisTalleresRealizados
      : codeToCmsTallerRealizado(codeTalleres);
  const proximas =
    draft.sections.civisProximasActividades?.length
      ? draft.sections.civisProximasActividades
      : codeProximas.map(codeToCmsProxima);
  const clientes =
    draft.sections.civisClientes?.length
      ? draft.sections.civisClientes
      : codeClientes.map(codeToCmsCliente);

  return {
    homeHero: draft.sections.homeHero ?? {},
    heroCarousel:
      draft.sections.civisHeroCarousel?.length
        ? draft.sections.civisHeroCarousel
        : itemsFromCivisHero(CIVIS_HERO_IMAGES),
    homePage: { ...DEFAULT_HOME_PAGE, ...draft.sections.civisHomePage },
    talleresPage: {
      ...DEFAULT_TALLERES_PAGE,
      ...draft.sections.civisTalleresPage,
    },
    quienesPage: resolveQuienesPage(draft),
    oferta,
    entrenadores,
    clientes,
    talleresRealizados,
    proximas,
  };
}

export function buildCivisDoc(
  base: CmsDocument,
  state: ReturnType<typeof loadEditableDoc>,
): CmsDocument {
  return {
    ...base,
    sections: {
      ...base.sections,
      homeHero: state.homeHero,
      civisHeroCarousel: state.heroCarousel,
      civisHomePage: state.homePage,
      civisTalleresPage: state.talleresPage,
      civisQuienesPage: state.quienesPage,
      civisOferta: state.oferta,
      civisEntrenadores: state.entrenadores,
      civisClientes: state.clientes,
      civisTalleresRealizados: state.talleresRealizados,
      civisProximasActividades: state.proximas,
    },
  };
}

export function newClienteId() {
  return `cliente-${Date.now().toString(36)}`;
}

export function newEntrenadorId() {
  return `entrenador-${Date.now().toString(36)}`;
}

export function newOfertaId() {
  return `taller-${Date.now().toString(36)}`;
}

export function newActividadId() {
  return `act-${Date.now().toString(36)}`;
}

export function newTallerRealizadoId() {
  return `real-${Date.now().toString(36)}`;
}
