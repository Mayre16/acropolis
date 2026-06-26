/**
 * Sincroniza libros impresos del CMS editorial con Biblioteca/Harmonía.
 * Llamado desde CMS API al publicar (servidor — token nunca en el navegador).
 */

const DEFAULT_STORE_API = "https://biblioteca-oina.adesa.com.do";
const DEFAULT_UPSERT_PATH = "/api/bookstore_upsert.php";

/**
 * @param {object} config
 * @param {string} [config.store_api_url]
 * @param {string} [config.store_upsert_path]
 * @param {string} [config.store_sync_token]
 */
export function bookstoreSyncConfig(config = {}) {
  return {
    storeApiUrl: (config.store_api_url || DEFAULT_STORE_API).replace(/\/$/, ""),
    upsertPath: config.store_upsert_path || DEFAULT_UPSERT_PATH,
    token: (config.store_sync_token || "").trim(),
  };
}

function printedBooksFromDoc(doc) {
  const books = doc?.sections?.editorialPrintedBooks;
  return Array.isArray(books) ? books : [];
}

function setPrintedBooks(doc, books) {
  if (!doc.sections) doc.sections = {};
  doc.sections.editorialPrintedBooks = books;
  return doc;
}

/** Libros nuevos en Editorial (sin ID en Biblioteca) o editados tras vincular. */
function needsBibliotecaPush(book) {
  const bibId = book?.bibliotecaId;
  if (bibId && bibId > 0) {
    return book.syncStatus === "pending";
  }
  return true;
}

function formatUpsertError(res, data) {
  const http = res?.status;
  const api = data?.error || data?.message;
  if (api) return String(api);
  if (http === 404) {
    return "Biblioteca no expone bookstore_upsert (404). Falta desplegar el endpoint en el servidor.";
  }
  if (http) return `HTTP ${http}`;
  return "Error desconocido al sincronizar";
}

/**
 * @param {import('../lib/content-types.mjs').CmsDocument | Record<string, unknown>} doc
 * @param {object} config
 */
export async function syncEditorialPrintedBooks(doc, config = {}) {
  const { storeApiUrl, upsertPath, token } = bookstoreSyncConfig(config);
  const books = printedBooksFromDoc(doc);

  if (!books.length) {
    return { ok: true, synced: 0, failed: 0, skipped: 0, results: [], message: "Sin libros manuales." };
  }

  if (!token) {
    return {
      ok: true,
      synced: 0,
      failed: 0,
      skipped: books.length,
      results: books.map((b) => ({
        cmsId: b.id,
        title: b.title,
        status: "skipped",
        reason: "STORE_SYNC_TOKEN no configurado en CMS API",
      })),
      message:
        "Sincronización omitida: configure store_sync_token en config.php (o STORE_SYNC_TOKEN en dev).",
    };
  }

  const url = `${storeApiUrl}${upsertPath.startsWith("/") ? upsertPath : `/${upsertPath}`}`;
  const now = new Date().toISOString();
  let synced = 0;
  let failed = 0;
  let skipped = 0;
  const results = [];

  const updated = [];
  for (const book of books) {
    if (!needsBibliotecaPush(book)) {
      updated.push({
        ...book,
        syncStatus: "synced",
        syncError: undefined,
      });
      skipped += 1;
      results.push({
        cmsId: book.id,
        title: book.title,
        status: "skipped",
        bibliotecaId: book.bibliotecaId,
        reason: "Ya vinculado a Biblioteca",
      });
      continue;
    }

    if (!book?.title?.trim()) {
      updated.push({
        ...book,
        syncStatus: "error",
        syncError: "Falta título",
      });
      failed += 1;
      results.push({ cmsId: book.id, title: book.title, status: "error", error: "Falta título" });
      continue;
    }

    const payload = {
      id: book.bibliotecaId && book.bibliotecaId > 0 ? book.bibliotecaId : undefined,
      title: book.title.trim(),
      author: book.author ?? "",
      isbn: book.isbn ?? "",
      price: book.price ?? null,
      currency: book.currency ?? "DOP",
      stock: book.stock ?? 0,
      publisher: book.publisher ?? "",
      area_tema: book.area_tema ?? "",
      summary: book.summary ?? "",
      cover_url: book.coverUrl ?? "",
      product_type: "impreso",
      cms_slug: book.id,
    };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok || !data.id) {
        const err = formatUpsertError(res, data);
        updated.push({
          ...book,
          syncStatus: "error",
          syncError: String(err),
        });
        failed += 1;
        results.push({ cmsId: book.id, title: book.title, status: "error", error: String(err) });
        continue;
      }

      updated.push({
        ...book,
        bibliotecaId: Number(data.id),
        syncStatus: "synced",
        syncError: undefined,
        lastSyncedAt: now,
      });
      synced += 1;
      results.push({
        cmsId: book.id,
        title: book.title,
        status: "synced",
        bibliotecaId: Number(data.id),
      });
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      updated.push({
        ...book,
        syncStatus: "error",
        syncError: err,
      });
      failed += 1;
      results.push({ cmsId: book.id, title: book.title, status: "error", error: err });
    }
  }

  setPrintedBooks(doc, updated);

  const parts = [];
  if (synced > 0) parts.push(`${synced} sincronizado(s)`);
  if (skipped > 0) parts.push(`${skipped} ya en Biblioteca`);
  if (failed > 0) parts.push(`${failed} con error`);

  let message;
  if (failed === 0) {
    message =
      parts.length > 0
        ? parts.join("; ") + "."
        : "Sin cambios en el catálogo.";
  } else {
    message = `${parts.join("; ")}. Revise el panel del libro con error.`;
    if (failed > 0 && synced === 0 && skipped === 0) {
      message +=
        " Si el error es 404, falta activar bookstore_upsert.php en Biblioteca.";
    }
  }

  return {
    ok: failed === 0,
    synced,
    failed,
    skipped,
    results,
    message,
  };
}

/**
 * @param {string} draftPath
 * @param {object} config
 */
export async function syncEditorialDraftFile(draftPath, config, readJson, writeJson) {
  const doc = readJson(draftPath);
  const sync = await syncEditorialPrintedBooks(doc, config);
  doc.updatedAt = new Date().toISOString();
  writeJson(draftPath, doc);
  return sync;
}
