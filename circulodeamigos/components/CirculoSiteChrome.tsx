"use client";

import type { ReactNode } from "react";
import { CirculoSiteHeader } from "@/components/CirculoSiteHeader";
import { CirculoInscripcionProvider } from "@/components/CirculoInscripcionProvider";

export function CirculoSiteChrome({ children }: { children: ReactNode }) {
  return (
    <CirculoInscripcionProvider>
      <CirculoSiteHeader />
      <div className="h-2 shrink-0 bg-white sm:h-3" aria-hidden="true" />
      <main className="flex flex-1 flex-col">{children}</main>
    </CirculoInscripcionProvider>
  );
}
