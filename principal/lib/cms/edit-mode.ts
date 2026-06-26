/** Persiste el modo edición visual al navegar dentro del iframe del editor. */

export const CMS_EDIT_STORAGE_KEY = "acropolis-cms-edit";

export type CmsEditMode = "1" | "medios";

export function readStoredCmsEditMode(): CmsEditMode | null {
  if (typeof window === "undefined") return null;
  const v = sessionStorage.getItem(CMS_EDIT_STORAGE_KEY);
  return v === "1" || v === "medios" ? v : null;
}

export function persistCmsEditMode(mode: CmsEditMode | null) {
  if (typeof window === "undefined") return;
  if (mode) sessionStorage.setItem(CMS_EDIT_STORAGE_KEY, mode);
  else sessionStorage.removeItem(CMS_EDIT_STORAGE_KEY);
}

export function parseCmsEditParam(
  value: string | null | undefined,
): CmsEditMode | null {
  return value === "1" || value === "medios" ? value : null;
}

/** Quita NEXT_PUBLIC_BASE_PATH; Next lo vuelve a prefijar en router.push/replace. */
export function pathnameForAppRouter(pathname: string): string {
  const base = (process.env.NEXT_PUBLIC_BASE_PATH ?? "").replace(/\/$/, "");
  if (!base) return pathname;
  if (pathname === base) return "/";
  if (pathname.startsWith(`${base}/`)) {
    const rest = pathname.slice(base.length);
    return rest || "/";
  }
  return pathname;
}

/** Al salir de /articulos en modo «medios», el resto del sitio usa edición completa. */
export function resolveEditModeForPath(
  mode: CmsEditMode,
  pathname: string,
): CmsEditMode {
  const route = pathnameForAppRouter(pathname);
  if (mode === "medios" && !route.startsWith("/articulos")) {
    return "1";
  }
  return mode;
}

export function isInEditorIframe() {
  if (typeof window === "undefined") return false;
  return window.parent !== window.self;
}

/** Normaliza rutas con o sin barra final (Next `trailingSlash: true`). */
export function normalizeAppPath(pathname: string): string {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/$/, "");
}

export function matchesAppPath(pathname: string, route: string): boolean {
  return normalizeAppPath(pathname) === normalizeAppPath(route);
}
