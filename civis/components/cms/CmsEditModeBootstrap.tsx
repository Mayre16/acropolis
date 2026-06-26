"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { isCmsEditOrigin, postToEditor, type CmsEditMessage } from "@/lib/cms/edit-bridge";
import { setCmsEditSession } from "@/lib/cms/edit-session";
import {
  CMS_EDIT_STORAGE_KEY,
  isInEditorIframe,
  parseCmsEditParam,
  persistCmsEditMode,
  readStoredCmsEditMode,
} from "@/lib/cms/edit-mode";

/**
 * Mantiene el modo edición al navegar por Civis dentro del iframe del editor.
 * Recarga completa para que la URL y el HTML destino coincidan (export estático).
 */
export function CmsEditModeBootstrap() {
  const pathname = usePathname();
  const params = useSearchParams();
  const param = parseCmsEditParam(params.get("cmsEdit"));

  useLayoutEffect(() => {
    if (!isInEditorIframe()) return;

    function onMessage(ev: MessageEvent<CmsEditMessage>) {
      if (!isCmsEditOrigin(ev.origin)) return;
      const msg = ev.data;
      if (!msg || typeof msg !== "object" || msg.type !== "cms-edit-init") return;
      setCmsEditSession({ token: msg.token, site: msg.site });
    }

    window.addEventListener("message", onMessage);
    postToEditor({ type: "cms-request-init" });
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (param) {
      persistCmsEditMode(param);
      return;
    }
    if (!isInEditorIframe()) {
      sessionStorage.removeItem(CMS_EDIT_STORAGE_KEY);
    }
  }, [param]);

  useEffect(() => {
    if (!isInEditorIframe()) return;
    const stored = readStoredCmsEditMode();
    if (!stored || param) return;
    const url = new URL(window.location.href);
    if (url.searchParams.get("cmsEdit") === stored) return;
    url.searchParams.set("cmsEdit", stored);
    window.location.replace(url.toString());
  }, [param, pathname]);

  useEffect(() => {
    if (!isInEditorIframe()) return;
    const stored = readStoredCmsEditMode();
    if (!stored && !param) return;
    postToEditor({ type: "cms-request-init" });
  }, [pathname, param]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!isInEditorIframe()) return;
      const stored = readStoredCmsEditMode();
      if (!stored) return;

      const anchor = (e.target as HTMLElement).closest("a[href]");
      if (!anchor) return;
      if (anchor.hasAttribute("download") || anchor.getAttribute("target") === "_blank") {
        return;
      }

      const raw = anchor.getAttribute("href");
      if (
        !raw ||
        raw.startsWith("#") ||
        raw.startsWith("mailto:") ||
        raw.startsWith("tel:")
      ) {
        return;
      }

      let url: URL;
      try {
        url = new URL(raw, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;

      e.preventDefault();
      e.stopPropagation();
      url.searchParams.set("cmsEdit", stored);
      window.location.assign(url.toString());
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
