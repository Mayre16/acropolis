import {
  cmsPrintedBookId,
  cmsPrintedBookToStoreBook,
  extractCmsSlugFromTags,
  filterStoreBooks,
  type StoreBook,
} from "@/lib/bookstore";
import type { CmsEditorialPrintedBook } from "@/lib/cms/types";

/** Libro listo para carrito Azul: ID real en Biblioteca/Harmonía. */
export function isBookCheckoutEligible(book: StoreBook): boolean {
  return (
    book.id > 0 &&
    book.price != null &&
    book.price > 0 &&
    book.stock > 0
  );
}

/** Presentación CMS + precio/stock del API cuando hay bibliotecaId. */
export function mergeCmsPrintedWithApi(
  cms: CmsEditorialPrintedBook,
  api?: StoreBook,
): StoreBook {
  const fallback = cmsPrintedBookToStoreBook(cms);
  const bibliotecaId = cms.bibliotecaId;
  if (!bibliotecaId || bibliotecaId <= 0) return fallback;

  return {
    id: bibliotecaId,
    title: cms.title || api?.title || fallback.title,
    author: cms.author ?? api?.author ?? fallback.author,
    isbn: cms.isbn ?? api?.isbn ?? fallback.isbn,
    cover_url: cms.coverUrl || api?.cover_url || fallback.cover_url,
    summary: cms.summary || api?.summary || fallback.summary,
    price: api?.price ?? cms.price ?? fallback.price,
    currency: api?.currency || cms.currency || fallback.currency,
    stock: api?.stock ?? cms.stock ?? fallback.stock,
    publisher: cms.publisher || api?.publisher || fallback.publisher,
    area_tema: cms.area_tema || api?.area_tema || fallback.area_tema,
    edition_note: cms.priceNote || api?.edition_note || fallback.edition_note,
    contact_email: api?.contact_email ?? fallback.contact_email,
    tags: api ? "cms-synced" : "cms-pending-api",
    author_group: api?.author_group,
  };
}

export function mergeCatalogBooks(
  apiItems: StoreBook[],
  cmsBooks: CmsEditorialPrintedBook[],
  filters: {
    q?: string;
    authorGroup?: string;
    publisher?: string;
    area?: string;
  },
): StoreBook[] {
  const apiById = new Map(apiItems.map((book) => [book.id, book]));
  const linkedIds = new Set<number>();

  const fromCms = cmsBooks.map((cms) => {
    if (cms.bibliotecaId && cms.bibliotecaId > 0) {
      linkedIds.add(cms.bibliotecaId);
      return mergeCmsPrintedWithApi(cms, apiById.get(cms.bibliotecaId));
    }
    return cmsPrintedBookToStoreBook(cms);
  });

  const filteredCms = filterStoreBooks(fromCms, filters);
  const filteredApi = filterStoreBooks(
    apiItems.filter((book) => !linkedIds.has(book.id)),
    filters,
  );

  return [...filteredCms, ...filteredApi];
}

export function findCmsPrintedBook(
  cmsBooks: CmsEditorialPrintedBook[],
  book: StoreBook,
): CmsEditorialPrintedBook | undefined {
  return cmsBooks.find(
    (cms) =>
      (cms.bibliotecaId != null &&
        cms.bibliotecaId > 0 &&
        cms.bibliotecaId === book.id) ||
      (extractCmsSlugFromTags(book.tags) != null &&
        extractCmsSlugFromTags(book.tags) === cms.id) ||
      (!cms.bibliotecaId && cmsPrintedBookId(cms.id) === book.id),
  );
}

export function isCmsManagedBook(
  cmsBooks: CmsEditorialPrintedBook[],
  book: StoreBook,
): boolean {
  return findCmsPrintedBook(cmsBooks, book) != null;
}
