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
    const href = platformEffectiveUrl(id);
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
