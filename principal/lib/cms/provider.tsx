"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  isCmsEditOrigin,
  type CmsEditMessage,
} from "@/lib/cms/edit-bridge";
import { HeroCarouselCmsEditProvider } from "@/components/cms/HeroCarouselCmsEditContext";
import { CmsPublishCoordinator } from "@/components/cms/CmsPublishCoordinator";
import { SiteFooterCmsEditProvider } from "@/components/cms/SiteFooterCmsEditContext";
import { PlatformNavCmsEditProvider } from "@/components/cms/PlatformNavCmsEditContext";
import type { CmsDocument } from "@/lib/cms/types";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, "");
const CMS_SITE = "acropolis";

const CmsContext = createContext<CmsDocument | null>(null);

export function CmsProvider({ children }: { children: ReactNode }) {
  const [doc, setDoc] = useState<CmsDocument | null>(null);

  const loadPublished = useCallback(() => {
    if (!CMS_URL) return;
    fetch(`${CMS_URL}/content/${CMS_SITE}/published`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: CmsDocument | null) => {
        if (data?.version === 1) setDoc(data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadPublished();
  }, [loadPublished]);

  useEffect(() => {
    function onMessage(ev: MessageEvent<CmsEditMessage>) {
      if (!isCmsEditOrigin(ev.origin)) return;
      const msg = ev.data;
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "cms-published") loadPublished();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [loadPublished]);

  return (
    <CmsContext.Provider value={doc}>
      <Suspense fallback={null}>
        <CmsPublishCoordinator />
        <HeroCarouselCmsEditProvider>
          <SiteFooterCmsEditProvider>
            <PlatformNavCmsEditProvider>{children}</PlatformNavCmsEditProvider>
          </SiteFooterCmsEditProvider>
        </HeroCarouselCmsEditProvider>
      </Suspense>
    </CmsContext.Provider>
  );
}

export function useCmsDocument() {
  return useContext(CmsContext);
}

export function isCmsEnabled() {
  return Boolean(CMS_URL);
}
