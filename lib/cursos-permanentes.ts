import type { CmsCursosCard } from "@/lib/cms/types";

/** Texto del carrusel de cursos activos (home y oferta en /cursos). */
export const CURSOS_ACTIVOS_INTRO =
  "Cursos con horario fijo e inscripción abierta. Consulta fechas y sedes en cada tarjeta y escríbenos para más información.";

/** @deprecated Usar CURSOS_ACTIVOS_INTRO */
export const CURSOS_PERMANENTES_INTRO = CURSOS_ACTIVOS_INTRO;

/** Cursos con horario fijo y convocatoria abierta todo el año. */
export const CURSO_PERMANENTE_IDS = new Set([
  "curso-tai-chi-y-chi-kung",
  "curso-crochet",
  "curso-circulo-de-lectura",
  "curso-circulo-de-amigos",
]);

/** Activos en /cursos pero no en el carrusel del home (evita duplicar el bloque promocional). */
export const HOME_CURSOS_CAROUSEL_EXCLUDE_IDS = new Set([
  "curso-circulo-de-amigos",
]);
export function isCursoPermanente(id: string) {
  return CURSO_PERMANENTE_IDS.has(id);
}

/** ¿Va en «Cursos activos»? Respeta el CMS; si no hay valor, usa el catálogo base. */
export function isCursoActivo(card: CmsCursosCard) {
  if (card.activo === true) return true;
  if (card.activo === false) return false;
  return isCursoPermanente(card.id);
}

export function splitCursosOferta(cards: CmsCursosCard[]) {
  const permanentes = cards.filter((card) => isCursoActivo(card));
  const otros = cards.filter((card) => !isCursoActivo(card));
  return { permanentes, otros };
}
