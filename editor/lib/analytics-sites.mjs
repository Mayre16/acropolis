/** Sitios con conteo de visitas en el CMS. */
export const ANALYTICS_SITE_IDS = [
  "acropolis",
  "civis",
  "editorial",
  "biblioteca",
];

export const ANALYTICS_SITE_LABELS = {
  acropolis: "Acrópolis (sitio principal)",
  civis: "Civis Consulting",
  editorial: "Librería Editorial Logos",
  biblioteca: "Biblioteca Sophia",
};

export function isAnalyticsSite(id) {
  return ANALYTICS_SITE_IDS.includes(id);
}
