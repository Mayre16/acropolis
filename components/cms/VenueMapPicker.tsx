"use client";

import { DrMapSvg } from "@/components/DrMapSvg";

type Props = {
  mapX?: number;
  mapY?: number;
  label?: string;
  hideLabel?: boolean;
  onPick: (x: number, y: number) => void;
};

export function VenueMapPicker({ mapX, mapY, label, hideLabel, onPick }: Props) {
  function onClick(e: React.MouseEvent<SVGRectElement>) {
    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const loc = pt.matrixTransform(ctm.inverse());
    onPick(Math.round(loc.x), Math.round(loc.y));
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-slate-700">
        Pin en el mapa RD — clic para colocar
      </p>
      <p className="text-xs text-slate-500">
        Las coordenadas X/Y son del dibujo del mapa (0–1000, 0–686), no latitud
        de Google. Use el botón «Desde Google Maps» o haga clic aquí.
      </p>
      <DrMapSvg
        gradientId="venuePickerFill"
        ariaLabel="Mapa RD — clic para ubicar pin"
        className="h-auto w-full cursor-crosshair rounded-lg border border-slate-200 bg-slate-50"
      >
        <rect
          x="0"
          y="0"
          width="1000"
          height="686"
          fill="transparent"
          onClick={onClick}
          className="cursor-crosshair"
        />
        {mapX != null && mapY != null ? (
          <g transform={`translate(${mapX} ${mapY})`} pointerEvents="none">
            <circle r="14" fill="#f39300" opacity="0.35" />
            <circle r="10" fill="#f39300" stroke="#fff" strokeWidth="2.5" />
            {label && !hideLabel ? (
              <text
                x="0"
                y="-18"
                textAnchor="middle"
                fill="#0f172a"
                fontSize="22"
                fontWeight="800"
              >
                {label}
              </text>
            ) : null}
          </g>
        ) : null}
      </DrMapSvg>
      {mapX != null && mapY != null ? (
        <p className="text-xs text-slate-600">
          Posición actual: X {mapX}, Y {mapY}
        </p>
      ) : (
        <p className="text-xs text-amber-800">Sin pin — haga clic en el mapa.</p>
      )}
    </div>
  );
}
