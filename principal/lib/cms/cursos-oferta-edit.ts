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
