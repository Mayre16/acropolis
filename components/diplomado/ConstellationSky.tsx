"use client";

import { useEffect, useState } from "react";
import {
  CONSTELLATION_SEGMENT_MS,
  HERO_CONSTELLATION_SEGMENTS,
  HERO_CONSTELLATION_STARS,
  SKY_AMBIENT_STARS,
  SKY_VIEW_BOX,
  totalConstellationCycleMs,
  totalConstellationDrawMs,
} from "@/lib/diplomado-constellations";

const DRAW_MS = totalConstellationDrawMs();
const CYCLE_MS = totalConstellationCycleMs();

export function ConstellationSky() {
  const [cycle, setCycle] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const id = window.setInterval(() => setCycle((c) => c + 1), CYCLE_MS);
    return () => clearInterval(id);
  }, [reducedMotion]);

  const timingStyle = {
    ["--draw-duration"]: `${CONSTELLATION_SEGMENT_MS}ms`,
    ["--hold-start"]: `${DRAW_MS}ms`,
  } as React.CSSProperties;

  return (
    <svg
      key={reducedMotion ? "static" : `sky-${cycle}`}
      className={`constellation-hero__sky pointer-events-none absolute inset-0 z-[3] h-full w-full ${
        reducedMotion ? "constellation-hero__sky--static" : ""
      }`}
      viewBox={SKY_VIEW_BOX}
      preserveAspectRatio="none"
      aria-hidden
    >
      {HERO_CONSTELLATION_SEGMENTS.map((seg) => (
        <path
          key={seg.key}
          d={`M ${seg.x1} ${seg.y1} L ${seg.x2} ${seg.y2}`}
          pathLength={1}
          vectorEffect="non-scaling-stroke"
          className="constellation-hero__line constellation-hero__line--draw"
          style={
            reducedMotion
              ? timingStyle
              : ({
                  ...timingStyle,
                  ["--draw-delay"]: `${seg.delayMs}ms`,
                } as React.CSSProperties)
          }
        />
      ))}

      {HERO_CONSTELLATION_STARS.map((star) => (
        <circle
          key={`${star.constellationId}-${star.id}`}
          cx={star.x}
          cy={star.y}
          r={star.r}
          className={`constellation-hero__star ${
            star.bright ? "constellation-hero__star--bright" : ""
          }`}
          style={
            reducedMotion
              ? undefined
              : ({ ["--reveal-delay"]: `${star.revealMs}ms` } as React.CSSProperties)
          }
        />
      ))}

      {SKY_AMBIENT_STARS.map((star, i) => (
        <circle
          key={`ambient-${i}`}
          cx={star.x}
          cy={star.y}
          r={star.r}
          className="constellation-hero__star constellation-hero__star--ambient"
          style={{ animationDelay: `${star.twinkleDelay}s` }}
        />
      ))}
    </svg>
  );
}
