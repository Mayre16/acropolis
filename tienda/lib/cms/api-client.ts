import type { CmsDocument, SiteId } from "@/lib/cms/types";
import { getCmsEditSession } from "@/lib/cms/edit-session";

const DEFAULT_CMS_API = "https://editor.acropolis.adesa.com.do/api";

export function cmsApiBase() {
  const fromEnv = process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:3401";
    }
  }
  return DEFAULT_CMS_API;
}

export function cmsEditorOrigin() {
  return cmsApiBase().replace(/\/api$/i, "");
}

export function resolveCmsMediaUrl(src?: string): string | undefined {
  if (!src) return undefined;
  // Portadas del catálogo impreso: viven en la tienda, no en el CMS.
  if (src.startsWith("/uploads/bookstore_covers/")) return src;
  const uploadPath = src.match(
    /(\/uploads\/(?:acropolis|civis|editorial)\/[^\s"?#]+)/,
  )?.[1];
  if (uploadPath) return `${cmsEditorOrigin()}${uploadPath}`;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/uploads/")) return `${cmsEditorOrigin()}${src}`;
  return src;
}

export function cmsUploadPathExample(site: SiteId) {
  return `/uploads/${site}/mi-foto.webp`;
}

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchCmsDraft(
  site: SiteId,
  token?: string,
): Promise<CmsDocument> {
  const bearer = token ?? getCmsEditSession()?.token;
  const headers: HeadersInit = bearer
    ? { Authorization: `Bearer ${bearer}` }
    : {};
  const res = await fetch(`${cmsApiBase()}/content/${site}/draft`, {
    cache: "no-store",
    headers,
  });
  if (!res.ok) throw new Error("No se pudo cargar el borrador");
  return res.json() as Promise<CmsDocument>;
}

export async function saveCmsDraft(
  site: SiteId,
  token: string,
  doc: CmsDocument,
): Promise<void> {
  const res = await fetch(`${cmsApiBase()}/content/${site}/draft`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(doc),
  });
  if (!res.ok) throw new Error("Error al guardar borrador");
}

export type BookstoreSyncResult = {
  ok: boolean;
  synced?: number;
  failed?: number;
  skipped?: number;
  message?: string;
  results?: Array<{
    cmsId?: string;
    title?: string;
    status: string;
    bibliotecaId?: number;
    error?: string;
    reason?: string;
  }>;
};

export async function publishCms(
  site: SiteId,
  token: string,
): Promise<BookstoreSyncResult | null> {
  const res = await fetch(`${cmsApiBase()}/content/${site}/publish`, {
    method: "POST",
    headers: authHeaders(token),
  });
  const data = (await res.json().catch(() => ({}))) as {
    bookstoreSync?: BookstoreSyncResult;
    message?: string;
    error?: string;
  };
  if (!res.ok) {
    throw new Error(data.error || data.message || "Error al publicar");
  }
  return data.bookstoreSync ?? null;
}

export async function syncEditorialBooksCms(
  token: string,
): Promise<BookstoreSyncResult> {
  const res = await fetch(`${cmsApiBase()}/content/editorial/sync-books`, {
    method: "POST",
    headers: authHeaders(token),
  });
  const data = (await res.json().catch(() => ({}))) as {
    bookstoreSync?: BookstoreSyncResult;
    error?: string;
  };
  if (!res.ok && !data.bookstoreSync) {
    throw new Error(data.error || "Error al sincronizar libros");
  }
  return data.bookstoreSync ?? { ok: false, message: "Sin respuesta de sync" };
}

export async function uploadCmsImage(
  site: SiteId,
  token: string,
  file: File,
): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${cmsApiBase()}/upload/${site}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: fd,
  });
  if (!res.ok) throw new Error("Error al subir imagen");
  const data = (await res.json()) as { url: string };
  const url = data.url;
  if (url.startsWith("/uploads/")) return url;
  const rel = url.match(
    /(\/uploads\/(?:acropolis|civis|editorial)\/[^\s"?#]+)/,
  )?.[1];
  if (rel) return rel;
  return url;
}
