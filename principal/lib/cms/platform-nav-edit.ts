import {
  platformEffectiveUrl,
  platformIsExternal,
  type PlatformId,
} from "@/lib/site-config";
import type { CmsDocument, CmsPlatformNav } from "@/lib/cms/types";

export const PLATFORM_NAV_PANEL_ID = "__platform_nav__";

export const DEFAULT_PLATFORM_NAV: CmsPlatformNav = {
  hidden: [],
};

/** Etiquetas de la bandeja verde superior (pueden diferir de PLATAFORMAS). */
export const PLATFORM_NAV_LABELS: Record<PlatformId, string> = {
  biblioteca: "Biblioteca",
  tienda: "Librería Editorial Logos",
  civis: "Civis",
};

export const PLATFORM_NAV_ORDER: PlatformId[] = ["biblioteca", "tienda", "civis"];

/** URLs de producción en código (adesa). Se muestran como referencia en el editor. */
export const PLATFORM_NAV_DEFAULT_URLS: Record<PlatformId, string> = {
  biblioteca: "https://biblioteca-oina.adesa.com.do",
  civis: "https://civis.acropolis.adesa.com.do",
  tienda: "https://tienda.acropolis.adesa.com.do",
};

/** Preview GitHub Pages (civis y tienda). Biblioteca sigue en adesa. */
export const PLATFORM_NAV_GITHUB_URLS: Record<PlatformId, string> = {
  biblioteca: PLATFORM_NAV_DEFAULT_URLS.biblioteca,
  civis: "https://mayre16.github.io/acropolis/civis/",
  tienda: "https://mayre16.github.io/acropolis/tienda/",
};

export function resolvePlatformNavHref(
  id: PlatformId,
  partial: CmsPlatformNav = {},
): string {
  const override = partial.urls?.[id]?.trim();
  if (override) return override;
  return platformEffectiveUrl(id);
}

export type PlatformNavItem = {
  id: PlatformId;
  label: string;
  href: string;
  external: boolean;
};

export function mergePlatformNavItems(
  partial: CmsPlatformNav = {},
): PlatformNavItem[] {
  const hidden = new Set(partial.hidden ?? []);
  return PLATFORM_NAV_ORDER.filter((id) => !hidden.has(id)).map((id) => {
    const href = resolvePlatformNavHref(id, partial);
    return {
      id,
      label: PLATFORM_NAV_LABELS[id],
      href,
      external: platformIsExternal(href),
    };
  });
}

export function mergePlatformNav(cms?: CmsDocument | null): PlatformNavItem[] {
  return mergePlatformNavItems(cms?.sections.platformNav);
}

export function buildDocWithPlatformNav(
  base: CmsDocument,
  platformNav: CmsPlatformNav,
): CmsDocument {
  return {
    ...base,
    sections: {
      ...base.sections,
      platformNav,
    },
  };
}

export function isPlatformNavVisible(
  nav: CmsPlatformNav,
  id: PlatformId,
): boolean {
  return !(nav.hidden ?? []).includes(id);
}

export function setPlatformNavVisible(
  nav: CmsPlatformNav,
  id: PlatformId,
  visible: boolean,
): CmsPlatformNav {
  const hidden = new Set(nav.hidden ?? []);
  if (visible) hidden.delete(id);
  else hidden.add(id);
  return { ...nav, hidden: [...hidden] };
}

export function setPlatformNavUrl(
  nav: CmsPlatformNav,
  id: PlatformId,
  url: string,
): CmsPlatformNav {
  const trimmed = url.trim();
  const urls = { ...(nav.urls ?? {}) };
  if (trimmed) urls[id] = trimmed;
  else delete urls[id];
  return {
    ...nav,
    urls: Object.keys(urls).length > 0 ? urls : undefined,
  };
}

export function applyPlatformNavGithubUrls(nav: CmsPlatformNav): CmsPlatformNav {
  return {
    ...nav,
    urls: { ...nav.urls, ...PLATFORM_NAV_GITHUB_URLS },
  };
}
