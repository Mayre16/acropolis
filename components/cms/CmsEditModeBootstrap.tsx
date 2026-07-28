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
  resolveEditModeForPath,
} from "@/lib/cms/edit-mode";

/**
 * Mantiene el modo edición al navegar por el sitio dentro del iframe del editor:
 * guarda cmsEdit en sessionStorage, añade el parámetro a los enlaces internos y
 * pide al editor que reenvíe el token al cambiar de página.
 *
 * Navegación con recarga completa (no App Router): en export estático + iframe,
 * router.push no actualiza bien la URL ni carga la página destino.
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

      const a = (e.target as HTMLElement).closest("a[href]");
      if (!a) return;
      const anchor = a as HTMLAnchorElement;
      if (anchor.hasAttribute("download") || anchor.target === "_blank") return;

      const raw = a.getAttribute("href");
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
      const mode = resolveEditModeForPath(stored, url.pathname);
      url.searchParams.set("cmsEdit", mode);
      persistCmsEditMode(mode);
      window.location.assign(url.toString());
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  /** Next 15 muestra "[object Event]" cuando falla un chunk/recurso sin mensaje. */
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const onRejection = (event: PromiseRejectionEvent) => {
      if (!(event.reason instanceof Event)) return;
      event.preventDefault();
      console.warn(
        "[CMS dev] Recurso o chunk no cargó. Recarga con Ctrl+Shift+R si la vista falla.",
      );
    };

    const onError = (event: ErrorEvent) => {
      if (event.error) return;
      event.preventDefault();
    };

    window.addEventListener("unhandledrejection", onRejection);
    window.addEventListener("error", onError, true);
    return () => {
      window.removeEventListener("unhandledrejection", onRejection);
      window.removeEventListener("error", onError, true);
    };
  }, []);

  return null;
}
