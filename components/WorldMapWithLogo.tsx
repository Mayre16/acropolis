import type { ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";

const WORLD_MAP_SRC = "/img/diplomado/landing/world-map-oina.webp";

type WorldMapWithLogoProps = {
  className?: string;
  mapClassName?: string;
  logo?: ReactNode;
  markers?: [number, number][];
};

function markerPosition(lat: number, lon: number) {
  return {
    left: `${((lon + 180) / 360) * 100}%`,
    top: `${((90 - lat) / 180) * 100}%`,
  };
}

/** Mapa mundial equirectangular; logo centrado opcional. */
export function WorldMapWithLogo({
  className,
  mapClassName,
  logo,
  markers = [],
}: WorldMapWithLogoProps) {
  return (
    <div
      className={cn("relative aspect-[2/1] w-full overflow-visible", className)}
      aria-hidden
    >
      <div
        className={cn(
          "absolute inset-0 overflow-hidden rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.22)]",
          mapClassName,
        )}
      >
        <Image
          src={WORLD_MAP_SRC}
          alt=""
          fill
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 42rem"
          unoptimized
        />

        {markers.length > 0 ? (
          <div className="world-map__markers pointer-events-none absolute inset-0">
            {markers.map(([lat, lon], i) => (
              <span
                key={`${lat}-${lon}-${i}`}
                className="world-map__dot absolute block rounded-full bg-white"
                style={{
                  ...markerPosition(lat, lon),
                  width: "7px",
                  height: "7px",
                  marginLeft: "-3.5px",
                  marginTop: "-3.5px",
                  animationDelay: `${(i % 12) * 0.22}s`,
                }}
              />
            ))}
          </div>
        ) : null}
      </div>

      {logo ? (
        <div className="pointer-events-none absolute inset-0 z-[3] flex items-center justify-center overflow-visible px-3 py-4 sm:py-5">
          {logo}
        </div>
      ) : null}
    </div>
  );
}
