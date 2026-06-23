/** Tipos CMS (alineados con editor). */

export type CmsMedia = {
  src: string;
  alt: string;
  credit?: string;
};

export type CmsAgendaEntry = {
  id: string;
  category:
    | "diplomado"
    | "filosofia"
    | "curso"
    | "taller"
    | "conferencia"
    | "cultura"
    | "voluntariado"
    | "esfera";
  title: string;
  startsAt: string;
  date: string;
  time?: string;
  sede?: string;
  tag?: string;
  image?: string;
  imageAlt?: string;
  description?: string;
  inscribeMessage?: string;
  detailHref?: string;
  detailLabel?: string;
  showOnHome?: boolean;
  /** Crónica en /eventos generada desde esta actividad. */
  eventoSlug?: string;
};

export type CmsArticulo = {
  slug: string;
  title: string;
  author: string;
  date: string;
  readingTime: string;
  category: string;
  excerpt: string;
  image: CmsMedia;
  gallery?: CmsMedia[];
  body: string[];
  featured?: boolean;
};

export type CmsEvento = {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  image: CmsMedia;
  gallery?: CmsMedia[];
  body: string[];
  /** `false` = borrador oculto en /eventos hasta publicar. */
  published?: boolean;
  /** Actividad de agenda que originó este borrador. */
  sourceAgendaId?: string;
};

export type CmsMedioKind =
  | "Entrevista"
  | "Artículo"
  | "Charla"
  | "Programa"
  | "Video";

export type CmsMedioItem = {
  id: string;
  title: string;
  outlet: string;
  kind: CmsMedioKind;
  people: string;
  date?: string;
  excerpt: string;
  url: string;
  image?: CmsMedia;
};

export type CmsViaje = {
  slug: string;
  categoria: "locales" | "internacionales";
  title: string;
  location: string;
  duration?: string;
  excerpt: string;
  image: CmsMedia;
  body: string[];
  highlights: string[];
  proximaFecha?: string;
  link?: string;
  soloEnlace?: boolean;
};

export type CmsDiplomadoHero = {
  badgeWeekday?: string;
  badgeDate?: string;
  activeLabel?: string;
  activeDate?: string;
  activeTime?: string;
  activeModality?: string;
  bannerDuration?: string;
  bannerFee?: string;
};

export type CmsDiplomadoInscription = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  capacityNote?: string;
  feeMain?: string;
  feeNote?: string;
  paymentNote?: string;
  accountLabel?: string;
  account?: string;
  rncLabel?: string;
  rnc?: string;
  email?: string;
  footnote?: string;
  inscribeWhatsApp?: string;
};

export type CmsDiplomadoPage = {
  heroLede?: string;
  otrasSesionesTitle?: string;
  otrasSesionesIntro?: string;
  testimonialEyebrow?: string;
  testimonialQuote?: string;
  testimonialVideoUrl?: string;
};

export type CmsPageHeroText = {
  heroEyebrow?: string;
  heroTitle?: string;
  heroLede?: string;
};

export type CmsFilosofiaCard = {
  id: string;
  src: string;
  alt: string;
  title: string;
  text: string;
  badge?: string;
};

export type CmsFilosofiaFaqIcon = "users" | "check" | "clock" | "map" | "book";

export type CmsFilosofiaFaqItem = {
  id: string;
  icon?: CmsFilosofiaFaqIcon;
  title: string;
  text: string;
};

export type CmsFilosofiaLabeledValue = {
  label: string;
  value: string;
};

