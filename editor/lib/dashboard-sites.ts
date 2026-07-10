import type { SiteId } from "@/lib/content-types";

export type DashboardSiteKey = SiteId;

export type DashboardSiteConfig = {
  id: DashboardSiteKey;
  label: string;
  subtitle: string;
  buttonClass: string;
  accentClass: string;
  /** Línea bajo el título del cuadro (mismo color del sitio). */
  headerLineClass: string;
  ctaClass: string;
  cmsReady: boolean;
};

export const DASHBOARD_SITES: DashboardSiteConfig[] = [
  {
    id: "acropolis",
    label: "Acrópolis",
    subtitle: "Sitio oficial",
    buttonClass:
      "bg-site-acropolis text-white shadow-md hover:bg-site-acropolis-dark",
    accentClass: "border-t-4 border-t-site-acropolis",
    headerLineClass: "border-site-acropolis",
    ctaClass: "bg-site-acropolis text-white hover:bg-site-acropolis-dark",
    cmsReady: true,
  },
  {
    id: "civis",
    label: "Civis",
    subtitle: "Civis Consulting",
    buttonClass:
      "bg-site-civis text-white shadow-md hover:bg-site-civis-dark",
    accentClass: "border-t-4 border-t-site-civis",
    headerLineClass: "border-site-civis",
    ctaClass: "bg-site-civis text-white hover:bg-site-civis-dark",
    cmsReady: true,
  },
  {
    id: "editorial",
    label: "Librería Editorial",
    subtitle: "Tienda Editorial Logos",
    buttonClass:
      "bg-site-editorial text-white shadow-md hover:bg-site-editorial-dark",
    accentClass: "border-t-4 border-t-site-editorial",
    headerLineClass: "border-site-editorial",
    ctaClass: "bg-site-editorial text-white hover:bg-site-editorial-dark",
    cmsReady: true,
  },
  {
    id: "circulodeamigos",
    label: "Círculo de Amigos",
    subtitle: "Sitio del Círculo de Amigos",
    buttonClass:
      "bg-site-circulodeamigos text-white shadow-md hover:bg-site-circulodeamigos-dark",
    accentClass: "border-t-4 border-t-site-circulodeamigos",
    headerLineClass: "border-site-circulodeamigos",
    ctaClass:
      "bg-site-circulodeamigos text-white hover:bg-site-circulodeamigos-dark",
    cmsReady: true,
  },
];

export function dashboardSiteAnchor(id: DashboardSiteKey) {
  return `site-${id}`;
}
