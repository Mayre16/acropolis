"use client";

import type { ReactNode } from "react";
import { CivisLegacyHashRedirect } from "@/components/CivisLegacyHashRedirect";
import { CivisSiteHeader } from "@/components/CivisSiteHeader";

export function CivisSiteChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <CivisLegacyHashRedirect />
      <CivisSiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
    </>
  );
}