export type CmsFilosofiaPage = CmsPageHeroText & {
  sesionesTitle?: string;
  sesionesIntro?: string;
  programaEyebrow?: string;
  programaTitle?: string;
  programaParagraphs?: string[];
  programaImageSrc?: string;
  programaImageAlt?: string;
  cursoEyebrow?: string;
  cursoSubtitle?: string;
  cursoTitle?: string;
  cursoLede?: string;
  cursoHeroImageSrc?: string;
  cursoHeroImageAlt?: string;
  aprenderasTitle?: string;
  aprenderas?: string[];
  cursoInfoTitle?: string;
  cursoInfoLede?: string;
  cursoInfo?: CmsFilosofiaLabeledValue[];
  incluyeLabel?: string;
  incluye?: string[];
  modulosTitle?: string;
  modulos?: CmsFilosofiaCard[];
  temarioEyebrow?: string;
  temarioTitle?: string;
  temarioIntro?: string;
  temario?: CmsFilosofiaCard[];
  avanzadosEyebrow?: string;
  avanzadosTitle?: string;
  avanzadosParagraphs?: string[];
  avanzadosMaterias?: string[];
  avanzadosImageSrc?: string;
  avanzadosImageAlt?: string;
  avanzadosImageCaption?: string;
  esParaTiTitle?: string;
  esParaTi?: CmsFilosofiaFaqItem[];
  ctaTitle?: string;
  ctaText?: string;
  ctaWhatsappMessage?: string;
  ctaButtonLabel?: string;
  ctaImageSrc?: string;
  ctaImageAlt?: string;
};

export type CmsCulturaCard = {
  id: string;
  src: string;
  alt: string;
  title: string;
  text: string;
  /** Fecha o horario legible (ej. «Martes 19:00»). */
  date?: string;
  /** Sede o lugar (ej. «Sede Naco»). */
  sede?: string;
  /** Enlace interno (ej. crónica en /eventos/…). */
  href?: string;
};

export type CmsCirculoAmigosPromo = {
  eyebrow?: string;
  title?: string;
  lede?: string;
  imageSrc?: string;
  imageAlt?: string;
};

export type CmsCulturaPage = CmsPageHeroText & {
  proximasTitle?: string;
  proximasIntro?: string;
  talleresEyebrow?: string;
  talleresTitle?: string;
  talleresIntro?: string;
  talleres?: CmsCulturaCard[];
  eventosEyebrow?: string;
  eventosTitle?: string;
  eventosIntro?: string;
  eventosPreview?: CmsCulturaCard[];
  circuloAmigos?: CmsCirculoAmigosPromo;
  viajesEyebrow?: string;
  viajesTitle?: string;
  viajesIntro?: string;
};

export type CmsHomePillar = {
  id: string;
  title: string;
  tagline: string;
  text: string;
  img: string;
  imgAlt: string;
  href: string;
  cta: string;
};

export type CmsHomePage = {
  whatIsNa?: {
    imageSrc?: string;
    imageAlt?: string;
    paragraphs?: string[];
    ctaLabel?: string;
  };
  pillars?: CmsHomePillar[];
  philosophyBand?: {
    headline?: string;
    eyebrow?: string;
    text?: string;
    imageSrc?: string;
    ctaLabel?: string;
  };
};

export type CmsPersonaBlock = {
  id: string;
  name: string;
  role: string;
  period?: string;
  bio: string;
  initials?: string;
  photo?: string;
};

export type CmsQuienesSomosPage = CmsPageHeroText & {
  introParagraphs?: string[];
  presidenciaEyebrow?: string;
  presidenciaTitle?: string;
  presidenciaIntro?: string;
  personas?: CmsPersonaBlock[];
  directorNacional?: CmsPersonaBlock;
  directoresAnteriores?: CmsPersonaBlock[];
};

export type CmsRelacionesPage = CmsPageHeroText & {
  intro?: string;
  stats?: { id: string; value: string; label: string }[];
  areasEyebrow?: string;
  areasTitle?: string;
  areasIntro?: string;
  areas?: { id: string; title: string; text: string }[];
  rdEyebrow?: string;
  rdTitle?: string;
  rdIntro?: string;
  rdItems?: { id: string; text: string }[];
  ctaTitle?: string;
  ctaText?: string;
};

export type CmsCollaborateTabId = "donar" | "voluntario" | "alianzas";

