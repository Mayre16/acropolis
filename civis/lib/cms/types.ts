/** Tipos CMS (alineados con editor). */



export type CmsMedia = {

  src: string;

  alt: string;

  credit?: string;

  objectPosition?: string;

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

  image?: CmsMedia;

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

  image: CmsMedia;

};



export type CmsCivisSalonesPage = CmsCivisSectionCopy & {
  catalogTitle?: string;
  catalogIntro?: string;
};

export type CmsCivisProximaActividad = {

  id: string;

  title: string;

  date: string;

  startsAt?: string;

  time?: string;

  sede?: string;

  format: string;

  excerpt: string;

  lineaId: string;

  image: CmsMedia;

  open: boolean;

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



export type CmsDocument = {

  version: 1;

  site: "acropolis" | "civis";

  updatedAt: string;

  sections: {

    homeHero?: {

      h1?: string;

      h2?: string;

      lede?: string;

      ctaHref?: string;

      ctaLabel?: string;

    };

    civisHomePage?: CmsCivisHomePage;

    civisTalleresPage?: CmsCivisTalleresPage;

    civisQuienesPage?: CmsCivisQuienesPage;

    civisOferta?: CmsCivisTaller[];

    civisEntrenadores?: CmsCivisEntrenador[];

    civisClientes?: CmsCivisCliente[];

    civisTalleresRealizados?: CmsCivisTallerRealizado[];

    civisProximasActividades?: CmsCivisProximaActividad[];

    civisHeroCarousel?: {
      id: string;
      src: string;
      alt: string;
      objectPosition?: string;
    }[];

    /** Salones compartidos (se leen del CMS de Acrópolis). */
    salones?: CmsSalon[];

    civisSalonesPage?: CmsCivisSalonesPage;

  };

};


