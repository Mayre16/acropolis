/** Sitios con conteo de visitas en el CMS. */
export const ANALYTICS_SITE_IDS = [
  "acropolis",
  "civis",
  "editorial",
  "circulodeamigos",
  "biblioteca",
];

export const ANALYTICS_SITE_LABELS = {
  acropolis: "Acrópolis",
  civis: "Civis Consulting",
  editorial: "Librería Editorial Logos",
  circulodeamigos: "Círculo de Amigos",
  biblioteca: "Biblioteca Sophia",
};

export function isAnalyticsSite(id) {
  return ANALYTICS_SITE_IDS.includes(id);
}
