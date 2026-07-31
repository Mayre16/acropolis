"use client";

import { createContext, useContext } from "react";
import type { CmsPlatformNav } from "@/lib/cms/types";
import type { PlatformId } from "@/lib/site-config";

export type PlatformNavCmsEditContextValue = {
  ready: boolean;
  panelOpen: boolean;
  openPanel: () => void;
  closePanel: () => void;
  platformNav: CmsPlatformNav;
  setPlatformVisible: (id: PlatformId, visible: boolean) => void;
  setPlatformUrl: (id: PlatformId, url: string) => void;
  applyGithubUrls: () => void;
  saveDraft: () => Promise<void>;
  dirty: boolean;
  busy: boolean;
};

export const PlatformNavCmsEditContext =
  createContext<PlatformNavCmsEditContextValue | null>(null);

export function usePlatformNavCmsEdit() {
  return useContext(PlatformNavCmsEditContext);
}
