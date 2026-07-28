"use client";

import { useLayoutEffect, useState } from "react";
import {
  isCmsEditOrigin,
  type CmsEditMessage,
} from "@/lib/cms/edit-bridge";
import {
  CMS_EDIT_EMBEDDED_CLASS,
  isInEditorIframe,
} from "@/lib/cms/edit-mode";

function readEmbeddedInEditor(): boolean {
  if (typeof window === "undefined") return false;
  return (
    isInEditorIframe() ||
    document.documentElement.classList.contains(CMS_EDIT_EMBEDDED_CLASS)
  );
}

/** True cuando la página está en un iframe del editor (3400). */
export function useCmsEditorEmbedded() {
  const [embedded, setEmbedded] = useState(false);

  useLayoutEffect(() => {
    if (readEmbeddedInEditor()) setEmbedded(true);

    function onMessage(ev: MessageEvent<CmsEditMessage>) {
      if (!isCmsEditOrigin(ev.origin)) return;
      if (ev.data?.type === "cms-edit-init") setEmbedded(true);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return embedded;
}
