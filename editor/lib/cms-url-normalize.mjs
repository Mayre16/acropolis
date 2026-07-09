/** Normaliza URLs de uploads a rutas relativas /uploads/{site}/file */

export function normalizeUploadUrl(value) {
  if (typeof value !== "string") return value;
  const m = value.match(/\/uploads\/(acropolis|civis|editorial|circulodeamigos)\/[^\s"?#'"]+/);
  return m ? m[0] : value;
}

export function normalizeCmsValue(value) {
  if (typeof value === "string") return normalizeUploadUrl(value);
  if (Array.isArray(value)) return value.map(normalizeCmsValue);
  if (value && typeof value === "object") {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = normalizeCmsValue(v);
    }
    return out;
  }
  return value;
}

export function normalizeCmsDocument(doc) {
  return normalizeCmsValue(doc);
}
