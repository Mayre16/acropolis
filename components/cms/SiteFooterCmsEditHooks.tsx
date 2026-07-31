"use client";

import { createContext, useContext } from "react";
import type { CmsSiteFooter } from "@/lib/cms/types";

export type SiteFooterCmsEditContextValue = {
  ready: boolean;
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  footer: CmsSiteFooter;
  patchFooter: (patch: Partial<CmsSiteFooter>) => void;
  saveDraft: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
};

export const SiteFooterCmsEditContext =
  createContext<SiteFooterCmsEditContextValue | null>(null);

export function useSiteFooterCmsEdit() {
  return useContext(SiteFooterCmsEditContext);
}
