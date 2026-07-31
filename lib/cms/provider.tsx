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
import { CmsChromeEditGate } from "@/components/cms/CmsChromeEditGate";
import { CmsPublishCoordinator } from "@/components/cms/CmsPublishCoordinator";
import type { CmsDocument } from "@/lib/cms/types";
import {
  EARLY_CMS_PUBLISHED_KEY,
  type EarlyCmsPublishedSlot,
} from "@/lib/cms/early-published-bootstrap";
import acropolisPublishedSnapshot from "@/data/acropolis/published.json";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, "");
const CMS_SITE = "acropolis";

export type CmsLoadStatus = "loading" | "ready";

const CmsContext = createContext<CmsDocument | null>(null);
const CmsStatusContext = createContext<CmsLoadStatus>("ready");

function snapshotPublished(): CmsDocument | null {
  const doc = acropolisPublishedSnapshot as CmsDocument;
  if (doc && typeof doc === "object" && doc.version === 1) return doc;
  return null;
}

const BUNDLED_PUBLISHED = snapshotPublished();

function earlySlot(): EarlyCmsPublishedSlot | undefined {
  if (typeof window === "undefined") return undefined;
  return window[EARLY_CMS_PUBLISHED_KEY as "__acropolisCmsPublished"];
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

function isNewerPublished(next: CmsDocument, current: CmsDocument | null): boolean {
  if (!current?.updatedAt) return true;
  if (!next.updatedAt) return true;
  return next.updatedAt >= current.updatedAt;
}

export function CmsProvider({ children }: { children: ReactNode }) {
  // Snapshot del build: listo en el primer paint (SSR = cliente). La API
  // solo refresca en segundo plano; no bloquea mediaReady / LCP.
  const [doc, setDoc] = useState<CmsDocument | null>(() => BUNDLED_PUBLISHED);
  const [status, setStatus] = useState<CmsLoadStatus>(() =>
    !CMS_URL || BUNDLED_PUBLISHED ? "ready" : "loading",
  );

  const loadPublished = useCallback(() => {
    if (!CMS_URL) {
      setStatus("ready");
      return;
    }
    const apply = (data: CmsDocument | null) => {
      if (data?.version === 1) {
        setDoc((prev) => (isNewerPublished(data, prev) ? data : prev));
      }
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
        {/* Suspense solo para el coordinador — no envolver children (rompe SSR/LCP). */}
        <Suspense fallback={null}>
          <CmsPublishCoordinator />
        </Suspense>
        <CmsChromeEditGate>{children}</CmsChromeEditGate>
      </CmsStatusContext.Provider>
    </CmsContext.Provider>
  );
}

export function useCmsDocument() {
  return useContext(CmsContext);
}

/** `loading` solo si no hay snapshot ni CMS desactivado; el refresh no bloquea. */
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
