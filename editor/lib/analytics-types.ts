export type AnalyticsSiteId =
  | "acropolis"
  | "civis"
  | "editorial"
  | "biblioteca";

export type AnalyticsDailyPoint = {
  date: string;
  views: number;
  visitors: number;
};

export type AnalyticsTopPage = {
  path: string;
  views: number;
  avgDurationSec: number;
};

export type AnalyticsTopSection = {
  path: string;
  section: string;
  views: number;
  avgDurationSec: number;
};

export type AnalyticsSummary = {
  ok: boolean;
  error?: string;
  site?: AnalyticsSiteId;
  period?: {
    year: number;
    month: number;
    from: string;
    to: string;
    label: string;
  };
  views?: number;
  visitors?: number;
  viewsPerVisitor?: number;
  changeViewsPct?: number;
  changeVisitorsPct?: number;
  daily?: AnalyticsDailyPoint[];
  topPages?: AnalyticsTopPage[];
  topSections?: AnalyticsTopSection[];
};

export const ANALYTICS_SITE_LABELS: Record<AnalyticsSiteId, string> = {
  acropolis: "Acrópolis (sitio principal)",
  civis: "Civis Consulting",
  editorial: "Librería Editorial Logos",
  biblioteca: "Biblioteca Sophia",
};