export type CmsCollaborateTab = {
  id: CmsCollaborateTabId;
  label: string;
  title: string;
  text: string;
  cta: string;
  href: string;
  external?: boolean;
  secondary?: { label: string; href: string; external?: boolean };
};

export type CmsCollaborateBlock = {
  title?: string;
  intro?: string;
  tabs?: CmsCollaborateTab[];
};

export type CmsVoluntariadoCard = {
  id: string;
  src: string;
  alt: string;
  title: string;
  text: string;
};

export type CmsVoluntariadoInfoCard = {
  id: string;
  title: string;
  text: string;
  icon?: "users" | "coins" | "heart";
  cta?: string;
  ctaHref?: string;
};

export type CmsVoluntariadoReciente = {
  id: string;
  src: string;
  alt: string;
  title: string;
  date?: string;
  text: string;
  href?: string;
};

export type CmsVoluntariadoPage = CmsPageHeroText & {
  proximasTitle?: string;
  proximasIntro?: string;
  queHacemosEyebrow?: string;
  queHacemosTitle?: string;
  queHacemosIntro?: string;
  queHacemosCards?: CmsVoluntariadoCard[];
  esferaEyebrow?: string;
  esferaTitle?: string;
  esferaIntro?: string;
  esferaIntro2?: string;
  esferaCtaPrimary?: string;
  esferaCtaSecondary?: string;
  esferaManualCaption?: string;
  esferaManualImageSrc?: string;
  esferaManualImageAlt?: string;
  sostenibilidadEyebrow?: string;
  sostenibilidadTitle?: string;
  sostenibilidadIntro?: string;
  sostenibilidadCards?: CmsVoluntariadoInfoCard[];
  participacionEyebrow?: string;
  participacionTitle?: string;
  participacionIntro?: string;
  recientesEyebrow?: string;
  recientesTitle?: string;
  recientesIntro?: string;
  recientesItems?: CmsVoluntariadoReciente[];
};

export type CmsEsferaTrainingItem = {
  id: string;
  title: string;
  /** Fecha legible en la tarjeta (ej. «Sábado 20 de junio»). */
  date: string;
  /** Fecha de inicio ISO (YYYY-MM-DD) para ordenar y filtrar. */
  startsAt?: string;
  time?: string;
  /** Ubicación o sede (ej. «Sede Naco», «Centro León · Santiago»). */
  sede?: string;
  blurb: string;
  imageSrc: string;
  imageAlt: string;
};

export type CmsEsferaWorkshopLine = {
  id: string;
  src: string;
  alt: string;
  title: string;
  text: string;
};

export type CmsEsferaAlianza = {
  id: string;
  name: string;
  logo: string;
  logoAlt: string;
};

export type CmsEsferaImpactStat = {
  id: string;
  label: string;
  kind: "count" | "display";
  countTo?: number;
  suffix?: string;
  display?: string;
};

export type CmsEsferaGallerySlide = {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  kind?: "image" | "video";
  poster?: string;
};

/** Tarjeta de foto o video en bloques opcionales por página. */
export type CmsPageMediaCard = {
  id: string;
  kind: "image" | "video";
  src: string;
  poster?: string;
  alt: string;
  title?: string;
  caption?: string;
  linkHref?: string;
  linkLabel?: string;
};

export type CmsPageMediaTarget =
  | "home"
  | "filosofia"
  | "diplomado"
  | "cursos"
  | "cultura"
  | "voluntariado"
  | "esfera"
  | "eventos"
  | "articulos"
  | "viajes"
  | "quienes-somos"
  | "relaciones";

export type CmsPageMediaSection = {
  id: string;
  pageId: CmsPageMediaTarget;
  eyebrow?: string;
  title?: string;
  intro?: string;
  cards: CmsPageMediaCard[];
};

export type CmsEsferaBeneficio = {
  id: string;
  title: string;
  text: string;
};

export type CmsEsferaAudiencia = {
  id: string;
  sector: string;
  items: string[];
  image: string;
  imageAlt: string;
};

