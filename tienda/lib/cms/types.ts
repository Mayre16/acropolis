/** Tipos CMS (alineados con editor). */

export type SiteId = "acropolis" | "civis" | "editorial";

export type CmsMedia = {
  src: string;
  alt: string;
  credit?: string;
  objectPosition?: string;
};

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
  linkLogoUrl?: string;
  linkLogoAlt?: string;
  imageUrl?: string;
  imageAlt?: string;
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
  detailImageUrl?: string;
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

export type CmsDocument = {
  version: 1;
  site: "editorial";
  updatedAt: string;
  sections: {
    editorialHeaderNav?: CmsEditorialNavItem[];
    editorialWelcome?: CmsEditorialWelcome;
    editorialHomeExplore?: CmsEditorialHomeExplore;
    editorialFooter?: CmsEditorialFooter;
    editorialQuienesSomos?: CmsEditorialQuienesSomos;
    editorialDonde?: CmsEditorialDonde;
    editorialRevistas?: CmsEditorialRevista[];
    editorialRegaloCategories?: CmsEditorialRegaloCategory[];
    editorialRegalos?: CmsEditorialRegalo[];
    editorialShopCategories?: CmsEditorialShopCategory[];
    editorialBookFilters?: CmsEditorialBookFilters;
    editorialDigitalBooks?: CmsEditorialDigitalBookGroup[];
    editorialHeroImages?: CmsEditorialHeroImage[];
  };
};
