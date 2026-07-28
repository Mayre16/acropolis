/**
 * Cielo del hero: Osa Mayor y Orión (viewBox 0–100).
 * Estrellas pequeñas + trazado de líneas al cargar.
 */

export type DiplomadoStar = {
  id: string;
  x: number;
  y: number;
  r: number;
  bright?: boolean;
  twinkleDelay?: number;
};

export type DiplomadoConstellation = {
  id: string;
  stars: DiplomadoStar[];
  segments: [string, string][];
};

export type ConstellationSegmentDraw = {
  key: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  delayMs: number;
};

export type ConstellationStarDraw = DiplomadoStar & {
  constellationId: string;
  revealMs: number;
};

/** Osa Mayor (Gran Carro). */
export const URSA_MAJOR: DiplomadoConstellation = {
  id: "ursa-major",
  stars: [
    { id: "dubhe", x: 16, y: 9, r: 0.65 },
    { id: "merak", x: 21.5, y: 8, r: 0.55 },
    { id: "phecda", x: 23.5, y: 14.5, r: 0.58 },
    { id: "megrez", x: 18, y: 15.5, r: 0.52 },
    { id: "alioth", x: 27, y: 16.5, r: 0.58 },
    { id: "mizar", x: 32, y: 18.5, r: 0.55 },
    { id: "alkaid", x: 38, y: 20.5, r: 0.62, bright: true },
  ],
  segments: [
    ["dubhe", "merak"],
    ["merak", "phecda"],
    ["phecda", "megrez"],
    ["megrez", "dubhe"],
    ["megrez", "alioth"],
    ["alioth", "mizar"],
    ["mizar", "alkaid"],
  ],
};

/** Orión. */
export const ORION: DiplomadoConstellation = {
  id: "orion",
  stars: [
    { id: "betelgeuse", x: 66, y: 11, r: 0.72, bright: true },
    { id: "bellatrix", x: 75, y: 12.5, r: 0.52 },
    { id: "alnitak", x: 68.5, y: 18.5, r: 0.52 },
    { id: "alnilam", x: 72, y: 18.5, r: 0.65, bright: true },
    { id: "mintaka", x: 75.5, y: 18.5, r: 0.52 },
    { id: "sword1", x: 72, y: 22, r: 0.48 },
    { id: "sword2", x: 72, y: 24.5, r: 0.45 },
    { id: "saiph", x: 67.5, y: 25, r: 0.5 },
    { id: "rigel", x: 76.5, y: 27.5, r: 0.68, bright: true },
  ],
  segments: [
    ["betelgeuse", "bellatrix"],
    ["betelgeuse", "alnitak"],
    ["bellatrix", "mintaka"],
    ["alnitak", "alnilam"],
    ["alnilam", "mintaka"],
    ["alnilam", "sword1"],
    ["sword1", "sword2"],
    ["alnitak", "saiph"],
    ["mintaka", "rigel"],
    ["saiph", "rigel"],
  ],
};

export const HERO_SKY_CONSTELLATIONS = [URSA_MAJOR, ORION] as const;

export const SKY_AMBIENT_STARS: readonly {
  x: number;
  y: number;
  r: number;
  twinkleDelay: number;
}[] = [
  { x: 6, y: 22, r: 0.32, twinkleDelay: 0.15 },
  { x: 48, y: 8, r: 0.34, twinkleDelay: 0.55 },
  { x: 52, y: 22, r: 0.32, twinkleDelay: 1.05 },
  { x: 48, y: 32, r: 0.34, twinkleDelay: 0.35 },
  { x: 82, y: 38, r: 0.32, twinkleDelay: 1.25 },
  { x: 22, y: 42, r: 0.34, twinkleDelay: 0.75 },
  { x: 92, y: 48, r: 0.32, twinkleDelay: 1.45 },
  { x: 35, y: 6, r: 0.3, twinkleDelay: 0.95 },
  { x: 58, y: 32, r: 0.32, twinkleDelay: 0.25 },
  { x: 12, y: 35, r: 0.3, twinkleDelay: 1.35 },
];

export const SKY_VIEW_BOX = "0 0 100 100";

export const CONSTELLATION_SEGMENT_MS = 380;
export const CONSTELLATION_HOLD_MS = 8000;

function buildDrawData(): {
  segments: ConstellationSegmentDraw[];
  stars: ConstellationStarDraw[];
} {
  const segments: ConstellationSegmentDraw[] = [];
  const revealMs = new Map<string, number>();

  for (const constellation of HERO_SKY_CONSTELLATIONS) {
    const starMap = Object.fromEntries(constellation.stars.map((s) => [s.id, s]));
    let localOffset = 0;

    for (const [fromId, toId] of constellation.segments) {
      const from = starMap[fromId];
      const to = starMap[toId];
      if (!from || !to) continue;

      const starKey = (id: string) => `${constellation.id}:${id}`;

      if (!revealMs.has(starKey(fromId))) {
        revealMs.set(starKey(fromId), localOffset);
      }
      const arriveAt = localOffset + CONSTELLATION_SEGMENT_MS;
      const prevTo = revealMs.get(starKey(toId));
      revealMs.set(starKey(toId), prevTo === undefined ? arriveAt : Math.min(prevTo, arriveAt));

      segments.push({
        key: `${constellation.id}-${fromId}-${toId}`,
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        delayMs: localOffset,
      });

      localOffset += CONSTELLATION_SEGMENT_MS;
    }
  }

  const stars = HERO_SKY_CONSTELLATIONS.flatMap((c) =>
    c.stars.map((s) => ({
      ...s,
      constellationId: c.id,
      revealMs: revealMs.get(`${c.id}:${s.id}`) ?? 0,
    })),
  );

  return { segments, stars };
}

const DRAW_DATA = buildDrawData();

export const HERO_CONSTELLATION_SEGMENTS = DRAW_DATA.segments;
export const HERO_CONSTELLATION_STARS = DRAW_DATA.stars;

export function totalConstellationDrawMs(): number {
  return Math.max(
    ...HERO_SKY_CONSTELLATIONS.map((c) => c.segments.length * CONSTELLATION_SEGMENT_MS),
  );
}

export function totalConstellationCycleMs(): number {
  return totalConstellationDrawMs() + CONSTELLATION_HOLD_MS;
}
