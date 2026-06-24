import type { SiteId } from "@/lib/content-types";

export type DashboardSiteKey = SiteId;

export type DashboardSiteConfig = {
  id: DashboardSiteKey;
  label: string;
  subtitle: string;
  buttonClass: string;
  accentClass: string;
  ctaClass: string;
  cmsReady: boolean;
};

export const DASHBOARD_SITES: DashboardSiteConfig[] = [
  {
    id: "acropolis",
    label: "Acrópolis",
    subtitle: "Sitio principal",
    buttonClass:
      "bg-site-acropolis text-white shadow-md hover:bg-site-acropolis-dark",
    accentClass: "border-t-4 border-site-acropolis",
    ctaClass: "bg-site-acropolis text-white hover:bg-site-acropolis-dark",
    cmsReady: true,
  },
  {
    id: "civis",
    label: "Civis",
    subtitle: "Civis Consulting",
    buttonClass:
      "bg-site-civis text-white shadow-md hover:bg-site-civis-dark",
    accentClass: "border-t-4 border-site-civis",
    ctaClass: "bg-site-civis text-white hover:bg-site-civis-dark",
    cmsReady: true,
  },
  {
    id: "editorial",
    label: "Librería Editorial",
    subtitle: "Tienda Editorial Logos",
    buttonClass:
      "bg-site-editorial text-white shadow-md hover:bg-site-editorial-dark",
    accentClass: "border-t-4 border-site-editorial",
    ctaClass: "bg-site-editorial text-white hover:bg-site-editorial-dark",
    cmsReady: true,
  },
];

export function dashboardSiteAnchor(id: DashboardSiteKey) {
  return `site-${id}`;
}
