"use client";

import { WorldMapWithLogo } from "@/components/WorldMapWithLogo";
import { DIPLOMADO_SCHOOL_MARKERS } from "@/lib/diplomado-school-markers";

function uniqueMarkers(): [number, number][] {
  const seen = new Set<string>();
  const out: [number, number][] = [];
  for (const [lat, lon] of DIPLOMADO_SCHOOL_MARKERS) {
    const key = `${lat.toFixed(1)},${lon.toFixed(1)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push([lat, lon]);
  }
  return out;
}

const MARKERS = uniqueMarkers();

export function SpinningGlobe() {
  return (
    <WorldMapWithLogo
      className="diplomado-world-map mx-auto mt-6 w-full max-w-[360px] lg:max-w-[400px]"
      markers={MARKERS}
    />
  );
}
