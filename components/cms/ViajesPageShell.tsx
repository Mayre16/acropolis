"use client";

import { Suspense, type ReactNode } from "react";
import { CmsPageMediaWrap } from "@/components/cms/CmsPageMediaWrap";
import { ViajesCmsEditProvider } from "@/components/cms/ViajesCmsEditContext";

export function ViajesPageShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <ViajesCmsEditProvider>
        <CmsPageMediaWrap pageId="viajes">{children}</CmsPageMediaWrap>
      </ViajesCmsEditProvider>
    </Suspense>
  );
}
