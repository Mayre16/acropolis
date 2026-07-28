import {
  CONFERENCIAS_CULTURALES,
  CURSOS_TALLERES,
  type OfertaCurso,
} from "@/lib/cursos-content";
import type { CmsCursosCard } from "@/lib/cms/types";

function stableCardId(title: string, prefix: string, index: number) {
  const slug = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug ? `${prefix}-${slug}` : `${prefix}-${index}`;
}

export function ofertaToCmsCard(
  c: OfertaCurso,
  prefix: string,
  index: number,
): CmsCursosCard {
  return {
    id: c.id ?? stableCardId(c.title, prefix, index),
    src: c.src,
    alt: c.alt,
    title: c.title,
    text: c.text,
    facilitador: c.facilitador,
    sede: c.sede,
    tag: c.tag,
    fechaApertura: c.horario,
    accessLabel: c.accessLabel,
    inscribeKind: c.inscribeKind,
    inscribeLabel: c.inscribeLabel,
    activo: c.recurrent ? true : undefined,
  };
}

export const CURSOS_TALLERES_DEFAULTS: CmsCursosCard[] = CURSOS_TALLERES.map(
  (c, i) => ofertaToCmsCard(c, "curso", i),
);

export const CONFERENCIAS_DEFAULTS: CmsCursosCard[] =
  CONFERENCIAS_CULTURALES.map((c, i) => ofertaToCmsCard(c, "conf", i));

export function mergeCursosCards(
  defaults: CmsCursosCard[],
  overrides?: CmsCursosCard[],
  hidden?: string[],
): CmsCursosCard[] {
  const hiddenSet = new Set(hidden ?? []);
  if (!overrides?.length) {
    return defaults.filter((d) => !hiddenSet.has(d.id));
  }
  const byId = new Map(overrides.map((c) => [c.id, c]));
  const merged: CmsCursosCard[] = [];
  for (const d of defaults) {
    if (hiddenSet.has(d.id)) continue;
    const o = byId.get(d.id);
    merged.push(o ? { ...d, ...o } : d);
  }
  for (const o of overrides) {
    if (hiddenSet.has(o.id)) continue;
    if (!defaults.some((d) => d.id === o.id)) merged.push(o);
  }
  return merged;
}

function ofertaDefaults(kind: "cursos" | "conf") {
  return kind === "cursos" ? CURSOS_TALLERES_DEFAULTS : CONFERENCIAS_DEFAULTS;
}

/** Tarjetas del catálogo base marcadas como ocultas (solo en modo edición). */
export function getHiddenOfertaCards(
  kind: "cursos" | "conf",
  overrides?: CmsCursosCard[],
  hidden?: string[],
): CmsCursosCard[] {
  const defaults = ofertaDefaults(kind);
  const hiddenSet = new Set(hidden ?? []);
  if (!hiddenSet.size) return [];
  const byId = new Map((overrides ?? []).map((c) => [c.id, c]));
  const result: CmsCursosCard[] = [];
  for (const id of hiddenSet) {
    const base = defaults.find((d) => d.id === id);
    if (base) result.push({ ...base, ...byId.get(id) });
  }
  return result;
}

export function findOfertaCard(
  kind: "cursos" | "conf",
  id: string,
  overrides?: CmsCursosCard[],
  hidden?: string[],
): CmsCursosCard | undefined {
  const visible = mergeCursosCards(ofertaDefaults(kind), overrides, hidden);
  const found = visible.find((c) => c.id === id);
  if (found) return found;
  return getHiddenOfertaCards(kind, overrides, hidden).find((c) => c.id === id);
}

export function isOfertaCardHidden(
  kind: "cursos" | "conf",
  id: string,
  hidden?: string[],
): boolean {
  return (hidden ?? []).includes(id);
}

export function parseOfertaSelectedId(
  id: string,
): { kind: "cursos" | "conf"; cardId: string } | null {
  const m = id.match(/^oferta-(cursos|conf):(.+)$/);
  if (!m) return null;
  return { kind: m[1] as "cursos" | "conf", cardId: m[2] };
}

export function ofertaSelectedId(kind: "cursos" | "conf", cardId: string) {
  return `oferta-${kind}:${cardId}`;
}

export function newCursosCardId(kind: "cursos" | "conf") {
  return `${kind}-nuevo-${Date.now().toString(36)}`;
}

/** Tarjeta definida en el catálogo base (código); no se puede eliminar, solo ocultar. */
export function isCatalogOfertaCard(
  id: string,
  kind: "cursos" | "conf",
): boolean {
  const defaults =
    kind === "cursos" ? CURSOS_TALLERES_DEFAULTS : CONFERENCIAS_DEFAULTS;
  return defaults.some((d) => d.id === id);
}
