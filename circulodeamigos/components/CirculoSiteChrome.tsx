"use client";

import type { ReactNode } from "react";
import { CirculoSiteHeader } from "@/components/CirculoSiteHeader";

export function CirculoSiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <CirculoSiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
