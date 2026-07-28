"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { CIRCULO_INSCRIPCION_HASH } from "@/lib/circulo-amigos-content";
import {
  isCirculoHomePath,
  scrollToCirculoInscripcionSection,
} from "@/lib/circulo-inscribete-nav";

/** En home, #inscribete hace scroll a la tarjeta «¿Listo para dar el paso?». */
export function CirculoInscripcionHashListener() {
  const pathname = usePathname();
  const onHome = isCirculoHomePath(pathname);

  useEffect(() => {
    if (!onHome || typeof window === "undefined") return;

    const matchesHash = () =>
      window.location.hash === `#${CIRCULO_INSCRIPCION_HASH}`;

    const syncFromHash = () => {
      if (matchesHash()) scrollToCirculoInscripcionSection();
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [onHome, pathname]);

  return null;
}
