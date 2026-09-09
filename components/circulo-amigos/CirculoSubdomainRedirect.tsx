"use client";

import { useEffect } from "react";
import { PLATFORM_PRODUCTION_URLS } from "@/lib/site-config";

const CIRCULO_ORIGIN = PLATFORM_PRODUCTION_URLS.circulo.replace(/\/$/, "");

type Props = {
  /** Ruta en el subdominio, ej. `/` o `/quienes-somos/`. */
  toPath?: string;
};

/**
 * Export estático: no hay redirects de Next. Esta página manda al
 * sitio oficial del Círculo (subdominio).
 */
export function CirculoSubdomainRedirect({ toPath = "/" }: Props) {
  const path = toPath.startsWith("/") ? toPath : `/${toPath}`;
  const href = `${CIRCULO_ORIGIN}${path.endsWith("/") ? path : `${path}/`}`;

  useEffect(() => {
    window.location.replace(href);
  }, [href]);

  return (
    <main className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center gap-4 px-4 py-20 text-center">
      <p className="text-sm font-semibold text-na-muted">
        El Círculo de Amigos tiene su propio sitio.
      </p>
      <p className="text-lg font-bold text-na-heketDark">Redirigiendo…</p>
      <a
        href={href}
        className="text-sm font-bold text-na-kefer underline underline-offset-2"
      >
        Ir a {href}
      </a>
    </main>
  );
}
