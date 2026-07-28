"use client";

import { Suspense, type ReactNode } from "react";
import { CmsPageMediaWrap } from "@/components/cms/CmsPageMediaWrap";
import { InstitutionalPageCmsEditProvider } from "@/components/cms/InstitutionalPageCmsEditContext";

export function RelacionesPageShell({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <InstitutionalPageCmsEditProvider pageKey="relaciones">
        <CmsPageMediaWrap pageId="relaciones">{children}</CmsPageMediaWrap>
      </InstitutionalPageCmsEditProvider>
    </Suspense>
  );
}
