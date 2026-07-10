export type AnalyticsSiteId =
  | "acropolis"
  | "civis"
  | "editorial"
  | "circulodeamigos"
  | "biblioteca";

export type AnalyticsDailyPoint = {
  date: string;
  views: number;
  visitors: number;
};

export type AnalyticsChartPoint = {
  label: string;
  views: number;
  visitors: number;
  compareViews: number;
  compareVisitors: number;
};

export type AnalyticsChartSeries = {
  mode: "month" | "year" | "week" | "hours" | string;
  title: string;
  currentLabel: string;
  compareLabel: string;
  points: AnalyticsChartPoint[];
};

export type AnalyticsTopPage = {
  path: string;
  views: number;
  avgDurationSec: number;
  totalDurationSec?: number;
};

export type AnalyticsTopSection = {
  path: string;
  section: string;
  views: number;
  avgDurationSec: number;
};

export type AnalyticsFormBreakdown = {
  formKey: string;
  count: number;
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
  avgTimePerVisitorSec?: number;
  formSubmissions?: number;
  whatsappClicks?: number;
  mostVisitedPage?: AnalyticsTopPage | null;
  longestPage?: AnalyticsTopPage | null;
  changeViewsPct?: number;
  changeVisitorsPct?: number;
  changeViewsYoYPct?: number;
  changeVisitorsYoYPct?: number;
  changeFormsPct?: number;
  changeWhatsappPct?: number;
  daily?: AnalyticsDailyPoint[];
  topPages?: AnalyticsTopPage[];
  topPagesByTime?: AnalyticsTopPage[];
  topSections?: AnalyticsTopSection[];
  formBreakdown?: AnalyticsFormBreakdown[];
  charts?: {
    monthCompare?: AnalyticsChartSeries;
    yearCompare?: AnalyticsChartSeries;
    weekCompare?: AnalyticsChartSeries;
    hours?: AnalyticsChartSeries;
  };
};

export const ANALYTICS_SITE_LABELS: Record<AnalyticsSiteId, string> = {
  acropolis: "Acrópolis",
  civis: "Civis Consulting",
  editorial: "Librería Editorial Logos",
  circulodeamigos: "Círculo de Amigos",
  biblioteca: "Biblioteca Sophia",
};

export const ANALYTICS_FORM_LABELS: Record<string, string> = {
  curso_info: "Cursos — solicitud de información",
  salon_inquiry: "Salones — consulta",
  voluntariado_donacion: "Voluntariado — donación",
  voluntariado_solicitud: "Voluntariado — inscripción",
  esfera_donar: "Esfera — donar",
  esfera_alianzas: "Esfera — alianzas",
  esfera_info: "Esfera — información",
  esfera_solicitud: "Esfera — solicitud de taller",
  viaje_info: "Viajes — información",
  circulo_amigos_inscription: "Círculo — inscripción",
  civis_solicitud: "Civis — solicitud de propuesta",
  form: "Formulario",
};
