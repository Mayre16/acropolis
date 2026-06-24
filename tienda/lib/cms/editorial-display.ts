import { AUTHOR_FILTERS, STORE_THEMES } from "@/lib/bookstore";
import type { DigitalBookGroup } from "@/lib/digital-books";
import type { EditorialNavItem } from "@/lib/editorial-content";
import type { RegaloItem, RevistaItem } from "@/lib/editorial-extras";
import type { EditorialHomeCard } from "@/lib/editorial-home-cards";
import type { EditorialSede } from "@/lib/editorial-locations";
import type { HeroImage } from "@/lib/hero-images";
import {
  DIGITAL_BOOK_GROUPS,
  EDITORIAL_DONDE,
  EDITORIAL_HEADER_NAV,
  EDITORIAL_HOME_CARDS,
  EDITORIAL_LIBRERIA,
  EDITORIAL_QUIENES_SOMOS,
  EDITORIAL_SEDES,
  EDITORIAL_STORE_PHOTO,
  EDITORIAL_VISIT,
  EDITORIAL_WELCOME,
  EDITORIAL_HERO_IMAGES,
  REGALO_CATEGORIES,
  REGALOS,
  REVISTAS,
} from "@/lib/cms/merge-content";
import type {
  CmsDocument,
  CmsEditorialBookFilters,
  CmsEditorialDigitalBook,
  CmsEditorialDigitalBookGroup,
  CmsEditorialDonde,
  CmsEditorialFooter,
  CmsEditorialHeroImage,
  CmsEditorialHomeCard,
  CmsEditorialNavItem,
  CmsEditorialQuienesSomos,
  CmsEditorialRegalo,
  CmsEditorialRegaloCategory,
  CmsEditorialRevista,
  CmsEditorialSede,
  CmsEditorialShopCategory,
  CmsEditorialWelcome,
} from "@/lib/cms/types";

const FOOTER_TAGLINE =
  "Libros, revistas y regalos filosóficos de Nueva Acrópolis.";

const SHOP_CATEGORIES: CmsEditorialShopCategory[] = [
  { id: "libros", label: "Libros", hash: "catalogo-impresos" },
  { id: "revistas", label: "Revistas", hash: "catalogo-revistas" },
  { id: "regalos", label: "Regalos", hash: "catalogo-regalos" },
];

export function codeToCmsNav(items: EditorialNavItem[]): CmsEditorialNavItem[] {
  return items.map((item) => ({
    id: item.id,
    label: item.label,
    href: item.href,
    external: item.external,
  }));
}

export function codeToCmsHomeCards(
  cards: EditorialHomeCard[],
): CmsEditorialHomeCard[] {
  return cards.map((card) => ({
    id: card.id,
    title: card.title,
    description: card.description,
    hash: card.hash,
  }));
}

export function codeToCmsHeroImages(
  images: HeroImage[],
): CmsEditorialHeroImage[] {
  return images.map((img, index) => ({
    id: `hero-${index}`,
    src: img.src,
    alt: img.alt,
    objectPosition: img.objectPosition,
  }));
}

export function codeToCmsRevistas(items: RevistaItem[]): CmsEditorialRevista[] {
  return items.map((item) => ({ ...item }));
}

export function codeToCmsRegalos(items: RegaloItem[]): CmsEditorialRegalo[] {
  return items.map((item) => ({
    id: item.id,
    category: item.category,
    title: item.title,
    description: item.description,
    quote: item.quote,
    author: item.author,
    imageUrl: item.imageUrl,
    detailImageUrl: item.detailImageUrl,
    backImageUrl: item.backImageUrl,
    price: item.price,
    currency: item.currency,
    priceNote: item.priceNote,
    sample: item.sample,
  }));
}

export function codeToCmsRegaloCategories(): CmsEditorialRegaloCategory[] {
  return REGALO_CATEGORIES.map((c) => ({
    id: c.id,
    label: c.label,
    description: c.description,
  }));
}

