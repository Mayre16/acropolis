import type { CmsDocument } from "@/lib/cms/types";

export function cmsApiBase() {
  return (
    process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, "") ||
    "http://localhost:3401"
  );
}

export function resolveCmsMediaUrl(src?: string): string | undefined {
  if (!src) return undefined;
  const uploadPath = src.match(
    /(\/uploads\/(?:acropolis|civis)\/[^\s"?#]+)/,
  )?.[1];
  if (uploadPath) return `${cmsApiBase()}${uploadPath}`;
  if (src.startsWith("http://") || src.startsWith("https://")) return src;
  if (src.startsWith("/uploads/")) return `${cmsApiBase()}${src}`;
  return src;
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

export async function fetchCmsDraft(site: "acropolis" | "civis"): Promise<CmsDocument> {
  const res = await fetch(`${cmsApiBase()}/content/${site}/draft`, {
    cache: "no-store",
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
): Promise<void> {
  const res = await fetch(`${cmsApiBase()}/content/${site}/publish`, {
    method: "POST",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Error al publicar");
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
