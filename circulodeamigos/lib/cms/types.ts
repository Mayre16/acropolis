/** Tipos CMS del sitio Círculo de Amigos (alineados con editor). */

export type CmsMedia = {
  src: string;
  alt: string;
  credit?: string;
  objectPosition?: string;
};

export type CmsPageHeroText = {
  heroEyebrow?: string;
  heroTitle?: string;
  heroLede?: string;
};

export type CmsCirculoAmigosCard = {
  id: string;
  title: string;
  text: string;
  imageSrc: string;
  imageAlt: string;
};

export type CmsCirculoAmigosPaso = CmsCirculoAmigosCard & {
  n: number;
};

export type CmsCirculoAmigosPage = CmsPageHeroText & {
  heroSubtitle?: string;
  heroImageSrc?: string;
  heroImageAlt?: string;
  introEyebrow?: string;
  introParagraphs?: string[];
  introBannerSrc?: string;
  introBannerAlt?: string;
  introGrupoSrc?: string;
  introGrupoAlt?: string;
  pilaresTitle?: string;
  pilares?: CmsCirculoAmigosCard[];
  beneficiosTitle?: string;
  beneficios?: CmsCirculoAmigosCard[];
  pasosTitle?: string;
  pasos?: CmsCirculoAmigosPaso[];
  recibesTitle?: string;
  recibesItems?: string[];
  esperamosTitle?: string;
  esperamosItems?: string[];
  ctaTitle?: string;
  ctaText?: string;
  ctaEmail?: string;
  notaLegal?: string;
};

export type CmsDocument = {
  version: 1;
  site: "circulodeamigos";
  updatedAt: string;
  sections: {
    homeHero?: {
      h1?: string;
      h2?: string;
      lede?: string;
      background?: CmsMedia;
    };
    circuloAmigosPage?: CmsCirculoAmigosPage;
  };
};