export function codeToCmsDigitalBooks(
  groups: DigitalBookGroup[],
): CmsEditorialDigitalBookGroup[] {
  return groups.map((group) => ({
    id: group.id,
    label: group.label,
    description: group.description,
    books: group.books.map(
      (book): CmsEditorialDigitalBook => ({
        title: book.title,
        author: book.author,
        downloadUrl: book.downloadUrl,
        fileSize: book.fileSize,
        area: book.area,
        coverUrl: book.coverUrl,
      }),
    ),
  }));
}

export function codeToCmsSedes(sedes: EditorialSede[]): CmsEditorialSede[] {
  return sedes.map((sede) => ({ ...sede }));
}

export function defaultBookFilters(): CmsEditorialBookFilters {
  return {
    themes: [...STORE_THEMES],
    authorFilters: AUTHOR_FILTERS.map((f) => ({ id: f.id, label: f.label })),
  };
}

export function defaultQuienesSomos(): CmsEditorialQuienesSomos {
  return {
    libreria: {
      eyebrow: EDITORIAL_LIBRERIA.eyebrow,
      title: EDITORIAL_LIBRERIA.title,
      paragraphs: [...EDITORIAL_LIBRERIA.paragraphs],
      highlights: EDITORIAL_LIBRERIA.highlights.map((h) => ({ ...h })),
      naIntro: EDITORIAL_LIBRERIA.naIntro,
      naButton: EDITORIAL_LIBRERIA.naButton,
    },
    nuevaAcropolis: {
      title: EDITORIAL_QUIENES_SOMOS.title,
      heroImage: { ...EDITORIAL_QUIENES_SOMOS.heroImage },
      paragraphs: [...EDITORIAL_QUIENES_SOMOS.paragraphs],
      ctaIntro: EDITORIAL_QUIENES_SOMOS.ctaIntro,
      ctaLabel: EDITORIAL_QUIENES_SOMOS.ctaLabel,
      ctaHref: EDITORIAL_QUIENES_SOMOS.ctaHref,
    },
  };
}

export function defaultDonde(): CmsEditorialDonde {
  return {
    visit: { ...EDITORIAL_VISIT },
    page: { ...EDITORIAL_DONDE },
    storePhoto: { ...EDITORIAL_STORE_PHOTO },
    sedes: codeToCmsSedes(EDITORIAL_SEDES),
  };
}

export type EditorialEditableState = {
  headerNav: CmsEditorialNavItem[];
  welcome: CmsEditorialWelcome;
  homeCards: CmsEditorialHomeCard[];
  footer: CmsEditorialFooter;
  heroImages: CmsEditorialHeroImage[];
  revistas: CmsEditorialRevista[];
  regalos: CmsEditorialRegalo[];
  regaloCategories: CmsEditorialRegaloCategory[];
  digitalBooks: CmsEditorialDigitalBookGroup[];
  quienesSomos: CmsEditorialQuienesSomos;
  donde: CmsEditorialDonde;
  shopCategories: CmsEditorialShopCategory[];
  bookFilters: CmsEditorialBookFilters;
};

