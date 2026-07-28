import { DR_MAP_BOUNDS, DR_MAP_PROVINCES } from "@/lib/dr-map-provinces";

import { DR_MAP_VIEWBOX } from "@/lib/dr-map-svg";

import type { ReactNode } from "react";



type Props = {

  gradientId?: string;

  ariaLabel?: string;

  className?: string;

  children?: ReactNode;

};



export function DrMapSvg({

  gradientId = "drFill",

  ariaLabel = "Mapa de República Dominicana",

  className = "h-auto w-full",

  children,

}: Props) {

  return (

    <svg viewBox={DR_MAP_VIEWBOX} role="img" aria-label={ariaLabel} className={className}>

      <defs>

        <linearGradient

          id={gradientId}

          x1="0"

          y1="0"

          x2="1000"

          y2="686"

          gradientUnits="userSpaceOnUse"

        >

          <stop offset="0%" stopColor="#0a7264" />

          <stop offset="100%" stopColor="#009485" />

        </linearGradient>

      </defs>

      <g

        fill={`url(#${gradientId})`}

        stroke="#ffffff"

        strokeWidth="1.1"

        strokeLinejoin="round"

      >

        {DR_MAP_PROVINCES.flatMap((province) =>

          province.paths.map((d, index) => (

            <path key={`${province.id}-${index}`} d={d} />

          )),

        )}

      </g>

      {children}

    </svg>

  );

}



export { DR_MAP_BOUNDS, DR_MAP_PROVINCES, DR_MAP_VIEWBOX };


