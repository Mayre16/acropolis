"use client";

import { Suspense, type ReactNode } from "react";
import { CmsPageMediaWrap } from "@/components/cms/CmsPageMediaWrap";
import { FilosofiaCmsEditProvider } from "@/components/filosofia/cms/FilosofiaCmsEditContext";

export function DiplomadoPageShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <FilosofiaCmsEditProvider>
        <CmsPageMediaWrap pageId="diplomado">{children}</CmsPageMediaWrap>
      </FilosofiaCmsEditProvider>
    </Suspense>
  );
}
