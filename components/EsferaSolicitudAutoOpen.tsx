"use client";

import { useEffect, useState } from "react";
import { SolicitudEsferaModal } from "@/components/SolicitudEsferaDialog";

const OPEN_FLAG = "esfera-open-solicitud";

export function EsferaSolicitudAutoOpen() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(OPEN_FLAG) === "1") {
      sessionStorage.removeItem(OPEN_FLAG);
      setOpen(true);
    }
  }, []);

  return <SolicitudEsferaModal open={open} onClose={() => setOpen(false)} />;
}

export function markEsferaSolicitudOpen() {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(OPEN_FLAG, "1");
  }
}
