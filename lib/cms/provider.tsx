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
import {
  EARLY_CMS_PUBLISHED_KEY,
  type EarlyCmsPublishedSlot,
} from "@/lib/cms/early-published-bootstrap";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, "");
const CMS_SITE = "acropolis";

export type CmsLoadStatus = "loading" | "ready";

const CmsContext = createContext<CmsDocument | null>(null);
const CmsStatusContext = createContext<CmsLoadStatus>(
  CMS_URL ? "loading" : "ready",
);

function earlySlot(): EarlyCmsPublishedSlot | undefined {
  if (typeof window === "undefined") return undefined;
  return window[EARLY_CMS_PUBLISHED_KEY as "__acropolisCmsPublished"];
}

function readEarlyPublished(): CmsDocument | null {
  const doc = earlySlot()?.doc;
  if (doc && typeof doc === "object" && (doc as CmsDocument).version === 1) {
    return doc as CmsDocument;
  }
  return null;
}

function earlyPublishedPromise(): Promise<CmsDocument | null> | null {
  const p = earlySlot()?.promise;
  if (!p || typeof p.then !== "function") return null;
  return p.then((data) => {
    if (data && typeof data === "object" && (data as CmsDocument).version === 1) {
      return data as CmsDocument;
    }
    return null;
  });
}

export function CmsProvider({ children }: { children: ReactNode }) {
  const [doc, setDoc] = useState<CmsDocument | null>(() => readEarlyPublished());
  const [status, setStatus] = useState<CmsLoadStatus>(() =>
    !CMS_URL || readEarlyPublished() ? "ready" : "loading",
  );

  const loadPublished = useCallback(() => {
    if (!CMS_URL) {
      setStatus("ready");
      return;
    }
    const apply = (data: CmsDocument | null) => {
      if (data?.version === 1) setDoc(data);
      setStatus("ready");
    };
    const early = earlyPublishedPromise();
    if (early) {
      early.then(apply).catch(() => setStatus("ready"));
      return;
    }
    fetch(`${CMS_URL}/content/${CMS_SITE}/published`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: CmsDocument | null) => apply(data))
      .catch(() => {
        setStatus("ready");
      });
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
      <CmsStatusContext.Provider value={status}>
        <Suspense fallback={null}>
          <CmsPublishCoordinator />
          <HeroCarouselCmsEditProvider>
            <SiteFooterCmsEditProvider>
              <PlatformNavCmsEditProvider>{children}</PlatformNavCmsEditProvider>
            </SiteFooterCmsEditProvider>
          </HeroCarouselCmsEditProvider>
        </Suspense>
      </CmsStatusContext.Provider>
    </CmsContext.Provider>
  );
}

export function useCmsDocument() {
  return useContext(CmsContext);
}

/** `loading` mientras llega el JSON publicado; evita flash de fotos del repo. */
export function useCmsStatus() {
  return useContext(CmsStatusContext);
}

export function isCmsEnabled() {
  return Boolean(CMS_URL);
}

/** True cuando ya se puede decidir entre CMS y fallback del repo. */
export function useCmsMediaReady() {
  const status = useCmsStatus();
  return !isCmsEnabled() || status === "ready";
}
