"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { CmsDocument } from "@/lib/cms/types";
import { isCmsEditOrigin, type CmsEditMessage } from "@/lib/cms/edit-bridge";

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL?.replace(/\/$/, "");
const CMS_SITE = "circulodeamigos";

const CmsContext = createContext<CmsDocument | null>(null);

export function CmsProvider({ children }: { children: ReactNode }) {
  const [doc, setDoc] = useState<CmsDocument | null>(null);

  function loadPublished() {
    if (!CMS_URL) return;
    fetch(`${CMS_URL}/content/${CMS_SITE}/published`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data: CmsDocument | null) => {
        if (data?.site === CMS_SITE) setDoc(data);
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadPublished();
  }, []);

  useEffect(() => {
    function onMessage(ev: MessageEvent<CmsEditMessage>) {
      if (!isCmsEditOrigin(ev.origin)) return;
      if (ev.data?.type === "cms-published") loadPublished();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return <CmsContext.Provider value={doc}>{children}</CmsContext.Provider>;
}

export function useCmsDocument() {
  return useContext(CmsContext);
}

export function isCmsEnabled() {
  return Boolean(CMS_URL);
}
