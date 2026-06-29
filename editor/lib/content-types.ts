/** Tipos CMS compartidos (editor ↔ sitios). */

export type SiteId = "acropolis" | "civis" | "editorial";

export type CmsMedia = {
  src: string;
  alt: string;
  credit?: string;
};

export type AgendaCategory =
  | "diplomado"
  | "filosofia"
  | "curso"
  | "taller"
  | "conferencia"
  | "cultura"
  | "voluntariado"
  | "voluntariado-comunidad"
  | "voluntariado-ninos"
  | "voluntariado-ambiente"
  | "esfera";

export type CmsAgendaEntry = {
  id: string;
  category: AgendaCategory;
  title: string;
  startsAt: string;
  date: string;
  time?: string;
  sede?: string;
  tag?: string;
  seoTags?: string[];
  image?: string;
  imageAlt?: string;
  description?: string;
  inscribeMessage?: string;
  detailHref?: string;
  detailLabel?: string;
  showOnHome?: boolean;
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
  /** Fotos adicionales en el cuerpo (1 o varias, como los artículos actuales). */
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
  seoTags?: string[];
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

export type CmsHomeHero = {
  h1?: string;
  h2?: string;
  lede?: string;
  ctaHref?: string;
  ctaLabel?: string;
  background?: CmsMedia;
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
  feeMain?: string;
  feeNote?: string;
  paymentNote?: string;
  accountLabel?: string;
  account?: string;
  rncLabel?: string;
  rnc?: string;
  email?: string;
  footnote?: string;
  /** Vacío = número de WhatsApp diplomado del pie de página (CMS global). */
  inscribeWhatsappNumber?: string;
  inscribeWhatsApp?: string;
};

export type CmsDiplomadoImpactStat = {
  id: string;
  end: number;
  suffix: string;
  label: string;
};

export type CmsDiplomadoPage = {
  heroLede?: string;
  otrasSesionesTitle?: string;
  otrasSesionesIntro?: string;
  testimonialEyebrow?: string;
  testimonialQuote?: string;
  testimonialVideoUrl?: string;
  impactHeadlineEnd?: number;
  impactHeadlineSuffix?: string;
  impactTitle?: string;
  impactSubtitle?: string;
  impactStats?: CmsDiplomadoImpactStat[];
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
  /** Vacío = número de WhatsApp diplomado del pie de página (CMS global). */
  ctaWhatsappNumber?: string;
  ctaWhatsappMessage?: string;
  ctaButtonLabel?: string;
  ctaImageSrc?: string;
  ctaImageAlt?: string;
};

export type CmsCivisSectionCopy = {
  eyebrow?: string;
  title?: string;
  lede?: string;
};

export type CmsCivisPrincipioItem = {
  title: string;
  text: string;
};

export type CmsCivisHomePrincipios = {
  eyebrow?: string;
  title?: string;
  items?: CmsCivisPrincipioItem[];
  footerLede?: string;
  footerLinkLabel?: string;
  footerLinkHref?: string;
};

export type CmsCivisHomePage = {
  oferta?: CmsCivisSectionCopy;
  actividades?: CmsCivisSectionCopy;
  entrenadores?: CmsCivisSectionCopy;
  principios?: CmsCivisHomePrincipios;
};

export type CmsCivisTalleresPage = {
  oferta?: CmsCivisSectionCopy;
  agenda?: CmsCivisSectionCopy;
};

export type CmsCivisObjetivo = {
  title: string;
  text: string;
};

export type CmsCivisMetodologiaItem = {
  title: string;
  text: string;
};

export type CmsCivisQuienesCivis = {
  intro?: string;
  propositoEyebrow?: string;
  proposito?: string;
  objetivosIntro?: string;
  objetivos?: CmsCivisObjetivo[];
  sideImage?: CmsMedia & { caption?: string; objectPosition?: string };
  metodologiaEyebrow?: string;
  metodologiaTitle?: string;
  metodologia?: CmsCivisMetodologiaItem[];
};

export type CmsCivisNaPrincipio = {
  title: string;
  text: string;
};

export type CmsCivisQuienesNa = {
  title?: string;
  intro?: string[];
  heroImage?: CmsMedia & { objectPosition?: string };
  principios?: CmsCivisNaPrincipio[];
  ctaIntro?: string;
  ctaLabel?: string;
  ctaUrl?: string;
};

export type CmsCivisQuienesPage = {
  equipo?: CmsCivisSectionCopy;
  clientes?: CmsCivisSectionCopy;
  civis?: CmsCivisQuienesCivis;
  nuevaAcropolis?: CmsCivisQuienesNa;
};

export type CmsCivisCliente = {
  id: string;
  name?: string;
  logo?: string;
  logoAlt?: string;
  logoOnDark?: boolean;
};

export type CmsCivisTaller = {
  id: string;
  title?: string;
  intro?: string;
  topics?: string[];
  duration?: string;
  durationLabel?: string;
  durationHours?: number;
  format?: string;
  maxParticipants?: number;
  image?: CmsMedia & { objectPosition?: string };
};

export type CmsCivisEntrenador = {
  id: string;
  name?: string;
  role?: string;
  bio?: string;
  certifications?: string[];
  photo?: string;
  photoAlt?: string;
  photoObjectPosition?: string;
  initials?: string;
  featured?: boolean;
};

export type CmsCivisTallerRealizado = {
  id: string;
  title: string;
  client: string;
  date: string;
  place?: string;
  lineaId: string;
  image: CmsMedia & { objectPosition?: string };
};

export type CmsCivisProximaActividad = {
  id: string;
  title: string;
  /** Fecha legible en la tarjeta (ej. «Sábado 15 de marzo»). */
  date: string;
  /** Fecha de inicio ISO (YYYY-MM-DD). */
  startsAt?: string;
  time?: string;
  /** Ubicación o sede del evento. */
  sede?: string;
  format: string;
  excerpt: string;
  lineaId: string;
  image: CmsMedia & { objectPosition?: string };
  open: boolean;
};

export type CmsCulturaCard = {
  id: string;
  src: string;
  alt: string;
  title: string;
  text: string;
  date?: string;
  sede?: string;
  /** Vacío = número de WhatsApp cursos del pie de página. */
  inscribeWhatsappNumber?: string;
  /** Vacío = mensaje automático según título y sede. */
  inscribeWhatsappMessage?: string;
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

export type CmsOinaStat = {
  id: string;
  value: string;
  label: string;
};

export type CmsQuienesSomosPage = CmsPageHeroText & {
  introParagraphs?: string[];
  presidenciaEyebrow?: string;
  presidenciaTitle?: string;
  presidenciaIntro?: string;
  personas?: CmsPersonaBlock[];
  directorNacional?: CmsPersonaBlock;
  directoresAnteriores?: CmsPersonaBlock[];
  oinaCifrasEyebrow?: string;
  oinaCifrasIntro?: string;
  oinaStats?: CmsOinaStat[];
  perfilInstitucionalEyebrow?: string;
  perfilInstitucionalTitle?: string;
  perfilInstitucionalLede?: string;
  perfilInstitucionalNote?: string;
  perfilInstitucionalHref?: string;
  perfilInstitucionalButtonLabel?: string;
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
  ctaButtonLabel?: string;
  ctaWhatsappNumber?: string;
  ctaWhatsappMessage?: string;
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
  /** Etiqueta corta del área (p. ej. Medio Ambiente). */
  area?: string;
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
  date: string;
  startsAt?: string;
  time?: string;
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

/** Tarjeta de foto o video (legacy / ítems de galería). */
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

export type CmsPageMediaBlockWidth = "normal" | "full";

export type CmsPageMediaTextBlock = {
  id: string;
  kind: "text";
  width?: CmsPageMediaBlockWidth;
  heading?: string;
  paragraphs: string[];
};

export type CmsPageMediaMediaLayout = "card" | "voluntariado" | "overlay";

export type CmsPageMediaMediaBlock = {
  id: string;
  kind: "media";
  width?: CmsPageMediaBlockWidth;
  layout?: CmsPageMediaMediaLayout;
  imageKind: "image" | "video";
  src: string;
  poster?: string;
  alt: string;
  area?: string;
  title?: string;
  caption?: string;
  body?: string;
  linkHref?: string;
  linkLabel?: string;
  align?: "left" | "center";
};

export type CmsPageMediaGalleryDisplay = "grid" | "carousel";

export type CmsPageMediaGalleryBlock = {
  id: string;
  kind: "gallery";
  width?: CmsPageMediaBlockWidth;
  display?: CmsPageMediaGalleryDisplay;
  columns?: 2 | 3;
  layout?: "card" | "overlay";
  carouselTitle?: string;
  carouselText?: string;
  carouselSide?: "left" | "right";
  align?: "left" | "center";
  items: CmsPageMediaCard[];
};

export type CmsPageMediaButtonVariant = "primary" | "outline" | "whatsapp";

export type CmsPageMediaButtonLinkKind = "url" | "whatsapp" | "internal";

export type CmsPageMediaButtonBlock = {
  id: string;
  kind: "button";
  width?: CmsPageMediaBlockWidth;
  align?: "left" | "center";
  label: string;
  linkKind: CmsPageMediaButtonLinkKind;
  href?: string;
  whatsappPhone?: string;
  whatsappMessage?: string;
  variant?: CmsPageMediaButtonVariant;
};

export type CmsPageMediaBlockKind = "text" | "media" | "gallery" | "button";

export type CmsPageMediaBlock =
  | CmsPageMediaTextBlock
  | CmsPageMediaMediaBlock
  | CmsPageMediaGalleryBlock
  | CmsPageMediaButtonBlock;

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
  | "relaciones"
  | "donde-estamos";

export type CmsPageMediaSection = {
  id: string;
  pageId: CmsPageMediaTarget;
  eyebrow?: string;
  title?: string;
  intro?: string;
  blocks?: CmsPageMediaBlock[];
  cards?: CmsPageMediaCard[];
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

export type EsferaListKey =
  | "workshopLines"
  | "alianzas"
  | "beneficios"
  | "audiencias"
  | "modalidades"
  | "principios"
  | "trainings"
  | "impactStats";

export type CmsEsferaHidden = Partial<Record<EsferaListKey, string[]>>;

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
  hidden?: CmsEsferaHidden;
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
  inscribeWhatsappNumber?: string;
  inscribeWhatsappMessage?: string;
  fechaApertura?: string;
  fechaAperturaIso?: string;
  /** Sección en /cursos: activos u otros; sin valor = automático. */
  activo?: boolean;
};

export type CmsCursosPage = CmsPageHeroText & {
  proximasTitle?: string;
  proximasIntro?: string;
  ofertaEyebrow?: string;
  ofertaCursosIntro?: string;
  ofertaConferenciasIntro?: string;
  inscribeTitle?: string;
  inscribeText?: string;
  inscribeCtaLabel?: string;
  inscribeWhatsappNumber?: string;
  inscribeWhatsappMessage?: string;
  cursosTalleres?: CmsCursosCard[];
  conferencias?: CmsCursosCard[];
  cursosTalleresHidden?: string[];
  conferenciasHidden?: string[];
};

export type CmsEventosPage = CmsPageHeroText;

export type CmsAgendaPage = CmsPageHeroText;

export type CmsArticulosPage = CmsPageHeroText;

export type CmsViajeCategoriaPage = CmsPageHeroText & {
  heroImage?: CmsMedia;
  intro?: string;
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
  | "agenda"
  | "quienesSomos"
  | "relaciones"
  | "esfera";

export type CmsHeroCarousels = Partial<
  Record<CmsHeroCarouselKey, CmsHeroCarouselItem[]>
>;

export type CmsEditorialNavItem = {
  id: string;
  label?: string;
  href?: string;
  external?: boolean;
};

export type CmsEditorialWelcome = {
  title?: string;
  lede?: string;
  tagline?: string;
};

export type CmsEditorialHomeCard = {
  id: string;
  title?: string;
  description?: string;
  hash?: string;
};

export type CmsEditorialHomeExplore = {
  cards?: CmsEditorialHomeCard[];
};

export type CmsEditorialFooter = {
  tagline?: string;
};

export type CmsEditorialHighlight = {
  title: string;
  text: string;
};

export type CmsEditorialLibreria = {
  eyebrow?: string;
  title?: string;
  paragraphs?: string[];
  highlights?: CmsEditorialHighlight[];
  naIntro?: string;
  naButton?: string;
};

export type CmsEditorialQuienesNa = {
  title?: string;
  heroImage?: CmsMedia;
  paragraphs?: string[];
  ctaIntro?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type CmsEditorialQuienesSomos = {
  libreria?: CmsEditorialLibreria;
  nuevaAcropolis?: CmsEditorialQuienesNa;
};

export type CmsEditorialVisit = {
  eyebrow?: string;
  title?: string;
  lede?: string;
  ctaLabel?: string;
  ctaHash?: string;
};

export type CmsEditorialDondePage = {
  eyebrow?: string;
  title?: string;
  lede?: string;
};

export type CmsEditorialDondeContact = {
  phone?: string;
  email?: string;
  whatsappNumber?: string;
  whatsappCtaLabel?: string;
  whatsappMessage?: string;
};

export type CmsEditorialStorePhoto = {
  src?: string;
  fallbackSrc?: string;
  alt?: string;
};

export type CmsEditorialSede = {
  id: string;
  name?: string;
  zone?: string;
  city?: string;
  address?: string;
  reference?: string;
  mapsQuery?: string;
  hours?: string;
  sala?: string;
  note?: string;
};

export type CmsEditorialDonde = {
  visit?: CmsEditorialVisit;
  page?: CmsEditorialDondePage;
  contact?: CmsEditorialDondeContact;
  storePhoto?: CmsEditorialStorePhoto;
  defaultHours?: string;
  sedes?: CmsEditorialSede[];
};

export type CmsEditorialRevista = {
  title: string;
  description?: string;
  href?: string;
  note?: string;
  linkLabel?: string;
  confirmLeave?: boolean;
  leaveLabel?: string;
};

export type CmsEditorialRegaloCategory = {
  id: string;
  label?: string;
  description?: string;
};

export type CmsEditorialRegalo = {
  id: string;
  category?: string;
  title?: string;
  description?: string;
  quote?: string;
  author?: string;
  imageUrl?: string;
  backImageUrl?: string;
  price?: number | null;
  currency?: string;
  priceNote?: string;
  sample?: boolean;
};

export type CmsEditorialShopCategory = {
  id: string;
  label?: string;
  hash?: string;
};

export type CmsEditorialAuthorFilter = {
  id: string;
  label?: string;
};

export type CmsEditorialBookFilters = {
  themes?: string[];
  authorFilters?: CmsEditorialAuthorFilter[];
  publishers?: string[];
};

export type CmsEditorialPrintedBook = {
  id: string;
  title: string;
  author?: string;
  isbn?: string;
  coverUrl?: string;
  summary?: string;
  price?: number | null;
  currency?: string;
  stock?: number;
  publisher?: string;
  area_tema?: string;
  priceNote?: string;
};

export type CmsEditorialDigitalBook = {
  title: string;
  author?: string;
  downloadUrl?: string;
  fileSize?: string;
  area?: string;
  coverUrl?: string;
};

export type CmsEditorialDigitalBookGroup = {
  id: string;
  label?: string;
  description?: string;
  books?: CmsEditorialDigitalBook[];
};

export type CmsEditorialHeroImage = {
  id: string;
  src?: string;
  alt?: string;
  objectPosition?: string;
};

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
  mapHideLabel?: boolean;
};

export type CmsVenuesContact = {
  title?: string;
  body?: string;
  phone?: string;
  email?: string;
  ctaLabel?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
};

export type CmsSiteFooter = {
  tagline?: string;
  legalDomicile?: string;
  legalNote?: string;
  instagramUrl?: string;
  instagramHandle?: string;
  youtubeUrl?: string;
  facebookUrl?: string;
  whatsappCursosNumber?: string;
  whatsappDiplomadoNumber?: string;
};

/** Bandeja verde superior — visibilidad y URLs de enlaces a otras plataformas. */
export type CmsPlatformNav = {
  hidden?: ("biblioteca" | "civis" | "tienda")[];
  /** URL por plataforma. Vacío = valor por defecto del código (adesa / variables de entorno). */
  urls?: Partial<Record<"biblioteca" | "civis" | "tienda", string>>;
};

export type CmsSalonLayout = "butacas" | "mesas" | "herradura";

export type CmsSalon = {
  id: string;
  name: string;
  sede: "Naco" | "Los Prados";
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

export type CmsCivisSalonesPage = CmsCivisSectionCopy & {
  catalogTitle?: string;
  catalogIntro?: string;
};

export type CmsSections = {
  homeHero?: CmsHomeHero;
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
  agendaPage?: CmsAgendaPage;
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
  venuesContact?: CmsVenuesContact;
  siteFooter?: CmsSiteFooter;
  platformNav?: CmsPlatformNav;
  salones?: CmsSalon[];
  salonesHidden?: string[];
  salonesPage?: CmsSalonesPage;
  quienesSomosPage?: CmsQuienesSomosPage;
  relacionesPage?: CmsRelacionesPage;
  pageMediaSections?: CmsPageMediaSection[];
  civisSalonesPage?: CmsCivisSalonesPage;
  civisTalleresRealizados?: CmsCivisTallerRealizado[];
  civisProximasActividades?: CmsCivisProximaActividad[];
  civisHeroCarousel?: CmsHeroCarouselItem[];
  civisHomePage?: CmsCivisHomePage;
  civisTalleresPage?: CmsCivisTalleresPage;
  civisQuienesPage?: CmsCivisQuienesPage;
  civisOferta?: CmsCivisTaller[];
  civisEntrenadores?: CmsCivisEntrenador[];
  civisClientes?: CmsCivisCliente[];
  editorialHeaderNav?: CmsEditorialNavItem[];
  editorialWelcome?: CmsEditorialWelcome;
  editorialHomeExplore?: CmsEditorialHomeExplore;
  editorialFooter?: CmsEditorialFooter;
  editorialQuienesSomos?: CmsEditorialQuienesSomos;
  editorialDonde?: CmsEditorialDonde;
  editorialRevistas?: CmsEditorialRevista[];
  editorialRegaloCategories?: CmsEditorialRegaloCategory[];
  editorialRegalos?: CmsEditorialRegalo[];
  editorialMemorion?: CmsEditorialRegalo;
  editorialShopCategories?: CmsEditorialShopCategory[];
  editorialBookFilters?: CmsEditorialBookFilters;
  editorialPrintedBooks?: CmsEditorialPrintedBook[];
  editorialDigitalBooks?: CmsEditorialDigitalBookGroup[];
  editorialHeroImages?: CmsEditorialHeroImage[];
};

export type CmsDocument = {
  version: 1;
  site: SiteId;
  updatedAt: string;
  sections: CmsSections;
};

export const CMS_SECTION_LABELS: Record<string, string> = {
  filosofia: "Filosofía — sesiones (visual)",
  plataformas: "Enlaces superiores (Biblioteca, Civis, Tienda)",
  homeHero: "Inicio — textos hero",
  contenido: "Contenido digital (visual)",
  agenda: "Agenda completa (visual)",
  articulos: "Artículos / blog (visual)",
  medios: "Voz fuera de la sede (visual)",
  viajesLocales: "Viajes locales (visual)",
  viajesInternacionales: "Viajes internacionales (visual)",
  cultura: "Cultura — próximas actividades (visual)",
  sedes: "Sedes y centros (visual)",
  home: "Inicio (visual)",
  voluntariado: "Voluntariado (visual)",
  cursos: "Cursos — convocatorias (visual)",
  archivos: "Archivos e imágenes",
  diplomado: "Diplomado (visual)",
  eventos: "Eventos realizados (visual)",
  civisTalleresRealizados: "Civis — talleres realizados (visual)",
  civisProximasActividades: "Civis — próximas actividades (visual)",
  civisHome: "Civis — inicio (visual)",
  civisTalleres: "Civis — oferta y talleres (visual)",
  civisQuienesSomos: "Civis — equipo (visual)",
  civisSalones: "Civis — salones (visual)",
  quienesSomos: "Quiénes somos (visual)",
  relaciones: "Relaciones institucionales (visual)",
  esfera: "Esfera — entrenamientos (visual)",
  editorialHome: "Inicio — tienda (visual)",
  editorialLibros: "Libros impresos (visual)",
  editorialDigitales: "Libros digitales (visual)",
  editorialRevistas: "Revistas (visual)",
  editorialRegalos: "Regalos (visual)",
  editorialDonde: "Dónde estamos (visual)",
  editorialQuienesSomos: "Quiénes somos (visual)",
};

export const SITE_LABELS: Record<SiteId, string> = {
  acropolis: "Acropolis (principal)",
  civis: "Civis Consulting",
  editorial: "Librería Editorial Logos",
};

export const ACROPOLIS_TABS = [
  "plataformas",
  "filosofia",
  "homeHero",
  "diplomadoHero",
  "agenda",
  "articulos",
  "medios",
  "viajesLocales",
  "viajesInternacionales",
  "cultura",
  "sedes",
  "home",
  "voluntariado",
  "cursos",
  "archivos",
  "diplomado",
  "eventos",
  "quienesSomos",
  "relaciones",
  "esfera",
] as const;

export const CIVIS_TABS = [
  "homeHero",
  "agenda",
  "archivos",
  "civisTalleresRealizados",
  "civisProximasActividades",
] as const;
