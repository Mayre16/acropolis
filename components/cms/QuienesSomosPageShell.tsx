"use client";

import { Suspense, type ReactNode } from "react";
import { CmsPageMediaWrap } from "@/components/cms/CmsPageMediaWrap";
import { InstitutionalPageCmsEditProvider } from "@/components/cms/InstitutionalPageCmsEditContext";

export function QuienesSomosPageShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <InstitutionalPageCmsEditProvider pageKey="quienesSomos">
        <CmsPageMediaWrap pageId="quienes-somos">{children}</CmsPageMediaWrap>
      </InstitutionalPageCmsEditProvider>
    </Suspense>
  );
}