export function loadEditableDoc(draft: CmsDocument): EditorialEditableState {
  const s = draft.sections;
  return {
    headerNav: s.editorialHeaderNav?.length
      ? s.editorialHeaderNav
      : codeToCmsNav(EDITORIAL_HEADER_NAV),
    welcome: { ...EDITORIAL_WELCOME, ...s.editorialWelcome },
    homeCards: s.editorialHomeExplore?.cards?.length
      ? s.editorialHomeExplore.cards
      : codeToCmsHomeCards(EDITORIAL_HOME_CARDS),
    footer: {
      tagline: s.editorialFooter?.tagline ?? FOOTER_TAGLINE,
    },
    heroImages: s.editorialHeroImages?.length
      ? s.editorialHeroImages
      : codeToCmsHeroImages(EDITORIAL_HERO_IMAGES),
    revistas: s.editorialRevistas?.length
      ? s.editorialRevistas
      : codeToCmsRevistas(REVISTAS),
    regalos: s.editorialRegalos?.length
      ? s.editorialRegalos
      : codeToCmsRegalos(REGALOS),
    regaloCategories: s.editorialRegaloCategories?.length
      ? s.editorialRegaloCategories
      : codeToCmsRegaloCategories(),
    digitalBooks: s.editorialDigitalBooks?.length
      ? s.editorialDigitalBooks
      : codeToCmsDigitalBooks(DIGITAL_BOOK_GROUPS),
    quienesSomos: {
      ...defaultQuienesSomos(),
      ...s.editorialQuienesSomos,
      libreria: {
        ...defaultQuienesSomos().libreria,
        ...s.editorialQuienesSomos?.libreria,
      },
      nuevaAcropolis: {
        ...defaultQuienesSomos().nuevaAcropolis,
        ...s.editorialQuienesSomos?.nuevaAcropolis,
        heroImage: {
          src:
            s.editorialQuienesSomos?.nuevaAcropolis?.heroImage?.src ??
            defaultQuienesSomos().nuevaAcropolis?.heroImage?.src ??
            "",
          alt:
            s.editorialQuienesSomos?.nuevaAcropolis?.heroImage?.alt ??
            defaultQuienesSomos().nuevaAcropolis?.heroImage?.alt ??
            "",
          objectPosition:
            s.editorialQuienesSomos?.nuevaAcropolis?.heroImage?.objectPosition ??
            defaultQuienesSomos().nuevaAcropolis?.heroImage?.objectPosition,
        },
      },
    },
    donde: {
      ...defaultDonde(),
      ...s.editorialDonde,
      visit: { ...defaultDonde().visit, ...s.editorialDonde?.visit },
      page: { ...defaultDonde().page, ...s.editorialDonde?.page },
      storePhoto: {
        ...defaultDonde().storePhoto,
        ...s.editorialDonde?.storePhoto,
      },
      sedes: s.editorialDonde?.sedes?.length
        ? s.editorialDonde.sedes
        : codeToCmsSedes(EDITORIAL_SEDES),
    },
    shopCategories: s.editorialShopCategories?.length
      ? s.editorialShopCategories
      : SHOP_CATEGORIES,
    bookFilters: {
      ...defaultBookFilters(),
      ...s.editorialBookFilters,
      themes: s.editorialBookFilters?.themes?.length
        ? s.editorialBookFilters.themes
        : defaultBookFilters().themes,
      authorFilters: s.editorialBookFilters?.authorFilters?.length
        ? s.editorialBookFilters.authorFilters
        : defaultBookFilters().authorFilters,
    },
  };
}

export function buildEditorialDoc(
  base: CmsDocument,
  state: EditorialEditableState,
): CmsDocument {
  return {
    ...base,
    site: "editorial",
    sections: {
      ...base.sections,
      editorialHeaderNav: state.headerNav,
      editorialWelcome: state.welcome,
      editorialHomeExplore: { cards: state.homeCards },
      editorialFooter: state.footer,
      editorialHeroImages: state.heroImages,
      editorialRevistas: state.revistas,
      editorialRegalos: state.regalos,
      editorialRegaloCategories: state.regaloCategories,
      editorialDigitalBooks: state.digitalBooks,
      editorialQuienesSomos: state.quienesSomos,
      editorialDonde: state.donde,
      editorialShopCategories: state.shopCategories,
      editorialBookFilters: state.bookFilters,
    },
  };
}

export function editorialStateAsDoc(state: EditorialEditableState): CmsDocument {
  return buildEditorialDoc(
    { version: 1, site: "editorial", updatedAt: "", sections: {} },
    state,
  );
}

export function newRegaloId() {
  return `regalo-${Date.now().toString(36)}`;
}

export function newHeroImageId() {
  return `hero-${Date.now().toString(36)}`;
}