export type CmsEsferaModalidad = {
  id: string;
  title: string;
  duration: string;
  format: string;
  intro: string;
  topics: string[];
  image: string;
  imageAlt: string;
};

export type CmsEsferaPrincipio = {
  id: string;
  src: string;
  alt: string;
  title: string;
  text: string;
};

export type CmsEsferaQuienesPoint = {
  id: string;
  title: string;
  text: string;
};

export type CmsEsferaQuienesTab = {
  id: "quienes" | "hacemos";
  label: string;
  lede: string;
  imageSrc: string;
  imageAlt: string;
  points: CmsEsferaQuienesPoint[];
};

export type CmsEsferaHomePromo = {
  homeEyebrow?: string;
  homeTitle?: string;
  homeIntro?: string;
  homeDetail?: string;
  homeImageSrc?: string;
  homeImageAlt?: string;
  homeCtaLabel?: string;
};

export type CmsEsferaPage = CmsPageHeroText & CmsEsferaHomePromo & {
  agendaEyebrow?: string;
  agendaTitle?: string;
  agendaIntro?: string;
  trainings?: CmsEsferaTrainingItem[];
  workshopLinesTitle?: string;
  workshopLinesIntro?: string;
  workshopLines?: CmsEsferaWorkshopLine[];
  alianzasEyebrow?: string;
  alianzasTitle?: string;
  alianzas?: CmsEsferaAlianza[];
  impactEyebrow?: string;
  impactTitle?: string;
  impactIntro?: string;
  impactTestimonial?: string;
  impactStats?: CmsEsferaImpactStat[];
  impactGalleryTitle?: string;
  impactGalleryEmptyText?: string;
  impactGallery?: CmsEsferaGallerySlide[];
  beneficiosEyebrow?: string;
  beneficiosTitle?: string;
  beneficiosIntro?: string;
  beneficiosQuote?: string;
  beneficios?: CmsEsferaBeneficio[];
  audienciaEyebrow?: string;
  audienciaTitle?: string;
  audienciaIntro?: string;
  audiencias?: CmsEsferaAudiencia[];
  modalidadesEyebrow?: string;
  modalidadesTitle?: string;
  modalidadesIntro?: string;
  modalidadesNota?: string;
  modalidades?: CmsEsferaModalidad[];
  principios?: CmsEsferaPrincipio[];
  estandaresEyebrow?: string;
  estandaresTitle?: string;
  estandaresPuntoFocal?: string;
  estandaresText?: string;
  estandaresDetail?: string;
  estandaresSectores?: string[];
  estandaresManual?: string;
  estandaresQuote?: string;
  estandaresQuoteSource?: string;
  manualCoverSrc?: string;
  manualCoverAlt?: string;
  manualCaption?: string;
  manualSubtitle?: string;
  esferaLogoSrc?: string;
  esferaLogoWhiteSrc?: string;
  esferaLogoAlt?: string;
  quienesEyebrow?: string;
  quienesTitle?: string;
  quienesTabs?: CmsEsferaQuienesTab[];
  brochureEyebrow?: string;
  brochureTitle?: string;
  brochureLede?: string;
  brochureNote?: string;
  brochureHref?: string;
  brochureButtonLabel?: string;
};

export type CmsCursosCard = {
  id: string;
  src: string;
  alt: string;
  title: string;
  text: string;
  facilitador?: string;
  sede?: string;
  tag?: string;
  accessLabel?: string;
  inscribeKind?: "curso" | "taller" | "actividad" | "conferencia";
  inscribeLabel?: string;
  /** Texto visible, ej. «Apertura: 15 de marzo» o «Temporada 2026». */
  fechaApertura?: string;
  /** Fecha ISO opcional (YYYY-MM-DD) para ordenar o filtrar. */
  fechaAperturaIso?: string;
};

