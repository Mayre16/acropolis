import { assetUrl } from "@/lib/asset-url";
import type { CmsDocument } from "@/lib/cms/types";
import { getCmsEditSession } from "@/lib/cms/edit-session";

const DEFAULT_CMS_API = "https://editor.acropolis.adesa.com.do/api";

export type CmsDeployStatus = {
  queued?: boolean;
  site?: string;
  reason?: string;
  status?: number;
  detail?: string;
};

export type CmsPublishResult = {
  ok?: boolean;
  deploy?: CmsDeployStatus;
  message?: string;
};

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

/** Raíz del editor (sin /api) — las imágenes CMS van en /uploads/… */
export function cmsEditorOrigin() {
  return cmsApiBase().replace(/\/api$/i, "");
}

export function resolveCmsMediaUrl(src?: string): string | undefined {
  if (!src) return undefined;
  const uploadPath = src.match(
    /(\/uploads\/(?:acropolis|civis)\/[^\s"?#]+)/,
  )?.[1];
  if (uploadPath) return `${cmsEditorOrigin()}${uploadPath}`;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/uploads/")) return `${cmsEditorOrigin()}${src}`;
  return assetUrl(src);
}

/** Ruta sugerida al subir o pegar una imagen del CMS. */
export function cmsUploadPathExample(site: "acropolis" | "civis") {
  return `/uploads/${site}/mi-foto.webp`;
}

function authHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchCmsDraft(
  site: "acropolis" | "civis",
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
  site: "acropolis" | "civis",
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

export async function publishCms(
  site: "acropolis" | "civis",
  token: string,
): Promise<CmsPublishResult> {
  const res = await fetch(`${cmsApiBase()}/content/${site}/publish`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al publicar");
  const result = (await res.json()) as CmsPublishResult;
  const { notifyCmsPublishSuccess } = await import("@/lib/cms/publish-notify");
  notifyCmsPublishSuccess(result);
  return result;
}

export async function uploadCmsImage(
  site: "acropolis" | "civis",
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
  const rel = url.match(/(\/uploads\/(?:acropolis|civis)\/[^\s"?#]+)/)?.[1];
  if (rel) return rel;
  return url;
}
