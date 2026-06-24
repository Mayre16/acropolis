import type { ReactNode } from "react";

/** Requerido con `output: export` — sitios editables en el CMS. */
export function generateStaticParams() {
  return [{ site: "acropolis" }, { site: "civis" }, { site: "editorial" }];
}

export default function EditSiteLayout({ children }: { children: ReactNode }) {
  return children;
}
