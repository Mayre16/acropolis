"use client";

import { useEffect } from "react";
import { isCmsEditOrigin, type CmsEditMessage } from "@/lib/cms/edit-bridge";
import { registerCmsDraftSaver } from "@/lib/cms/publish-coordinator";

/** Registra el guardado de borrador y escucha «Guardar» del editor. */
export function useCmsEditBridge(saveDraft: () => Promise<void>) {
  useEffect(() => {
    const unregister = registerCmsDraftSaver(saveDraft);
    return () => {
      unregister();
    };
  }, [saveDraft]);

  useEffect(() => {
    function onMessage(ev: MessageEvent<CmsEditMessage>) {
      if (!isCmsEditOrigin(ev.origin)) return;
      const msg = ev.data;
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "cms-save") void saveDraft();
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [saveDraft]);
}