export type CmsCursosPage = CmsPageHeroText & {
  proximasTitle?: string;
  proximasIntro?: string;
  ofertaEyebrow?: string;
  ofertaCursosIntro?: string;
  ofertaConferenciasIntro?: string;
  cursosTalleres?: CmsCursosCard[];
  conferencias?: CmsCursosCard[];
};

export type CmsEventosPage = CmsPageHeroText;

export type CmsArticulosPage = CmsPageHeroText;

export type CmsViajeCategoriaPage = CmsPageHeroText & {
  heroImage?: CmsMedia;
  /** Párrafo bajo el encabezado en /cultura/viajes/[categoria]. */
  intro?: string;
  /** Texto de la tarjeta promocional en /cultura. */
  cardText?: string;
};

export type CmsViajesPage = {
  locales?: CmsViajeCategoriaPage;
  internacionales?: CmsViajeCategoriaPage;
};

export type CmsActivityPhoto = {
  src: string;
  alt: string;
  caption?: string;
};

export type CmsHeroCarouselItem = {
  id: string;
  src: string;
  alt: string;
  media?: "image" | "video";
  poster?: string;
};

export type CmsHeroCarouselKey =
  | "filosofia"
  | "cultura"
  | "voluntariado"
  | "cursos"
  | "eventos"
  | "articulos"
  | "quienesSomos"
  | "relaciones"
  | "esfera";

export type CmsHeroCarousels = Partial<
  Record<CmsHeroCarouselKey, CmsHeroCarouselItem[]>
>;

export type CmsVenue = {
  id: string;
  name: string;
  kind: "sede" | "centro-cultural";
  city: string;
  zone: string;
  address: string;
  reference?: string;
  phone?: string;
  email?: string;
  mapsQuery: string;
  note?: string;
  mapX?: number;
  mapY?: number;
};

export type CmsSalonLayout = "butacas" | "mesas" | "herradura";

export type CmsSalon = {
  id: string;
  name: string;
  sede: "Naco" | "Los Prados" | "Santiago";
  city: string;
  summary: string;
  featuredLayout: CmsSalonLayout;
  capacities: { butacas: number; mesas: number; herradura: number };
  image: CmsMedia;
};

export type CmsSalonesPage = {
  eyebrow?: string;
  title?: string;
  intro?: string;
};

export type CmsDocument = {
  version: 1;
  site: "acropolis" | "civis";
  updatedAt: string;
  sections: {
    homeHero?: {
      h1?: string;
      h2?: string;
      lede?: string;
      background?: CmsMedia;
    };
    homePage?: CmsHomePage;
    diplomadoHero?: CmsDiplomadoHero;
    diplomadoInscription?: CmsDiplomadoInscription;
    diplomadoPage?: CmsDiplomadoPage;
    culturaPage?: CmsCulturaPage;
    voluntariadoPage?: CmsVoluntariadoPage;
    collaborateBlock?: CmsCollaborateBlock;
    esferaPage?: CmsEsferaPage;
    cursosPage?: CmsCursosPage;
    eventosPage?: CmsEventosPage;
    articulosPage?: CmsArticulosPage;
    viajesPage?: CmsViajesPage;
    activityPhotos?: CmsActivityPhoto[];
    heroCarousels?: CmsHeroCarousels;
    filosofiaPage?: CmsFilosofiaPage;
    agenda?: CmsAgendaEntry[];
    agendaHidden?: string[];
    articulos?: CmsArticulo[];
    articulosHidden?: string[];
    eventos?: CmsEvento[];
    eventosHidden?: string[];
    medios?: CmsMedioItem[];
    mediosHidden?: string[];
    viajes?: CmsViaje[];
    viajesHidden?: string[];
    venues?: CmsVenue[];
    venuesHidden?: string[];
    salones?: CmsSalon[];
    salonesPage?: CmsSalonesPage;
    quienesSomosPage?: CmsQuienesSomosPage;
    relacionesPage?: CmsRelacionesPage;
    pageMediaSections?: CmsPageMediaSection[];
    civisTalleresRealizados?: unknown[];
    civisProximasActividades?: unknown[];
  };
};
