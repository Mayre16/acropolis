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
]);
export function isCursoPermanente(id: string) {
  return CURSO_PERMANENTE_IDS.has(id);
}

export function splitCursosOferta(cards: CmsCursosCard[]) {
  const permanentes = cards.filter((card) => isCursoPermanente(card.id));
  const otros = cards.filter((card) => !isCursoPermanente(card.id));
  return { permanentes, otros };
}
