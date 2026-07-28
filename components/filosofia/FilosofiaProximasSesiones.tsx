"use client";

import { Suspense } from "react";
import { FilosofiaProximasSesionesBody } from "@/components/filosofia/FilosofiaAgendaSections";

export function FilosofiaProximasSesiones() {
  return (
    <Suspense
      fallback={
        <div className="border-t border-na-heket/10 py-16 text-center text-na-muted">
          Cargando agenda…
        </div>
      }
    >
      <FilosofiaProximasSesionesBody />
    </Suspense>
  );
}
