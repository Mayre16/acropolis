"use client";

import { useEffect } from "react";
import { useCmsEditMode } from "@/hooks/useCmsEditMode";
import { isCmsEditOrigin, type CmsEditMessage } from "@/lib/cms/edit-bridge";
import { runCoordinatedCmsPublish } from "@/lib/cms/publish-coordinator";

/** Un solo diálogo de publicación para todo el sitio en modo edición. */
export function CmsPublishCoordinator() {
  const editMode = useCmsEditMode();

  useEffect(() => {
    if (!editMode) return;

    function onMessage(ev: MessageEvent<CmsEditMessage>) {
      if (!isCmsEditOrigin(ev.origin)) return;
      const msg = ev.data;
      if (!msg || typeof msg !== "object") return;
      if (msg.type === "cms-publish") void runCoordinatedCmsPublish();
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [editMode]);

  return null;
}
