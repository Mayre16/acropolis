import type { ReactNode } from "react";

/** Requerido con `output: export` — sitios con panel de estadísticas. */
export function generateStaticParams() {
  return [
    { site: "acropolis" },
    { site: "civis" },
    { site: "editorial" },
    { site: "circulodeamigos" },
    { site: "biblioteca" },
  ];
}

export default function AnalyticsSiteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
