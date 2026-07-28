"use client";

import { Suspense, type ReactNode } from "react";
import { CmsPageMediaWrap } from "@/components/cms/CmsPageMediaWrap";
import { EsferaCmsEditProvider } from "@/components/cms/EsferaCmsEditContext";

export function EsferaPageShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <EsferaCmsEditProvider>
        <CmsPageMediaWrap pageId="esfera">{children}</CmsPageMediaWrap>
      </EsferaCmsEditProvider>
    </Suspense>
  );
}
